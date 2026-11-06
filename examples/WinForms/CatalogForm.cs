using ProgDemo;
using System.Globalization;

namespace ProgDemo.WinForms;

public partial class CatalogForm : Form
{
    private readonly Store store;
    private User? user;
    private readonly List<BasketLine> basket = [];
    private readonly DateTime calculationDate;
    private bool ready;
    private List<CatalogRow> rows = [];

    private sealed class CatalogRow(Product product)
    {
        internal Product Model { get; } = product;
        public Image Image { get; } = Ui.Picture(product.Image);
        public string Details => $"{Model.Manufacturer} | {Model.Name}\nКатегория: {Model.Category}\nКоличество: {Rules.QuantityLabel(Model.Quantity)} ({Model.Quantity})\nСостав: {Model.Composition}";
        public decimal Price => Model.Price;
    }

    public CatalogForm(Store store, User? initialUser = null)
    {
        InitializeComponent();
        this.store = store;
        user = initialUser;
        calculationDate = DateTime.TryParseExact(Environment.GetEnvironmentVariable("PROG_DEMO_DATE"),
            "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var fixedDate)
            ? fixedDate : DateTime.Today;
        dateLabel.Text = "Дата расчёта: " + calculationDate.ToString("dd.MM.yyyy");
        categoryComboBox.DataSource = new[] { "Все категории" }.Concat(store.Categories()).ToList();
        sortComboBox.SelectedIndex = 0;
        ready = true;
        UpdateIdentity();
        Ui.Guard(Reload);
    }

    private void UpdateIdentity()
    {
        identityLabel.Text = user?.FullName ?? "Гость";
        searchTextBox.Enabled = categoryComboBox.Enabled = sortComboBox.Enabled = user is not null;
        cartButton.Enabled = user is not null;
        ordersButton.Visible = user?.CanManage == true;
        cartButton.Text = $"Мой заказ ({basket.Sum(x => x.Quantity)})";
    }

    private void Reload()
    {
        if (!ready) return;
        var products = store.Catalog(calculationDate, user is null ? "" : searchTextBox.Text,
            user is null || categoryComboBox.SelectedIndex <= 0 ? "" : categoryComboBox.Text,
            user is not null && sortComboBox.SelectedIndex == 1);
        var previous = rows;
        rows = products.Select(p => new CatalogRow(p)).ToList();
        catalogGrid.DataSource = rows;
        foreach (var row in previous) row.Image.Dispose();
        statusLabel.Text = rows.Count == 0
            ? "Товары не найдены. Измените поиск или выберите «Все категории»."
            : $"Найдено моделей: {rows.Count}. Двойной щелчок открывает выбор размера.";
        UpdateIdentity();
    }

    private void loginButton_Click(object sender, EventArgs e) => Ui.Guard(() =>
    {
        using var dialog = new LoginForm(store);
        if (dialog.ShowDialog(this) != DialogResult.OK) return;
        if (basket.Count > 0 && MessageBox.Show(
            "При смене пользователя незавершённый заказ будет очищен. Продолжить?", "Смена пользователя",
            MessageBoxButtons.YesNo, MessageBoxIcon.Question) != DialogResult.Yes) return;
        ready = false;
        user = dialog.SelectedUser;
        basket.Clear();
        searchTextBox.Clear();
        categoryComboBox.SelectedIndex = 0;
        ready = true;
        UpdateIdentity();
        Reload();
    });

    private void cartButton_Click(object sender, EventArgs e) => Ui.Guard(() =>
    {
        if (user is null) throw new InvalidOperationException("Войдите по логину.");
        using var form = new BasketForm(store, user, basket, calculationDate);
        form.ShowDialog(this);
        Reload();
    });

    private void ordersButton_Click(object sender, EventArgs e) => Ui.Guard(() =>
    {
        if (user is null) throw new InvalidOperationException("Войдите в систему.");
        using var form = new OrdersForm(store, user);
        form.ShowDialog(this);
        Reload();
    });

    private void refreshButton_Click(object sender, EventArgs e) => Ui.Guard(Reload);
    private void searchTextBox_TextChanged(object sender, EventArgs e) => Ui.Guard(Reload);
    private void categoryComboBox_SelectedIndexChanged(object sender, EventArgs e) => Ui.Guard(Reload);
    private void sortComboBox_SelectedIndexChanged(object sender, EventArgs e) => Ui.Guard(Reload);

    private void catalogGrid_CellDoubleClick(object sender, DataGridViewCellEventArgs e)
    {
        if (e.RowIndex < 0 || catalogGrid.Rows[e.RowIndex].DataBoundItem is not CatalogRow row) return;
        Ui.Guard(() =>
        {
            if (user is null)
                throw new InvalidOperationException("Войдите по логину, чтобы выбрать размер и оформить заказ.");
            using var form = new ProductForm(store, row.Model, calculationDate, line =>
            {
                int index = basket.FindIndex(x => x.StockId == line.StockId);
                if (index < 0) basket.Add(line);
                else basket[index] = basket[index] with { Quantity = checked(basket[index].Quantity + line.Quantity) };
                UpdateIdentity();
            });
            form.ShowDialog(this);
        });
    }

    private void catalogGrid_CellFormatting(object sender, DataGridViewCellFormattingEventArgs e)
    {
        if (e.RowIndex < 0 || catalogGrid.Rows[e.RowIndex].DataBoundItem is not CatalogRow row) return;
        var color = Rules.LowStock(row.Model.Quantity) ? Color.FromArgb(255, 128, 128) : Color.White;
        e.CellStyle!.BackColor = color;
        e.CellStyle.SelectionBackColor = Rules.LowStock(row.Model.Quantity) ? color : Color.FromArgb(210, 246, 231);
        e.CellStyle.ForeColor = e.CellStyle.SelectionForeColor = Color.Black;
    }

    private void CatalogForm_FormClosed(object sender, FormClosedEventArgs e)
    {
        foreach (var row in rows) row.Image.Dispose();
        rows.Clear();
    }
}
