using ProgDemo;

namespace ProgDemo.WinForms;

public partial class ProductForm : Form
{
    private readonly Action<BasketLine> add;

    public ProductForm(Store store, Product product, DateTime date, Action<BasketLine> add)
    {
        InitializeComponent();
        this.add = add;
        var fresh = store.Catalog(date).Single(x => x.Id == product.Id);
        var sizes = store.Sizes(product.Id);
        photoPictureBox.Image = Ui.Picture(fresh.Image);
        detailsLabel.Text = $"{fresh.Manufacturer} | {fresh.Name}\nКатегория: {fresh.Category}\nЦена со скидкой: {fresh.Price:N2} ₽\nСостав: {fresh.Composition}\nОписание: {fresh.Description}";
        availableLabel.Text = "Доступные размеры: " + (sizes.Count == 0 ? "нет в наличии" : string.Join(", ", sizes.Select(x => x.Size)));
        sizeComboBox.DisplayMember = nameof(Stock.Size);
        sizeComboBox.DataSource = sizes;
        RefreshLimit();
        addButton.Enabled = sizes.Count > 0;
    }

    private void RefreshLimit()
    {
        if (sizeComboBox.SelectedItem is Stock stock)
            quantityNumericUpDown.Maximum = Math.Max(1, stock.Available);
    }

    private void sizeComboBox_SelectedIndexChanged(object sender, EventArgs e) => RefreshLimit();

    private void addButton_Click(object sender, EventArgs e)
    {
        Ui.Guard(() =>
        {
            if (sizeComboBox.SelectedItem is not Stock stock)
                throw new InvalidOperationException("Выберите доступный размер.");
            add(new BasketLine(stock.Id, (int)quantityNumericUpDown.Value));
            DialogResult = DialogResult.OK;
        });
    }

    private void backButton_Click(object sender, EventArgs e) => Close();

    private void ProductForm_FormClosed(object sender, FormClosedEventArgs e) => photoPictureBox.Image?.Dispose();
}
