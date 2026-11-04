using ProgDemo;

namespace ProgDemo.WinForms;

public sealed class OrdersForm:PageForm
{
    private readonly Store store;private readonly User actor;private readonly DataGridView orders=Ui.Grid();
    public OrdersForm(Store store,User actor):base("Заказы клиентов",1050,700)
    {
        this.store=store;this.actor=actor;
        if(!actor.CanManage)throw new UnauthorizedAccessException("Нет права управления заказами.");
        var bar=Ui.Row();
        bar.Controls.Add(Ui.Button("Состав заказа",Details));
        bar.Controls.Add(Ui.Button("Добавить заказ",()=>{using var catalog=new CatalogForm(store,actor);catalog.ShowDialog(this);Reload();}));
        bar.Controls.Add(Ui.Button("Удалить заказ",()=>{
            var id=Selected();if(MessageBox.Show($"Удалить заказ №{id}? Для новых заказов товар вернётся в доступный остаток.","Необратимое удаление",MessageBoxButtons.YesNo,MessageBoxIcon.Warning)!=DialogResult.Yes)return;store.DeleteOrder(actor,id);Reload();
        }));bar.Controls.Add(Ui.Button("Назад в каталог",Close));Controls.Add(orders);Controls.Add(bar);Reload();
    }
    private int Selected()=>orders.CurrentRow?.DataBoundItem is OrderHeader o?o.Id:throw new InvalidOperationException("Выберите заказ.");
    private void Reload(){orders.DataSource=store.Orders(actor);Ui.Headers(orders,("Id","№ заказа"),("Date","Дата заказа"),("Customer","ФИО клиента"),("Total","Итог, ₽"));}
    private void Details()
    {
        int id=Selected();using var form=new PageForm("Состав заказа №"+id,1050,680);
        var grid=Ui.Grid();var total=Ui.Label("");var bar=Ui.Row();
        var date=new DateTimePicker{Format=DateTimePickerFormat.Short,Value=store.Orders(actor).Single(x=>x.Id==id).Date};
        void Refresh(){var rows=store.OrderLines(actor,id);grid.DataSource=rows;if(grid.Columns["StockId"] is {} column)column.Visible=false;Ui.Headers(grid,("Id","№ строки"),("Product","Модель"),("Manufacturer","Производство"),("Size","Размер"),("Quantity","Пар"),("Price","Цена, ₽"),("Total","Сумма, ₽"));total.Text=$"Итого: {rows.Sum(x=>x.Total):N2} ₽";}
        bar.Controls.Add(total);
        if(actor.IsAdmin)
        {
            bar.Controls.Add(date);bar.Controls.Add(Ui.Button("Изменить дату",()=>{store.ChangeDate(actor,id,date.Value.Date);Refresh();Reload();}));
            bar.Controls.Add(Ui.Button("Удалить строку",()=>{
                if(grid.CurrentRow?.DataBoundItem is not OrderLine line)throw new InvalidOperationException("Выберите строку.");
                if(MessageBox.Show("Удалить позицию из заказа?","Необратимое удаление",MessageBoxButtons.YesNo,MessageBoxIcon.Warning)!=DialogResult.Yes)return;
                store.DeleteLine(actor,id,line.Id);Refresh();Reload();
            }));
        }
        bar.Controls.Add(Ui.Button("Назад к заказам",form.Close));form.Controls.Add(grid);form.Controls.Add(bar);Refresh();form.ShowDialog(this);
    }
}
