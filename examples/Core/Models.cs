namespace ProgDemo;

public record User(int Id, string Login, string FullName, string Role)
{
    public bool CanManage => Role is "Администратор" or "Менеджер";
    public bool IsAdmin => Role == "Администратор";
}
public record Product(int Id, string Category, string Manufacturer, string Name, string Image,
    string Composition, string Description, decimal BasePrice, decimal Price, int Quantity);
public record Stock(int Id, int ProductId, string Size, int Available);
public record BasketLine(int StockId, int Quantity);
public record OrderHeader(int Id, DateTime Date, string Customer, decimal Total);
public record OrderLine(int Id, int StockId, string Product, string Manufacturer, string Size,
    int Quantity, decimal Price)
{
    public decimal Total => Quantity * Price;
}

public static class Rules
{
    public static (DateTime Start, DateTime End) PreviousMonth(DateTime date)
    {
        var end = new DateTime(date.Year, date.Month, 1);
        return (end.AddMonths(-1), end);
    }
    public static decimal Price(decimal basePrice, bool orderedLastMonth) =>
        decimal.Round(basePrice * (orderedLastMonth ? 1m : .75m), 2, MidpointRounding.AwayFromZero);
    public static string QuantityLabel(int total) => total > 5 ? "много" : "мало";
    public static bool LowStock(int total) => total <= 3;
}
