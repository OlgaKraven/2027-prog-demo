using ProgDemo;
using System.Globalization;

namespace ProgDemo.WinForms;

public sealed class CatalogForm:PageForm
{
    private readonly Store store;
    private User? user;
    private readonly List<BasketLine> basket=[];
    private readonly FlowLayoutPanel catalog=new(){Dock=DockStyle.Fill,AutoScroll=true,FlowDirection=FlowDirection.TopDown,WrapContents=false,Padding=new Padding(10)};
    private readonly Label identity=Ui.Label("Гость");
    private readonly TextBox search=new(){Width=240,PlaceholderText="Название или описание"};
    private readonly ComboBox category=new(){Width=200,DropDownStyle=ComboBoxStyle.DropDownList};
    private readonly ComboBox sort=new(){Width=190,DropDownStyle=ComboBoxStyle.DropDownList};
    private readonly FlowLayoutPanel filters=Ui.Row();
    private readonly Button cartButton;
    private readonly Button ordersButton;
    private readonly DateTime calculationDate;
    private List<Product> products=[];
    public CatalogForm(Store store,User? initialUser=null):base("Каталог обуви")
    {
        this.store=store;user=initialUser;
        calculationDate=DateTime.TryParseExact(Environment.GetEnvironmentVariable("PROG_DEMO_DATE"),"yyyy-MM-dd",CultureInfo.InvariantCulture,DateTimeStyles.None,out var fixedDate)?fixedDate:DateTime.Today;
        var header=new TableLayoutPanel{Dock=DockStyle.Top,AutoSize=true,ColumnCount=3,Padding=new Padding(12),BackColor=Ui.Soft};
        header.ColumnStyles.Add(new ColumnStyle(SizeType.Absolute,100));header.ColumnStyles.Add(new ColumnStyle(SizeType.Percent,100));header.ColumnStyles.Add(new ColumnStyle(SizeType.AutoSize));
        var logo=new PictureBox{Size=new Size(85,65),SizeMode=PictureBoxSizeMode.Zoom};
        var path=Path.Combine(AppContext.BaseDirectory,"Assets","Чудо Обувь.png");if(File.Exists(path))logo.Image=Image.FromFile(path);
        header.Controls.Add(logo);header.Controls.Add(Ui.Label("Чудо Обувь\nКаталог моделей и размеров"));header.Controls.Add(identity);
        var actions=Ui.Row();
        actions.Controls.Add(Ui.Button("Войти / сменить пользователя",Login));
        cartButton=Ui.Button("Мой заказ (0)",OpenBasket,true);actions.Controls.Add(cartButton);
        ordersButton=Ui.Button("Заказы клиентов",()=>{if(user is null)throw new InvalidOperationException("Войдите в систему.");using var form=new OrdersForm(store,user);form.ShowDialog(this);Reload();});actions.Controls.Add(ordersButton);
        actions.Controls.Add(Ui.Button("Обновить каталог",Reload));actions.Controls.Add(Ui.Label("Дата расчёта: "+calculationDate.ToString("dd.MM.yyyy")));
        filters.Controls.Add(Ui.Label("Поиск"));filters.Controls.Add(search);filters.Controls.Add(category);filters.Controls.Add(sort);
        category.Items.Add("Все категории");
        Ui.Guard(()=>{foreach(var c in store.Categories())category.Items.Add(c);});category.SelectedIndex=0;
        sort.Items.AddRange(["Цена: по возрастанию","Цена: по убыванию"]);sort.SelectedIndex=0;
        search.TextChanged+=(_,_)=>Ui.Guard(Reload);category.SelectedIndexChanged+=(_,_)=>Ui.Guard(Reload);sort.SelectedIndexChanged+=(_,_)=>Ui.Guard(Reload);
        Controls.Add(catalog);Controls.Add(filters);Controls.Add(actions);Controls.Add(header);
        catalog.SizeChanged+=(_,_)=>ResizeCards();Shown+=(_,_)=>Ui.Guard(Reload);
        UpdateIdentity();
    }
    private void UpdateIdentity()
    {
        identity.Text=user?.FullName??"Гость";filters.Enabled=user is not null;cartButton.Enabled=user is not null;ordersButton.Visible=user?.CanManage==true;
        cartButton.Text=$"Мой заказ ({basket.Sum(x=>x.Quantity)})";
    }
    private void Login()
    {
        using var dialog=new PageForm("Вход по логину",600,480);
        var panel=new FlowLayoutPanel{Dock=DockStyle.Fill,FlowDirection=FlowDirection.TopDown,Padding=new Padding(25)};
        panel.Controls.Add(Ui.Label("Введите логин из списка пользователей. Пароль не требуется."));
        var login=new TextBox{Width=300,Name="Login"};panel.Controls.Add(login);
        panel.Controls.Add(Ui.Button("Войти",()=>{
            var next=store.Login(login.Text)??throw new InvalidOperationException("Логин не найден. Проверьте написание по исходному списку пользователей.");
            if(basket.Count>0&&MessageBox.Show("При смене пользователя незавершённый заказ будет очищен. Продолжить?","Смена пользователя",MessageBoxButtons.YesNo,MessageBoxIcon.Question)!=DialogResult.Yes)return;
            user=next;basket.Clear();dialog.DialogResult=DialogResult.OK;
        },true));
        panel.Controls.Add(Ui.Button("Продолжить как гость",()=>{
            if(basket.Count>0&&MessageBox.Show("Отменить незавершённый заказ и выйти?","Выход",MessageBoxButtons.YesNo,MessageBoxIcon.Question)!=DialogResult.Yes)return;
            user=null;basket.Clear();dialog.DialogResult=DialogResult.OK;
        }));dialog.Controls.Add(panel);dialog.ShowDialog(this);search.Clear();category.SelectedIndex=0;UpdateIdentity();Reload();
    }
    private void ResizeCards(){foreach(Control card in catalog.Controls)card.Width=Math.Max(300,catalog.ClientSize.Width-35);}
    private void Reload()
    {
        products=store.Catalog(calculationDate,user is null?"":search.Text,user is null||category.SelectedIndex<=0?"":category.Text,user is not null&&sort.SelectedIndex==1);
        foreach(Control c in catalog.Controls){foreach(var image in c.Controls.OfType<PictureBox>())image.Image?.Dispose();}
        var old=catalog.Controls.Cast<Control>().ToList();catalog.Controls.Clear();foreach(var c in old)c.Dispose();
        foreach(var product in products)
        {
            float dpi=DeviceDpi/96f;
            var card=new TableLayoutPanel{Height=(int)(160*dpi),ColumnCount=3,Margin=new Padding(0,5,0,5),Padding=new Padding(10),BackColor=Rules.LowStock(product.Quantity)?ColorTranslator.FromHtml("#FF8080"):Color.White,BorderStyle=BorderStyle.FixedSingle,Cursor=Cursors.Hand};
            card.ColumnStyles.Add(new ColumnStyle(SizeType.Absolute,130*dpi));card.ColumnStyles.Add(new ColumnStyle(SizeType.Percent,100));card.ColumnStyles.Add(new ColumnStyle(SizeType.Absolute,180*dpi));
            var image=new PictureBox{Dock=DockStyle.Fill,SizeMode=PictureBoxSizeMode.Zoom,Image=Ui.Picture(product.Image)};
            var details=new Label{Dock=DockStyle.Fill,AutoEllipsis=true,Text=$"{product.Manufacturer} | {product.Name}\nКатегория: {product.Category}\nКоличество: {Rules.QuantityLabel(product.Quantity)} ({product.Quantity})\nСостав: {product.Composition}",Padding=new Padding(12,0,10,0)};
            var price=new Label{Dock=DockStyle.Fill,Text=product.Price.ToString("N2")+" ₽",Font=new Font("Calibri",16,FontStyle.Bold),TextAlign=ContentAlignment.MiddleRight};
            card.Controls.Add(image);card.Controls.Add(details);card.Controls.Add(price);
            void Open(object? sender,EventArgs e)=>Ui.Guard(()=>{if(user is null)throw new InvalidOperationException("Войдите по логину, чтобы выбрать размер и оформить заказ.");using var form=new ProductForm(store,product,calculationDate,line=>{var existing=basket.FindIndex(x=>x.StockId==line.StockId);if(existing<0)basket.Add(line);else basket[existing]=basket[existing] with {Quantity=checked(basket[existing].Quantity+line.Quantity)};UpdateIdentity();});form.ShowDialog(this);});
            card.Click+=Open;image.Click+=Open;details.Click+=Open;price.Click+=Open;catalog.Controls.Add(card);
        }
        if(products.Count==0)catalog.Controls.Add(Ui.Label("Товары не найдены. Измените строку поиска или выберите «Все категории»."));
        ResizeCards();UpdateIdentity();
    }
    private void OpenBasket()
    {
        if(user is null)throw new InvalidOperationException("Войдите по логину.");
        using var form=new BasketForm(store,user,basket,calculationDate);form.ShowDialog(this);UpdateIdentity();Reload();
    }
}
