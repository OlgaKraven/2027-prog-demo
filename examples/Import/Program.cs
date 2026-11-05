using System.Globalization;
using System.IO.Compression;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Xml.Linq;

// No Excel installation, Python or additional NuGet package is needed.
try
{
    string Ask(int index,string prompt,string fallback="")
    {
        if(args.Length>index)return args[index];
        Console.WriteLine(prompt);
        string value=Console.ReadLine()?.Trim().Trim('"')??"";
        return value.Length==0?fallback:value;
    }
    var input=Path.GetFullPath(Ask(0,"Папка с пятью распакованными XLSX или шестью CSV авторского варианта:"));
    var output=Path.GetFullPath(Ask(1,"Папка для результата:",Path.Combine(input,"Prepared")));
    var database=Ask(2,"Имя пустой учебной базы, созданной в конструкторе (Enter — prog_demo_student):","prog_demo_student");
    if(!Regex.IsMatch(database,"^[a-z][a-z0-9_]{0,60}$"))throw new InvalidOperationException("Имя базы: латинская буква, затем строчные латинские буквы, цифры и _. Максимум 61 символ.");
    var data=new Dictionary<string,List<Dictionary<string,string>>>();
    var hashes=new Dictionary<string,string>();
    if(File.Exists(Path.Combine(input,"products.csv")))data=CsvInput.ReadVariant(input,hashes);
    else foreach(var name in new[]{"Products","Stock_Items","Sizes","Users","Orders"})
    {
        string file=Path.Combine(input,name+"_import.xlsx");
        if(!File.Exists(file))throw new InvalidOperationException("Не найден "+file+". Укажите папку, непосредственно содержащую XLSX, не внешний ZIP.");
        data[name]=ReadXlsx(file);
        hashes[name+"_import.xlsx"]=Convert.ToHexString(SHA256.HashData(File.ReadAllBytes(file))).ToLowerInvariant();
    }
    var products=data["Products"];var stock=data["Stock_Items"];var users=data["Users"];var orders=data["Orders"];
    var categories=products.Select(x=>x["Категория"]).Distinct().Order(StringComparer.Ordinal).ToList();
    var subcategories=products.Select(x=>(x["Категория"],x["Подкатегория"])).Distinct().OrderBy(x=>x.Item1,StringComparer.Ordinal).ThenBy(x=>x.Item2,StringComparer.Ordinal).ToList();
    var manufacturers=products.Select(x=>x["Производство"]).Distinct().Order(StringComparer.Ordinal).ToList();
    var roles=new[]{"Администратор","Менеджер","Авторизованный пользователь"};
    var sizes=data["Sizes"].Select(x=>SizeKey(x["Размер"])).ToList();
    var corrections=new List<object>();
    int Model(string name,string manufacturer,string source,int row)
    {
        string original=name;
        if(name=="Черные туфли в классическом стиле"&&manufacturer=="Барбари")name="Черные туфли в классическом стиле — база для деловых образов";
        var candidates=products.Select((p,i)=>(p,i)).Where(x=>Key(x.p["Наименование товара"])==Key(name)&&Key(x.p["Производство"])==Key(manufacturer)).ToList();
        if(candidates.Count!=1)throw new InvalidOperationException($"{source}, строка {row}: для «{original} / {manufacturer}» найдено моделей: {candidates.Count}. Импорт остановлен; неоднозначные строки не пропускаются.");
        if(candidates[0].p["Наименование товара"]!=original)corrections.Add(new{source,row,original,matched=candidates[0].p["Наименование товара"]});
        return candidates[0].i+1;
    }
    // Structure is created in the DB designer. This file contains data only.
    var sql=new StringBuilder($"USE `{database}`;\nSTART TRANSACTION;\n");
    void Row(string table,string columns,params object?[] values)=>sql.Append("INSERT INTO ").Append(table).Append('(').Append(columns).Append(") VALUES(").AppendJoin(',',values.Select(Literal)).AppendLine(");");
    for(int i=0;i<roles.Length;i++)Row("roles","id,name",i+1,roles[i]);
    for(int i=0;i<users.Count;i++)
    {
        var u=users[i];int role=Array.IndexOf(roles,u["Роль"])+1;
        if(role==0)throw new InvalidOperationException("Неизвестная роль: "+u["Роль"]);
        Row("users","id,login,last_name,first_name,patronymic,role_id",i+1,u["Логин"],u["Фамилия"],u["Имя"],u["Отчетсво"],role);
    }
    for(int i=0;i<categories.Count;i++)Row("categories","id,name",i+1,categories[i]);
    for(int i=0;i<subcategories.Count;i++)Row("subcategories","id,category_id,name",i+1,categories.IndexOf(subcategories[i].Item1)+1,subcategories[i].Item2);
    for(int i=0;i<manufacturers.Count;i++)Row("manufacturers","id,name",i+1,manufacturers[i]);
    for(int i=0;i<products.Count;i++)
    {
        var p=products[i];
        Row("products","id,subcategory_id,manufacturer_id,name,image,composition,description,price",i+1,subcategories.IndexOf((p["Категория"],p["Подкатегория"]))+1,manufacturers.IndexOf(p["Производство"])+1,p["Наименование товара"],p["Изображение"],p["Состав"],p["Описание"],Number(p["Цена"]));
    }
    for(int i=0;i<sizes.Count;i++)Row("sizes","id,label,sort_value",i+1,sizes[i],Number(sizes[i]));
    var stockKeys=new Dictionary<(int,string),int>();
    for(int i=0;i<stock.Count;i++)
    {
        var s=stock[i];int model=Model(s["Наименование товара"],s["Производство"],"Stock_Items",i+2);string size=SizeKey(s["Размер"]);int sizeId=sizes.IndexOf(size)+1;
        if(sizeId==0||!stockKeys.TryAdd((model,size),i+1))throw new InvalidOperationException("Неизвестный размер или дублирующаяся размерная позиция, строка "+(i+2));
        Row("stock_items","id,product_id,size_id,available",i+1,model,sizeId,Integer(s["Количество доступное для заказа"],"Остаток",0));
    }
    var headers=new Dictionary<int,(DateTime,int)>();
    var lines=new List<object?[]>();
    for(int i=0;i<orders.Count;i++)
    {
        var o=orders[i];int id=Integer(o["Номер заказа"],"Номер заказа",1);var date=DateTime.FromOADate((double)Number(o["Дата заказа"]));
        var customers=users.Select((u,n)=>(u,n)).Where(x=>string.Join(' ',x.u["Фамилия"],x.u["Имя"],x.u["Отчетсво"])==o["ФИО"]).ToList();
        if(customers.Count!=1)throw new InvalidOperationException("Клиент заказа не найден однозначно: "+o["ФИО"]);
        int userId=customers[0].n+1;
        if(headers.TryGetValue(id,out var header)&&header!=(date,userId))throw new InvalidOperationException("Несогласованная дата/клиент в заказе "+id);
        headers[id]=(date,userId);
        int model=Model(o["Наименование товара"],o["Производство"],"Orders",i+2);
        if(!stockKeys.TryGetValue((model,SizeKey(o["Размер"])),out int position))throw new InvalidOperationException("Нет размерной позиции в строке заказа "+(i+2));
        lines.Add([i+1,id,position,Integer(o["Количество"],"Количество",1),Number(o["Цена за единицу"])]);
    }
    foreach(var (id,h) in headers)Row("orders","id,order_date,user_id,created_by,stock_accounted",id,h.Item1,h.Item2,h.Item2,false);
    foreach(var line in lines)Row("order_items","id,order_id,stock_id,quantity,unit_price",line);
    sql.AppendLine("COMMIT;");
    Directory.CreateDirectory(output);
    // Existing results are not overwritten accidentally.
    string result=Path.Combine(output,"data.sql");
    using(var f=new FileStream(result,FileMode.CreateNew,FileAccess.Write))using(var writer=new StreamWriter(f,new UTF8Encoding(false)))writer.Write(sql.ToString().Replace("\r\n","\n"));
    File.WriteAllText(Path.Combine(output,"import-report.json"),JsonSerializer.Serialize(new{products=products.Count,stock=stock.Count,sizes=sizes.Count,users=users.Count,orders=headers.Count,lines=lines.Count,corrections,sha256=hashes},new JsonSerializerOptions{WriteIndented=true}),new UTF8Encoding(false));
    Console.WriteLine($"Готово: {products.Count} модель, {stock.Count} позиции, {sizes.Count} размеров, {users.Count} пользователей, {headers.Count} заказов, {lines.Count} строк.");
    Console.WriteLine("SQL: "+result+"\nВходные файлы не изменены. Импортируйте data.sql в пустые таблицы базы, созданные конструктором; повторно поверх заполненной базы не запускайте.");
}
catch(Exception e) when(e is IOException or InvalidOperationException or FormatException or KeyNotFoundException or InvalidDataException or ArgumentException)
{
    Console.Error.WriteLine("Подготовка не выполнена: "+e.Message);
    Environment.ExitCode=1;
}
if(args.Length==0){Console.WriteLine("Нажмите Enter для закрытия.");Console.ReadLine();}

static int Integer(string s,string field,int minimum)
{
    decimal value=Number(s);
    if(value!=decimal.Truncate(value)||value<minimum||value>int.MaxValue)throw new InvalidOperationException($"{field}: требуется целое число не меньше {minimum}; получено {s}.");
    return (int)value;
}
static decimal Number(string s)=>decimal.Parse(s,CultureInfo.InvariantCulture);
static string SizeKey(string s)=>Number(s).ToString("0.#",CultureInfo.InvariantCulture);
static string Key(string s)=>Regex.Replace(s.Trim(),@"\s+"," ");
static string Literal(object? value)=>value switch
{
    null=>"NULL",bool b=>b?"1":"0",int n=>n.ToString(CultureInfo.InvariantCulture),decimal n=>n.ToString(CultureInfo.InvariantCulture),
    DateTime date=>"'"+date.ToString("yyyy-MM-dd HH:mm:ss",CultureInfo.InvariantCulture)+"'",
    _=>"CONVERT(X'"+Convert.ToHexString(Encoding.UTF8.GetBytes(value.ToString()!))+"' USING utf8mb4)"
};
static List<Dictionary<string,string>> ReadXlsx(string path)
{
    using var archive=ZipFile.OpenRead(path);
    XNamespace ns="http://schemas.openxmlformats.org/spreadsheetml/2006/main";
    var strings=new List<string>();
    var entry=archive.GetEntry("xl/sharedStrings.xml");
    if(entry is not null){using var stream=entry.Open();strings=XDocument.Load(stream).Root!.Elements(ns+"si").Select(x=>string.Concat(x.Descendants(ns+"t").Select(t=>t.Value))).ToList();}
    var sheet=archive.GetEntry("xl/worksheets/sheet1.xml")??throw new InvalidDataException("Первый лист не найден: "+path);
    using var input=sheet.Open();var rows=XDocument.Load(input).Descendants(ns+"row").Select(row=>
    {
        var cells=new SortedDictionary<int,string>();
        foreach(var cell in row.Elements(ns+"c"))
        {
            string address=cell.Attribute("r")?.Value??"";int column=0;
            foreach(char c in address.TakeWhile(char.IsLetter))column=column*26+c-'A'+1;
            string value=cell.Element(ns+"v")?.Value??"";
            if(cell.Attribute("t")?.Value=="s")value=strings[int.Parse(value,CultureInfo.InvariantCulture)];
            if(cell.Attribute("t")?.Value=="inlineStr")value=string.Concat(cell.Descendants(ns+"t").Select(t=>t.Value));
            cells[column-1]=value;
        }
        return cells;
    }).ToList();
    if(rows.Count==0)throw new InvalidDataException("Пустой лист: "+path);
    var headers=rows[0];
    return rows.Skip(1).Where(r=>r.Values.Any(v=>v.Length>0)).Select(r=>headers.ToDictionary(h=>h.Value,h=>r.GetValueOrDefault(h.Key,""))).ToList();
}
