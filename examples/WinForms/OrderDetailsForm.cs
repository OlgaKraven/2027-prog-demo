using ProgDemo;

namespace ProgDemo.WinForms;

public partial class OrderDetailsForm : Form
{
    private readonly Store store;
    private readonly User actor;
    private readonly int orderId;

    public OrderDetailsForm(Store store, User actor, int orderId)
    {
        InitializeComponent();
        this.store = store;
        this.actor = actor;
        this.orderId = orderId;
        var header = store.Orders(actor).FirstOrDefault(x => x.Id == orderId)
            ?? throw new InvalidOperationException("Заказ уже удалён. Обновите список.");
        headingLabel.Text = $"Состав заказа №{orderId}";
        orderDatePicker.Value = header.Date;
        dateLabel.Visible = orderDatePicker.Visible = changeDateButton.Visible = deleteLineButton.Visible = actor.IsAdmin;
        Reload();
    }

    private void Reload()
    {
        var rows = store.OrderLines(actor, orderId);
        linesGrid.DataSource = rows;
        totalLabel.Text = $"Итого: {rows.Sum(x => x.Total):N2} ₽";
    }

    private void changeDateButton_Click(object sender, EventArgs e)
    {
        Ui.Guard(() =>
        {
            store.ChangeDate(actor, orderId, orderDatePicker.Value.Date);
            Reload();
        });
    }

    private void deleteLineButton_Click(object sender, EventArgs e)
    {
        Ui.Guard(() =>
        {
            if (linesGrid.CurrentRow?.DataBoundItem is not OrderLine line)
                throw new InvalidOperationException("Выберите строку.");
            if (MessageBox.Show("Удалить позицию из заказа?", "Удаление позиции",
                MessageBoxButtons.YesNo, MessageBoxIcon.Warning) != DialogResult.Yes)
                return;
            store.DeleteLine(actor, orderId, line.Id);
            Reload();
        });
    }

    private void backButton_Click(object sender, EventArgs e) => Close();
}
