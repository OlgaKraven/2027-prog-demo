using System.Globalization;
using System.IO;
using System.Windows;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using Npgsql;

namespace ProgDemo.Wpf;

public partial class MainWindow : Window
{
    private Store? store;
    private User? actor;
    private readonly List<BasketRow> basket = [];
    private readonly DateTime calculationDate;
    private Guid requestId = Guid.NewGuid();
    private bool updating;

    public MainWindow()
    {
        CultureInfo.CurrentCulture = CultureInfo.GetCultureInfo("ru-RU");
        InitializeComponent();
        calculationDate = DateTime.TryParseExact(Environment.GetEnvironmentVariable("PROG_DEMO_DATE"),
            "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var date) ? date : DateTime.Today;
        Logo.Source = ReadImage("Чудо Обувь.png");
        Icon = ReadImage("Чудо Обувь.ico");
        string? connection = Environment.GetEnvironmentVariable("PROG_DEMO_POSTGRES_CONNECTION");
        if (!string.IsNullOrWhiteSpace(connection))
            Guard(() => Connect(connection));
    }

    public sealed record CatalogRow(Product Model, ImageSource? Photo)
    {
        public string Heading => $"{Model.Manufacturer} | {Model.Name}";
        public string Details => $"Категория: {Model.Category}\nКоличество: {Rules.QuantityLabel(Model.Quantity)} ({Model.Quantity})\nСостав: {Model.Composition}";
        public string PriceText => $"{Model.Price:N2} ₽";
        public Brush Background => Rules.LowStock(Model.Quantity)
            ? new SolidColorBrush(Color.FromRgb(255, 128, 128)) : Brushes.White;
    }

    public sealed record BasketRow(Stock Stock, string Name, int Quantity, decimal Price)
    {
        public string Size => Stock.Size;
        public int Available => Stock.Available;
        public decimal Total => Quantity * Price;
    }

    private void Connect_Click(object sender, RoutedEventArgs e) => Guard(() =>
    {
        if (!int.TryParse(PortBox.Text, out int port) || port is < 1 or > 65535)
            throw new ArgumentException("Укажите порт PostgreSQL от 1 до 65535.");
        var builder = new NpgsqlConnectionStringBuilder
        {
            Host = ServerBox.Text.Trim(),
            Port = port,
            Database = DatabaseBox.Text.Trim(),
            Username = DatabaseUserBox.Text.Trim(),
            Password = PasswordBox.Password,
            Timeout = 5
        };
        Connect(builder.ConnectionString);
    });

    private void Connect(string connection)
    {
        var candidate = new Store(() => new NpgsqlConnection(connection), postgres: true);
        var categories = candidate.Categories();
        var products = candidate.Catalog(calculationDate);
        updating = true;
        try
        {
            CategoryBox.ItemsSource = new[] { "Все категории" }.Concat(categories).ToList();
            CategoryBox.SelectedIndex = SortBox.SelectedIndex = 0;
            UpdateIdentity();
            ShowCatalog(products);
            store = candidate;
            ConnectionPanel.Visibility = Visibility.Collapsed;
            Workspace.Visibility = Visibility.Visible;
            PasswordBox.Clear();
        }
        finally { updating = false; }
    }

    private void LoginBox_KeyDown(object sender, KeyEventArgs e)
    {
        if (e.Key == Key.Enter)
            Login_Click(sender, e);
    }

    private void Login_Click(object sender, RoutedEventArgs e) => Guard(() =>
    {
        var next = store!.Login(LoginBox.Text)
            ?? throw new InvalidOperationException("Логин не найден. Проверьте его по списку пользователей.");
        ChangeUser(next);
    });

    private void Guest_Click(object sender, RoutedEventArgs e) => Guard(() => ChangeUser(null));

    private void ChangeUser(User? next)
    {
        if (basket.Count > 0 && !Ask("Смена пользователя", "Очистить незавершённый заказ и сменить пользователя?"))
            return;
        actor = next;
        basket.Clear();
        requestId = Guid.NewGuid();
        updating = true;
        try
        {
            SearchBox.Clear();
            CustomerBox.ItemsSource = null;
            CategoryBox.SelectedIndex = SortBox.SelectedIndex = 0;
            UpdateIdentity();
        }
        finally { updating = false; }
        LoadCatalog();
    }

    private void UpdateIdentity()
    {
        IdentityText.Text = actor?.FullName ?? "Гость";
        SearchBox.IsEnabled = CategoryBox.IsEnabled = SortBox.IsEnabled = BasketButton.IsEnabled = actor is not null;
        OrdersButton.Visibility = actor?.CanManage == true ? Visibility.Visible : Visibility.Collapsed;
        BasketButton.Content = $"Мой заказ ({basket.Sum(row => row.Quantity)})";
    }

    private void Catalog_Click(object sender, RoutedEventArgs e) => Guard(LoadCatalog);

    private void FiltersChanged(object sender, RoutedEventArgs e)
    {
        if (!updating && store is not null)
            Guard(LoadCatalog);
    }

    private void LoadCatalog()
    {
        string search = actor is null ? "" : SearchBox.Text;
        string category = actor is not null && CategoryBox.SelectedIndex > 0
            ? (string)CategoryBox.SelectedItem : "";
        ShowCatalog(store!.Catalog(calculationDate, search, category, actor is not null && SortBox.SelectedIndex == 1));
    }

    private void ShowCatalog(List<Product> products)
    {
        int? previous = (CatalogList.SelectedItem as CatalogRow)?.Model.Id;
        var rows = products.Select(model => new CatalogRow(model, ProductImage(model.Image))).ToList();
        CatalogList.ItemsSource = rows;
        CatalogList.SelectedItem = rows.FirstOrDefault(row => row.Model.Id == previous);
        if (CatalogList.SelectedItem is null)
            ResetProduct();
        CatalogStatus.Text = rows.Count == 0
            ? "Модели не найдены. Измените поиск или категорию."
            : $"Найдено моделей: {rows.Count}. Дата расчёта скидки: {calculationDate:dd.MM.yyyy}.";
        Show(CatalogView, "Каталог");
    }

    private void CatalogSelectionChanged(object sender, RoutedEventArgs e)
    {
        ResetProduct();
        if (store is null || CatalogList.SelectedItem is not CatalogRow row)
            return;
        Guard(() =>
        {
            var model = row.Model;
            var range = store.Sizes(model.Id, includeUnavailable: true);
            var available = range.Where(size => size.Available > 0).ToList();
            ProductPhoto.Source = row.Photo;
            ProductText.Text = $"{row.Heading}\n{row.Details}\nЦена: {row.PriceText}\nОписание: {model.Description}";
            SizeText.Text = $"Размерный ряд: {Sizes(range, "не задан")}\nДоступные размеры: {Sizes(available, "нет в наличии")}";
            SizeBox.ItemsSource = available;
            SizeBox.SelectedIndex = available.Count > 0 ? 0 : -1;
            AddButton.IsEnabled = actor is not null && available.Count > 0;
        });
    }

    private void ResetProduct()
    {
        ProductPhoto.Source = null;
        ProductText.Text = "Выберите модель в каталоге.";
        SizeText.Text = "";
        SizeBox.ItemsSource = null;
        QuantityBox.Text = "1";
        AddButton.IsEnabled = false;
    }

    private static string Sizes(List<Stock> rows, string empty) =>
        rows.Count == 0 ? empty : string.Join(", ", rows.Select(row => row.Size));

    private void Add_Click(object sender, RoutedEventArgs e) => Guard(() =>
    {
        RequireActor();
        if (CatalogList.SelectedItem is not CatalogRow row || SizeBox.SelectedItem is not Stock size)
            throw new InvalidOperationException("Выберите модель и доступный размер.");
        var stock = FindStock(size);
        int index = basket.FindIndex(item => item.Stock.Id == stock.Id);
        int current = index < 0 ? 0 : basket[index].Quantity;
        int added = ReadQuantity(QuantityBox.Text, stock.Available - current);
        var updated = new BasketRow(stock, row.Model.Name, current + added, row.Model.Price);
        if (index < 0)
            basket.Add(updated);
        else
            basket[index] = updated;
        BasketChanged();
        CatalogStatus.Text = $"Добавлено: {added} · {row.Model.Name}, размер {stock.Size}.";
    });

    private void Basket_Click(object sender, RoutedEventArgs e) => Guard(() =>
    {
        User user = RequireActor();
        int customer = (CustomerBox.SelectedItem as User)?.Id ?? user.Id;
        List<User> customers = user.CanManage ? store!.Customers(user) : [user];
        updating = true;
        try
        {
            CustomerBox.ItemsSource = customers;
            CustomerBox.SelectedItem = customers.Find(item => item.Id == customer) ?? customers.Find(item => item.Id == user.Id);
            CustomerBox.IsEnabled = user.CanManage;
        }
        finally { updating = false; }
        RefreshBasket();
        Show(BasketView, "Оформление заказа");
    });

    private void RefreshBasket()
    {
        var products = store!.Catalog(calculationDate).ToDictionary(model => model.Id);
        for (int index = 0; index < basket.Count; index++)
        {
            var item = basket[index];
            var stock = FindStock(item.Stock);
            var model = products[stock.ProductId];
            basket[index] = item with { Stock = stock, Price = model.Price };
        }
        DrawBasket();
    }

    private void CustomerChanged(object sender, RoutedEventArgs e)
    {
        if (!updating)
            requestId = Guid.NewGuid();
    }

    private void BasketSelectionChanged(object sender, RoutedEventArgs e) =>
        EditQuantityBox.Text = (BasketGrid.SelectedItem as BasketRow)?.Quantity.ToString() ?? "";

    private BasketRow SelectedLine() => BasketGrid.SelectedItem as BasketRow
        ?? throw new InvalidOperationException("Выберите позицию заказа.");

    private void ChangeQuantity_Click(object sender, RoutedEventArgs e) => Guard(() =>
    {
        var row = SelectedLine();
        var current = FindStock(row.Stock);
        int quantity = ReadQuantity(EditQuantityBox.Text, current.Available);
        basket[basket.IndexOf(row)] = row with { Stock = current, Quantity = quantity };
        BasketChanged();
    });

    private void RemoveLine_Click(object sender, RoutedEventArgs e) => Guard(() =>
    {
        basket.Remove(SelectedLine());
        BasketChanged();
    });

    private void CancelBasket_Click(object sender, RoutedEventArgs e) => Guard(() =>
    {
        if (basket.Count > 0 && !Ask("Отмена заказа", "Очистить корзину? Остатки ещё не списывались."))
            return;
        basket.Clear();
        BasketChanged();
        LoadCatalog();
    });

    private void Confirm_Click(object sender, RoutedEventArgs e) => Guard(() =>
    {
        var user = RequireActor();
        if (CustomerBox.SelectedItem is not User customer || basket.Count == 0)
            throw new InvalidOperationException("Выберите клиента и добавьте хотя бы одну позицию.");
        var lines = basket.Select(item => new BasketLine(item.Stock.Id, item.Quantity));
        int id = store!.PlaceOrder(user, customer.Id, lines, requestId,
            DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Unspecified), calculationDate);
        basket.Clear();
        BasketChanged();
        MessageBox.Show(this, $"Заказ №{id} сохранён. Остатки обновлены.", "Заказ оформлен",
            MessageBoxButton.OK, MessageBoxImage.Information);
        LoadCatalog();
    });

    private void BasketChanged()
    {
        requestId = Guid.NewGuid();
        UpdateIdentity();
        DrawBasket();
    }

    private void DrawBasket()
    {
        int? previous = (BasketGrid.SelectedItem as BasketRow)?.Stock.Id;
        BasketGrid.ItemsSource = basket.ToArray();
        BasketGrid.SelectedItem = basket.Find(item => item.Stock.Id == previous);
        BasketTotal.Text = $"Итого: {basket.Sum(item => item.Total):N2} ₽";
    }

    private void Orders_Click(object sender, RoutedEventArgs e) => Guard(() => LoadOrders());

    private void LoadOrders(int? selected = null)
    {
        var user = RequireActor();
        var orders = store!.Orders(user);
        OrdersGrid.ItemsSource = orders;
        OrdersGrid.SelectedItem = orders.Find(order => order.Id == selected);
        AdminActions.Visibility = user.IsAdmin ? Visibility.Visible : Visibility.Collapsed;
        Show(OrdersView, "Заказы клиентов");
    }

    private void OrderSelectionChanged(object sender, RoutedEventArgs e)
    {
        LinesGrid.ItemsSource = null;
        OrderDateBox.SelectedDate = null;
        OrderSummary.Text = "Состав заказа";
        if (OrdersGrid.SelectedItem is OrderHeader order)
            Guard(() =>
            {
                LinesGrid.ItemsSource = store!.OrderLines(RequireActor(), order.Id);
                OrderDateBox.SelectedDate = order.Date;
                OrderSummary.Text = $"Состав заказа №{order.Id} · Итого: {order.Total:N2} ₽";
            });
    }

    private void DeleteOrder_Click(object sender, RoutedEventArgs e) => Guard(() =>
    {
        var order = SelectedOrder();
        if (Ask("Удаление заказа", $"Удалить заказ №{order.Id}? Остатки по новому заказу будут восстановлены."))
        {
            store!.DeleteOrder(RequireActor(), order.Id);
            LoadOrders();
        }
    });

    private void ChangeDate_Click(object sender, RoutedEventArgs e) => Guard(() =>
    {
        var order = SelectedOrder();
        var date = OrderDateBox.SelectedDate ?? throw new InvalidOperationException("Выберите новую дату.");
        store!.ChangeDate(RequireActor(), order.Id, date);
        LoadOrders(order.Id);
    });

    private void DeleteOrderLine_Click(object sender, RoutedEventArgs e) => Guard(() =>
    {
        var order = SelectedOrder();
        if (LinesGrid.SelectedItem is not OrderLine line)
            throw new InvalidOperationException("Выберите строку заказа.");
        if (Ask("Удаление позиции", $"Удалить «{line.Product}», размер {line.Size}, из заказа №{order.Id}?"))
        {
            store!.DeleteLine(RequireActor(), order.Id, line.Id);
            LoadOrders(order.Id);
        }
    });

    private OrderHeader SelectedOrder() => OrdersGrid.SelectedItem as OrderHeader
        ?? throw new InvalidOperationException("Выберите заказ из списка.");

    private User RequireActor() => actor ?? throw new InvalidOperationException("Войдите по учебному логину.");

    private Stock FindStock(Stock size) =>
        store!.Sizes(size.ProductId, includeUnavailable: true).Find(item => item.Id == size.Id)
        ?? throw new InvalidOperationException("Размерная позиция исчезла. Обновите каталог и измените заказ.");

    private static int ReadQuantity(string text, int available)
    {
        if (available <= 0)
            throw new InvalidOperationException("Для выбранной позиции больше нет доступного остатка.");
        if (!int.TryParse(text, out int quantity) || quantity < 1 || quantity > available)
            throw new InvalidOperationException($"Введите целое количество от 1 до {available}.");
        return quantity;
    }

    private void Show(UIElement view, string title)
    {
        CatalogView.Visibility = view == CatalogView ? Visibility.Visible : Visibility.Collapsed;
        BasketView.Visibility = view == BasketView ? Visibility.Visible : Visibility.Collapsed;
        OrdersView.Visibility = view == OrdersView ? Visibility.Visible : Visibility.Collapsed;
        Title = "Чудо Обувь — " + title;
    }

    private bool Ask(string title, string message) =>
        MessageBox.Show(this, message, title, MessageBoxButton.YesNo, MessageBoxImage.Warning) == MessageBoxResult.Yes;

    private void Guard(Action action)
    {
        try { action(); }
        catch (NpgsqlException)
        {
            MessageBox.Show(this, "Проверьте, что PostgreSQL запущен, учебная база заполнена, а параметры подключения верны. Обновите данные перед повтором.",
                "Ошибка PostgreSQL", MessageBoxButton.OK, MessageBoxImage.Error);
        }
        catch (Exception e) when (e is InvalidOperationException or UnauthorizedAccessException or ArgumentException or OverflowException)
        {
            MessageBox.Show(this, e.Message, "Действие не выполнено", MessageBoxButton.OK, MessageBoxImage.Warning);
        }
    }

    private static ImageSource? ProductImage(string name) =>
        ReadImage("Images", Path.GetFileName(name)) ?? ReadImage("picture.png");

    private static ImageSource? ReadImage(params string[] parts)
    {
        string path = Path.Combine(AppContext.BaseDirectory, "Assets", Path.Combine(parts));
        if (!File.Exists(path))
            return null;
        var image = new BitmapImage();
        image.BeginInit();
        image.CacheOption = BitmapCacheOption.OnLoad;
        image.UriSource = new Uri(path);
        image.EndInit();
        image.Freeze();
        return image;
    }
}
