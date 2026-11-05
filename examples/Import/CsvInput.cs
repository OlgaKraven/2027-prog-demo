using System.Globalization;
using System.Security.Cryptography;
using System.Text;
using Microsoft.VisualBasic.FileIO;

internal static class CsvInput
{
    public static Dictionary<string, List<Dictionary<string, string>>> ReadVariant(
        string input, Dictionary<string, string> hashes)
    {
        var tables = new Dictionary<string, List<Dictionary<string, string>>>();
        foreach (var name in new[] { "products", "stock", "sizes", "users", "orders", "items" })
        {
            var file = Path.Combine(input, name + ".csv");
            if (!File.Exists(file)) throw new InvalidDataException("Не найден " + file);
            hashes[name + ".csv"] = Convert.ToHexString(SHA256.HashData(File.ReadAllBytes(file))).ToLowerInvariant();
            tables[name] = ReadCsv(file);
            if (name != "sizes") tables[name] = Ordered(tables[name], name);
        }

        var products = tables["products"].ToDictionary(x => Id(x["id"]));
        var stock = tables["stock"].ToDictionary(x => Id(x["id"]));
        var users = tables["users"].ToDictionary(x => Id(x["id"]));
        var orders = tables["orders"].ToDictionary(x => Id(x["id"]));
        var dates = new Dictionary<int, DateTime>();
        foreach (var (id, order) in orders)
        {
            if (!DateTime.TryParseExact(order["date"], "yyyy-MM-dd'T'HH:mm:ss", CultureInfo.InvariantCulture,
                DateTimeStyles.None, out var date))
                throw new InvalidDataException($"orders.csv, заказ {id}: дата должна иметь вид 2026-04-02T00:00:00.");
            if (!bool.TryParse(order["stock_accounted"], out var accounted) || accounted)
                throw new InvalidDataException($"orders.csv, заказ {id}: исходная история должна иметь stock_accounted=False.");
            dates[id] = date;
            if (!users.ContainsKey(Id(order["user_id"]))) throw new InvalidDataException($"Неизвестный клиент заказа {id}.");
        }

        Dictionary<string, string> Row(params (string Key, string Value)[] values) => values.ToDictionary(x => x.Key, x => x.Value);
        var result = new Dictionary<string, List<Dictionary<string, string>>>
        {
            ["Products"] = tables["products"].Select(p => Row(
                ("Категория", p["category"]), ("Подкатегория", p["subcategory"]),
                ("Производство", p["manufacturer"]), ("Наименование товара", p["name"]),
                ("Изображение", p["image"]), ("Состав", p["composition"]),
                ("Описание", p["description"]), ("Цена", p["price"]))).ToList(),
            ["Sizes"] = tables["sizes"].Select(s => Row(("Размер", s["size"]))).ToList(),
            ["Users"] = tables["users"].Select(u =>
            {
                if (string.Join(' ', u["last_name"], u["first_name"], u["patronymic"]) != u["full_name"])
                    throw new InvalidDataException("users.csv: ФИО не совпадает с тремя частями имени для " + u["id"]);
                return Row(("Логин", u["login"]), ("Фамилия", u["last_name"]), ("Имя", u["first_name"]),
                    ("Отчетсво", u["patronymic"]), ("Роль", u["role"]));
            }).ToList(),
            ["Stock_Items"] = tables["stock"].Select(s =>
            {
                if (!products.TryGetValue(Id(s["product_id"]), out var p))
                    throw new InvalidDataException("stock.csv: неизвестная модель для позиции " + s["id"]);
                return Row(("Наименование товара", p["name"]), ("Производство", p["manufacturer"]),
                    ("Размер", s["size"]), ("Количество доступное для заказа", s["available"]));
            }).ToList(),
            ["Orders"] = []
        };
        var usedOrders = new HashSet<int>();
        foreach (var item in tables["items"])
        {
            int orderId = Id(item["order_id"]);
            if (!orders.TryGetValue(orderId, out var order) || !stock.TryGetValue(Id(item["stock_id"]), out var position))
                throw new InvalidDataException("items.csv: неизвестный заказ или позиция в строке " + item["id"]);
            var model = products[Id(position["product_id"])];
            var user = users[Id(order["user_id"])];
            result["Orders"].Add(Row(("Номер заказа", orderId.ToString(CultureInfo.InvariantCulture)),
                ("Дата заказа", dates[orderId].ToOADate().ToString(CultureInfo.InvariantCulture)), ("ФИО", user["full_name"]),
                ("Наименование товара", model["name"]), ("Производство", model["manufacturer"]),
                ("Размер", position["size"]), ("Количество", item["quantity"]), ("Цена за единицу", item["price"])));
            usedOrders.Add(orderId);
        }
        if (usedOrders.Count != orders.Count) throw new InvalidDataException("orders.csv содержит заказ без строк в items.csv.");
        return result;
    }

    private static int Id(string value) => int.TryParse(value, NumberStyles.None, CultureInfo.InvariantCulture, out var id) && id > 0
        ? id : throw new InvalidDataException("Идентификатор должен быть положительным целым: " + value);

    private static List<Dictionary<string, string>> Ordered(List<Dictionary<string, string>> rows, string source)
    {
        var ordered = rows.OrderBy(x => Id(x["id"])).ToList();
        if (!ordered.Select(x => Id(x["id"])).SequenceEqual(Enumerable.Range(1, ordered.Count)))
            throw new InvalidDataException(source + ".csv: id должны быть уникальными и образовывать последовательность от 1 без пропусков.");
        return ordered;
    }

    private static List<Dictionary<string, string>> ReadCsv(string path)
    {
        using var parser = new TextFieldParser(path, Encoding.UTF8, true)
        {
            HasFieldsEnclosedInQuotes = true,
            TrimWhiteSpace = false
        };
        parser.SetDelimiters(",");
        var headers = parser.ReadFields() ?? throw new InvalidDataException("Пустой CSV: " + path);
        if (headers.Length != headers.Distinct(StringComparer.Ordinal).Count())
            throw new InvalidDataException("Повтор заголовка CSV: " + path);
        var rows = new List<Dictionary<string, string>>();
        try
        {
            while (!parser.EndOfData)
            {
                var fields = parser.ReadFields()!;
                if (fields.Length != headers.Length) throw new InvalidDataException("Число полей CSV не совпадает с заголовком: " + path);
                rows.Add(headers.Select((name, i) => (name, i)).ToDictionary(x => x.name, x => fields[x.i]));
            }
        }
        catch (MalformedLineException e) { throw new InvalidDataException("Некорректная CSV-строка в " + path, e); }
        return rows;
    }
}
