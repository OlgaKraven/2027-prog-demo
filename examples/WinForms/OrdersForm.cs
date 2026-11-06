using ProgDemo;

namespace ProgDemo.WinForms;

public partial class OrdersForm : Form
{
    private readonly Store store;
    private readonly User actor;

    public OrdersForm(Store store, User actor)
    {
        InitializeComponent();
        this.store = store;
        this.actor = actor;
        if (!actor.CanManage)
            throw new UnauthorizedAccessException("Нет права управления заказами.");
        Reload();
    }

    private int Selected() => ordersGrid.CurrentRow?.DataBoundItem is OrderHeader order
        ? order.Id : throw new InvalidOperationException("Выберите заказ.");

    private void Reload()
    {
        var rows = store.Orders(actor);
        ordersGrid.DataSource = rows;
        statusLabel.Text = $"Заказов: {rows.Count}";
    }

    private void detailsButton_Click(object sender, EventArgs e)
    {
        Ui.Guard(() =>
        {
            using var form = new OrderDetailsForm(store, actor, Selected());
            form.ShowDialog(this);
            Reload();
        });
    }

    private void addOrderButton_Click(object sender, EventArgs e)
    {
        Ui.Guard(() =>
        {
            using var catalog = new CatalogForm(store, actor);
            catalog.ShowDialog(this);
            Reload();
        });
    }

    private void deleteOrderButton_Click(object sender, EventArgs e)
    {
        Ui.Guard(() =>
        {
            int id = Selected();
            if (MessageBox.Show($"Удалить заказ №{id}? Для новых заказов товар вернётся в доступный остаток.",
                "Удаление заказа", MessageBoxButtons.YesNo, MessageBoxIcon.Warning) != DialogResult.Yes)
                return;
            store.DeleteOrder(actor, id);
            Reload();
        });
    }

    private void backButton_Click(object sender, EventArgs e) => Close();
}
