using ProgDemo;

namespace ProgDemo.WinForms;

public partial class BasketForm : Form
{
    private readonly Store store;
    private readonly User actor;
    private readonly List<BasketLine> basket;
    private readonly DateTime date;
    private Guid request = Guid.NewGuid();

    private sealed record BasketRow(int StockId, string Product, string Size, int Quantity, decimal Price)
    {
        public decimal Total => Quantity * Price;
    }

    public BasketForm(Store store, User actor, List<BasketLine> basket, DateTime date)
    {
        InitializeComponent();
        this.store = store;
        this.actor = actor;
        this.basket = basket;
        this.date = date;
        var customers = actor.CanManage ? store.Customers(actor) : new List<User> { actor };
        customerComboBox.DisplayMember = nameof(User.FullName);
        customerComboBox.DataSource = customers;
        customerComboBox.SelectedItem = customers.Find(x => x.Id == actor.Id) ?? customers.FirstOrDefault();
        customerComboBox.Enabled = actor.CanManage;
        Reload();
    }

    private void Reload()
    {
        // Changing the basket starts a new request; retrying confirmation keeps its token.
        request = Guid.NewGuid();
        var products = store.Catalog(date).ToDictionary(p => p.Id);
        var available = products.Values.SelectMany(p => store.Sizes(p.Id)).ToDictionary(s => s.Id);
        var rows = basket.Select(line =>
        {
            available.TryGetValue(line.StockId, out var stock);
            Product? product = stock is null ? null : products[stock.ProductId];
            return new BasketRow(line.StockId,
                product?.Name ?? "Позиция закончилась — удалите или обновите выбор",
                stock?.Size ?? "—", line.Quantity, product?.Price ?? 0);
        }).ToList();
        basketGrid.DataSource = rows;
        totalLabel.Text = $"Итого: {rows.Sum(x => x.Total):N2} ₽";
    }

    private int SelectedIndex()
    {
        if (basketGrid.CurrentRow?.DataBoundItem is not BasketRow row)
            throw new InvalidOperationException("Выберите строку заказа.");
        int index = basket.FindIndex(x => x.StockId == row.StockId);
        if (index < 0)
            throw new InvalidOperationException("Строка уже удалена. Обновите корзину.");
        return index;
    }

    private void basketGrid_SelectionChanged(object sender, EventArgs e)
    {
        if (basketGrid.CurrentRow?.DataBoundItem is BasketRow row)
            quantityNumericUpDown.Value = Math.Clamp(row.Quantity,
                quantityNumericUpDown.Minimum, quantityNumericUpDown.Maximum);
    }

    private void quantityButton_Click(object sender, EventArgs e) => Ui.Guard(() =>
    {
        int index = SelectedIndex();
        basket[index] = basket[index] with { Quantity = (int)quantityNumericUpDown.Value };
        Reload();
    });

    private void removeButton_Click(object sender, EventArgs e) => Ui.Guard(() =>
    {
        basket.RemoveAt(SelectedIndex());
        Reload();
    });

    private void backButton_Click(object sender, EventArgs e) => Close();

    private void cancelButton_Click(object sender, EventArgs e)
    {
        if (MessageBox.Show("Очистить выбранные позиции? Остатки ещё не списывались.", "Отмена заказа",
            MessageBoxButtons.YesNo, MessageBoxIcon.Question) != DialogResult.Yes)
            return;
        basket.Clear();
        DialogResult = DialogResult.Cancel;
    }

    private void confirmButton_Click(object sender, EventArgs e) => Ui.Guard(() =>
    {
        if (customerComboBox.SelectedItem is not User target)
            throw new InvalidOperationException("Выберите клиента.");
        if (basket.Count == 0)
            throw new InvalidOperationException("Добавьте хотя бы одну пару обуви.");
        confirmButton.Enabled = false;
        try
        {
            int id = store.PlaceOrder(actor, target.Id, basket, request, date);
            basket.Clear();
            MessageBox.Show($"Заказ №{id} оформлен. Остатки обновлены.", "Заказ сохранён",
                MessageBoxButtons.OK, MessageBoxIcon.Information);
            DialogResult = DialogResult.OK;
        }
        finally
        {
            if (!IsDisposed)
                confirmButton.Enabled = true;
        }
    });
}
