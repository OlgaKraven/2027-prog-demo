using ProgDemo;

namespace ProgDemo.WinForms;

public sealed class ProductForm:PageForm
{
    public ProductForm(Store store,Product product,DateTime date,Action<BasketLine> add):base("Карточка модели",800,720)
    {
        var fresh=store.Catalog(date).Single(x=>x.Id==product.Id);
        var sizes=store.Sizes(product.Id);
        var body=new TableLayoutPanel{Dock=DockStyle.Fill,ColumnCount=1,AutoScroll=true,Padding=new Padding(20)};
        var photo=new PictureBox{Height=180,Dock=DockStyle.Top,SizeMode=PictureBoxSizeMode.Zoom,Image=Ui.Picture(fresh.Image)};
        body.Controls.Add(photo);
        body.Controls.Add(Ui.Label($"{fresh.Manufacturer} | {fresh.Name}\nКатегория: {fresh.Category}\nЦена со скидкой: {fresh.Price:N2} ₽\nСостав: {fresh.Composition}\nОписание: {fresh.Description}"));
        body.Controls.Add(Ui.Label("Доступные размеры: "+(sizes.Count==0?"нет в наличии":string.Join(", ",sizes.Select(x=>x.Size)))));
        var select=new ComboBox{DropDownStyle=ComboBoxStyle.DropDownList,Width=300,DataSource=sizes,DisplayMember="Size"};
        body.Controls.Add(Ui.Label("Размер"));body.Controls.Add(select);
        var quantity=new NumericUpDown{Minimum=1,Maximum=1,Value=1,Width=150};
        void RefreshLimit(){if(select.SelectedItem is Stock s)quantity.Maximum=Math.Max(1,s.Available);}
        select.SelectedIndexChanged+=(_,_)=>RefreshLimit();RefreshLimit();
        body.Controls.Add(Ui.Label("Количество пар"));body.Controls.Add(quantity);
        var button=Ui.Button("Добавить в заказ",()=>{if(select.SelectedItem is not Stock s)throw new InvalidOperationException("Выберите доступный размер.");add(new BasketLine(s.Id,(int)quantity.Value));DialogResult=DialogResult.OK;},true);button.Enabled=sizes.Count>0;body.Controls.Add(button);
        body.Controls.Add(Ui.Button("Назад в каталог",()=>Close()));Controls.Add(body);
        FormClosed+=(_,_)=>photo.Image?.Dispose();
    }
}
