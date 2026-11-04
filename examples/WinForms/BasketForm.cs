using ProgDemo;

namespace ProgDemo.WinForms;

public sealed class BasketForm:PageForm
{
    private readonly Store store;private readonly User actor;private readonly List<BasketLine> basket;private readonly DateTime date;
    private readonly DataGridView grid=Ui.Grid();private readonly Label total=Ui.Label("");
    private readonly ComboBox customer=new(){DropDownStyle=ComboBoxStyle.DropDownList,Width=300,DisplayMember="FullName"};
    private readonly NumericUpDown quantity=new(){Minimum=1,Maximum=100000,Value=1,Width=110};
    private Guid request=Guid.NewGuid();
    public BasketForm(Store store,User actor,List<BasketLine> basket,DateTime date):base("Оформление заказа",1000,700)
    {
        this.store=store;this.actor=actor;this.basket=basket;this.date=date;
        var actions=Ui.Row();actions.Controls.Add(Ui.Label("Клиент:"));customer.DataSource=actor.CanManage?store.Customers(actor):new List<User>{actor};customer.SelectedItem=((List<User>)customer.DataSource).Find(x=>x.Id==actor.Id);actions.Controls.Add(customer);
        var controls=Ui.Row();controls.Controls.Add(quantity);controls.Controls.Add(Ui.Button("Изменить количество",()=>{var i=grid.CurrentRow?.Index??-1;if(i<0)throw new InvalidOperationException("Выберите строку заказа.");basket[i]=basket[i] with{Quantity=(int)quantity.Value};Reload();}));
        controls.Controls.Add(Ui.Button("Удалить позицию",()=>{var i=grid.CurrentRow?.Index??-1;if(i<0)throw new InvalidOperationException("Выберите строку заказа.");basket.RemoveAt(i);Reload();}));controls.Controls.Add(total);
        var bottom=Ui.Row();bottom.Dock=DockStyle.Bottom;
        bottom.Controls.Add(Ui.Button("Назад к выбору",Close));
        bottom.Controls.Add(Ui.Button("Отказаться от заказа",()=>{if(MessageBox.Show("Очистить выбранные позиции? Остатки ещё не списывались.","Отмена заказа",MessageBoxButtons.YesNo,MessageBoxIcon.Question)!=DialogResult.Yes)return;basket.Clear();DialogResult=DialogResult.Cancel;}));
        Button? confirm=null;
        confirm=Ui.Button("Подтвердить заказ",()=>{
            if(customer.SelectedItem is not User target)throw new InvalidOperationException("Выберите клиента.");
            if(basket.Count==0)throw new InvalidOperationException("Добавьте хотя бы одну пару обуви.");
            confirm!.Enabled=false;
            try{int id=store.PlaceOrder(actor,target.Id,basket,request,date);basket.Clear();MessageBox.Show($"Заказ №{id} оформлен. Остатки обновлены.","Заказ сохранён",MessageBoxButtons.OK,MessageBoxIcon.Information);DialogResult=DialogResult.OK;}
            finally{if(!IsDisposed)confirm.Enabled=true;}
        },true);bottom.Controls.Add(confirm);
        Controls.Add(grid);Controls.Add(controls);Controls.Add(actions);Controls.Add(bottom);Reload();
    }
    private void Reload()
    {
        // A changed basket is a new request. A retry of the same basket retains its token.
        request=Guid.NewGuid();
        var products=store.Catalog(date).ToDictionary(p=>p.Id);var available=products.Values.SelectMany(p=>store.Sizes(p.Id)).ToDictionary(s=>s.Id);
        var rows=basket.Select(x=>{
            available.TryGetValue(x.StockId,out var s);Product? p=s is null?null:products[s.ProductId];
            return new {Позиция=x.StockId,Модель=p?.Name??"Позиция закончилась — удалите или обновите выбор",Размер=s?.Size??"—",Количество=x.Quantity,Цена=p?.Price??0,Сумма=(p?.Price??0)*x.Quantity};
        }).ToList();grid.DataSource=rows;if(grid.Columns["Модель"] is {} model)model.FillWeight=350;if(grid.Columns["Позиция"] is {} code)code.FillWeight=40;total.Text=$"Итого: {rows.Sum(x=>x.Сумма):N2} ₽";
    }
}
