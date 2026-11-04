using MySqlConnector;

namespace ProgDemo.WinForms;

public class PageForm : Form
{
    public PageForm(string title, int width=1050, int height=760)
    {
        SuspendLayout();
        Text="Чудо Обувь — "+title;
        Font=new Font("Calibri",11);
        BackColor=Color.White;
        ForeColor=Color.FromArgb(28,28,28);
        AutoScaleDimensions=new SizeF(96,96);
        AutoScaleMode=AutoScaleMode.Dpi;
        ClientSize=new Size(width,height);
        MinimumSize=new Size(600,480);
        StartPosition=FormStartPosition.CenterScreen;
        var icon=Path.Combine(AppContext.BaseDirectory,"Assets","Чудо Обувь.ico");
        if(File.Exists(icon))Icon=new Icon(icon);
    }
    protected override void OnLoad(EventArgs e)
    {
        ResumeLayout(true);
        base.OnLoad(e);
        var area=Screen.FromControl(this).WorkingArea;
        Size=new Size(Math.Min(Width,area.Width),Math.Min(Height,area.Height));
    }
}
public static class Ui
{
    public static Color Soft=ColorTranslator.FromHtml("#D2F6E7");
    public static Color Accent=ColorTranslator.FromHtml("#70B2AF");
    public static Button Button(string text,Action action,bool primary=false)
    {
        var b=new Button {Text=text,AutoSize=true,MinimumSize=new Size(100,38),Padding=new Padding(8),Margin=new Padding(5),BackColor=primary?Accent:Soft,ForeColor=Color.FromArgb(20,38,38),FlatStyle=FlatStyle.Flat};
        b.Click+=(_,_)=>Guard(action);
        return b;
    }
    public static void Guard(Action action)
    {
        try{action();}
        catch(MySqlException){MessageBox.Show("Не удалось выполнить операцию с базой. Проверьте, запущен ли MySQL, импортирована ли база и верны ли настройки подключения. Изменения не подтверждены; обновите каталог перед повтором.","Ошибка базы данных",MessageBoxButtons.OK,MessageBoxIcon.Error);}
        catch(Exception e) when(e is InvalidOperationException or UnauthorizedAccessException or ArgumentException or OverflowException)
        {MessageBox.Show(e.Message,"Действие не выполнено",MessageBoxButtons.OK,MessageBoxIcon.Warning);}
    }
    public static Image Picture(string filename)
    {
        var root=Path.Combine(AppContext.BaseDirectory,"Assets");
        var path=Path.Combine(root,"Images",Path.GetFileName(filename));
        if(!File.Exists(path))path=Path.Combine(root,"picture.png");
        if(!File.Exists(path))return new Bitmap(100,100);
        using var source=Image.FromFile(path);
        return new Bitmap(source);
    }
    public static DataGridView Grid()=>new() {Dock=DockStyle.Fill,ReadOnly=true,AllowUserToAddRows=false,AllowUserToDeleteRows=false,AutoSizeColumnsMode=DataGridViewAutoSizeColumnsMode.Fill,AutoSizeRowsMode=DataGridViewAutoSizeRowsMode.AllCells,ColumnHeadersHeightSizeMode=DataGridViewColumnHeadersHeightSizeMode.AutoSize,DefaultCellStyle=new DataGridViewCellStyle{WrapMode=DataGridViewTriState.True},SelectionMode=DataGridViewSelectionMode.FullRowSelect,MultiSelect=false,RowHeadersVisible=false,BackgroundColor=Color.White,AutoGenerateColumns=true};
    public static void Headers(DataGridView grid,params (string Property,string Caption)[] names)
    {
        foreach(var (property,caption) in names)if(grid.Columns[property] is {} column){column.HeaderText=caption;if(property is "Product" or "Customer")column.FillWeight=250;if(property=="Id")column.FillWeight=40;}
    }
    public static FlowLayoutPanel Row()=>new(){AutoSize=true,Dock=DockStyle.Top,WrapContents=true,Padding=new Padding(8),BackColor=Soft};
    public static Label Label(string text)=>new(){Text=text,AutoSize=true,Margin=new Padding(8),MaximumSize=new Size(700,0)};
}
public sealed class ConnectionForm:PageForm
{
    public string ConnectionString {get;private set;}="";
    public ConnectionForm():base("Подключение к базе",650,580)
    {
        var layout=new TableLayoutPanel{Dock=DockStyle.Fill,ColumnCount=2,AutoScroll=true,Padding=new Padding(20)};
        layout.ColumnStyles.Add(new ColumnStyle(SizeType.Percent,35));layout.ColumnStyles.Add(new ColumnStyle(SizeType.Percent,65));
        var fields=new List<TextBox>();
        foreach(var (name,value) in new[]{("Сервер","127.0.0.1"),("Порт","3306"),("База","prog_demo_sample"),("Пользователь СУБД","root"),("Пароль СУБД","")})
        {
            var box=new TextBox{Text=value,Dock=DockStyle.Top,UseSystemPasswordChar=name.StartsWith("Пароль")};
            layout.Controls.Add(Ui.Label(name));layout.Controls.Add(box);fields.Add(box);
        }
        var note=Ui.Label("Сначала импортируйте content/sample.sql в свою учебную MySQL. Эти реквизиты относятся к СУБД. Вход покупателя выполняется позже по логину без пароля. Настройки подключения не записываются на диск.");
        layout.Controls.Add(note);layout.SetColumnSpan(note,2);
        var button=Ui.Button("Проверить и открыть",()=>{
            if(!uint.TryParse(fields[1].Text,out var port)||port is <1 or >65535)throw new InvalidOperationException("Введите порт от 1 до 65535.");
            var builder=new MySqlConnectionStringBuilder{Server=fields[0].Text.Trim(),Port=port,Database=fields[2].Text.Trim(),UserID=fields[3].Text.Trim(),Password=fields[4].Text,CharacterSet="utf8mb4"};
            var store=new Store(builder.ConnectionString);store.Categories();ConnectionString=builder.ConnectionString;DialogResult=DialogResult.OK;
        },true);
        layout.Controls.Add(button);layout.SetColumnSpan(button,2);Controls.Add(layout);AcceptButton=button;
    }
}
