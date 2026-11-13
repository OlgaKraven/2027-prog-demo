using MySqlConnector;
using System.Data;
using System.Data.Common;

namespace ProgDemo;

public sealed class Store(Func<DbConnection> createConnection, bool postgres)
{
    public Store(string connectionString) : this(() => new MySqlConnection(connectionString), false) { }

    private DbConnection Open()
    {
        var connection = createConnection();
        try
        {
            connection.Open();
            return connection;
        }
        catch
        {
            connection.Dispose();
            throw;
        }
    }
    private static DbCommand Command(DbConnection c, DbTransaction? tx, string sql, params object?[] values)
    {
        var command = c.CreateCommand();
        command.Transaction = tx;
        command.CommandText = sql;
        for (int i = 0; i < values.Length; i++)
        {
            var parameter = command.CreateParameter();
            parameter.ParameterName = "p" + i;
            parameter.Value = values[i] ?? DBNull.Value;
            command.Parameters.Add(parameter);
        }
        return command;
    }
    public User? Login(string login)
    {
        using var c = Open();
        using var cmd = Command(c, null, "SELECT u.id,u.login,CONCAT_WS(' ',u.last_name,u.first_name,u.patronymic),r.name FROM users u JOIN roles r ON r.id=u.role_id WHERE u.login=@p0", login.Trim());
        using var reader = cmd.ExecuteReader();
        return reader.Read() ? new User(reader.GetInt32(0), reader.GetString(1), reader.GetString(2), reader.GetString(3)) : null;
    }
    private static User RequireUser(DbConnection c, DbTransaction? tx, User claimed)
    {
        // Recheck the stored identity and role at the operation boundary.
        using var cmd = Command(c, tx, "SELECT u.id,u.login,CONCAT_WS(' ',u.last_name,u.first_name,u.patronymic),r.name FROM users u JOIN roles r ON r.id=u.role_id WHERE u.id=@p0 AND u.login=@p1", claimed.Id, claimed.Login);
        using var reader = cmd.ExecuteReader();
        if (!reader.Read()) throw new InvalidOperationException("Пользователь больше не доступен. Войдите снова.");
        return new User(reader.GetInt32(0), reader.GetString(1), reader.GetString(2), reader.GetString(3));
    }
    public List<string> Categories()
    {
        using var c = Open();
        using var cmd = Command(c, null, "SELECT name FROM categories ORDER BY name");
        using var reader = cmd.ExecuteReader();
        var result = new List<string>();
        while (reader.Read()) result.Add(reader.GetString(0));
        return result;
    }
    public List<User> Customers(User actor)
    {
        using var c = Open();
        if (!RequireUser(c, null, actor).CanManage) throw new UnauthorizedAccessException("Список клиентов доступен менеджеру и администратору.");
        using var cmd = Command(c, null, "SELECT u.id,u.login,CONCAT_WS(' ',u.last_name,u.first_name,u.patronymic),r.name FROM users u JOIN roles r ON r.id=u.role_id ORDER BY CONCAT_WS(' ',u.last_name,u.first_name,u.patronymic)");
        using var reader = cmd.ExecuteReader();
        var result = new List<User>();
        while (reader.Read()) result.Add(new User(reader.GetInt32(0),reader.GetString(1),reader.GetString(2),reader.GetString(3)));
        return result;
    }
    public List<Product> Catalog(DateTime date, string search = "", string category = "", bool descending = false)
    {
        using var c = Open();
        var (start, end) = Rules.PreviousMonth(date);
        using var cmd = Command(c, null, """
            SELECT p.id,c.name,m.name,p.name,p.image,p.composition,p.description,p.price,
                COALESCE((SELECT SUM(s.available) FROM stock_items s WHERE s.product_id=p.id),0),
                EXISTS(SELECT 1 FROM order_items oi JOIN stock_items s ON s.id=oi.stock_id
                    JOIN orders o ON o.id=oi.order_id WHERE s.product_id=p.id AND o.order_date>=@p0 AND o.order_date<@p1)
            FROM products p JOIN subcategories sc ON sc.id=p.subcategory_id
                JOIN categories c ON c.id=sc.category_id JOIN manufacturers m ON m.id=p.manufacturer_id
            WHERE (@p2='' OR c.name=@p2)
            """, start, end, category);
        using var reader = cmd.ExecuteReader();
        var result = new List<Product>();
        while (reader.Read())
        {
            var name = reader.GetString(3);
            var description = reader.GetString(6);
            // Catalog search must work with Cyrillic even when PostgreSQL uses the C locale.
            if (!name.Contains(search, StringComparison.OrdinalIgnoreCase) &&
                !description.Contains(search, StringComparison.OrdinalIgnoreCase))
                continue;
            var price = reader.GetDecimal(7);
            result.Add(new Product(reader.GetInt32(0), reader.GetString(1), reader.GetString(2), name,
                reader.GetString(4), reader.GetString(5), description, price,
                Rules.Price(price, reader.GetBoolean(9)), Convert.ToInt32(reader.GetValue(8))));
        }
        return descending ? result.OrderByDescending(p => p.Price).ThenBy(p => p.Id).ToList()
            : result.OrderBy(p => p.Price).ThenBy(p => p.Id).ToList();
    }
    public List<Stock> Sizes(int productId, bool includeUnavailable = false)
    {
        using var c = Open();
        using var cmd = Command(c, null, "SELECT s.id,s.product_id,z.label,s.available FROM stock_items s JOIN sizes z ON z.id=s.size_id WHERE s.product_id=@p0 AND (@p1 OR s.available>0) ORDER BY z.sort_value", productId, includeUnavailable);
        using var reader = cmd.ExecuteReader();
        var result = new List<Stock>();
        while (reader.Read()) result.Add(new Stock(reader.GetInt32(0),reader.GetInt32(1),reader.GetString(2),reader.GetInt32(3)));
        return result;
    }
    public int AvailableQuantity(int stockId)
    {
        using var connection = Open();
        using var command = Command(connection, null, "SELECT available FROM stock_items WHERE id=@p0", stockId);
        return Convert.ToInt32(command.ExecuteScalar());
    }
    public int PlaceOrder(User actor, int customerId, IEnumerable<BasketLine> lines, Guid requestId, DateTime date, DateTime? calculationDate = null)
    {
        var basket = lines.GroupBy(x => x.StockId).Select(g => new BasketLine(g.Key, checked(g.Sum(x => x.Quantity)))).OrderBy(x => x.StockId).ToList();
        if (basket.Count == 0 || basket.Any(x => x.Quantity <= 0)) throw new InvalidOperationException("Добавьте товар и укажите положительное целое количество.");
        using var c = Open();
        using var tx = c.BeginTransaction(IsolationLevel.ReadCommitted);
        try
        {
            var user = RequireUser(c, tx, actor);
            if (customerId != user.Id && !user.CanManage) throw new UnauthorizedAccessException("Клиент может оформить заказ только на себя.");
            using (var existing = Command(c, tx, "SELECT id,user_id,created_by FROM orders WHERE request_id=@p0", requestId.ToString()))
            {
                using var reader = existing.ExecuteReader();
                if (reader.Read())
                {
                    if (reader.GetInt32(1) != customerId || reader.GetInt32(2) != user.Id)
                        throw new InvalidOperationException("Идентификатор попытки уже использован.");
                    return reader.GetInt32(0);
                }
            }
            int id = InsertOrder(c, tx, date, customerId, user.Id, requestId);
            var (start,end) = Rules.PreviousMonth(calculationDate ?? date);
            foreach (var item in basket)
            {
                int available,productId;
                decimal basePrice;
                using (var stock = Command(c, tx, "SELECT s.available,s.product_id,p.price FROM stock_items s JOIN products p ON p.id=s.product_id WHERE s.id=@p0 FOR UPDATE", item.StockId))
                {
                    using var reader = stock.ExecuteReader();
                    if (!reader.Read()) throw new InvalidOperationException("Товарная позиция не найдена. Обновите каталог.");
                    available = reader.GetInt32(0);
                    productId = reader.GetInt32(1);
                    basePrice = reader.GetDecimal(2);
                }
                if (item.Quantity > available) throw new InvalidOperationException("Остаток изменился. Обновите каталог и уменьшите количество.");
                bool ordered;
                using (var history = Command(c, tx, "SELECT EXISTS(SELECT 1 FROM order_items oi JOIN orders o ON o.id=oi.order_id JOIN stock_items s ON s.id=oi.stock_id WHERE s.product_id=@p0 AND o.order_date>=@p1 AND o.order_date<@p2)",productId,start,end)) ordered=Convert.ToBoolean(history.ExecuteScalar());
                using (var line = Command(c, tx, "INSERT INTO order_items(order_id,stock_id,quantity,unit_price) VALUES(@p0,@p1,@p2,@p3)",id,item.StockId,item.Quantity,Rules.Price(basePrice,ordered))) line.ExecuteNonQuery();
                using (var update = Command(c, tx, "UPDATE stock_items SET available=available-@p0 WHERE id=@p1 AND available>=@p0",item.Quantity,item.StockId))
                    if (update.ExecuteNonQuery()!=1) throw new InvalidOperationException("Недостаточно товара. Заказ не сохранён.");
            }
            tx.Commit();
            return id;
        }
        catch
        {
            tx.Rollback();
            throw;
        }
    }
    private int InsertOrder(DbConnection c, DbTransaction tx, DateTime date, int customerId, int actorId, Guid requestId)
    {
        const string insert = "INSERT INTO orders(order_date,user_id,created_by,request_id,stock_accounted) VALUES(@p0,@p1,@p2,@p3,TRUE)";
        using var order = Command(c, tx, postgres ? insert + " RETURNING id" : insert, date, customerId, actorId, requestId.ToString());
        if (postgres)
            return Convert.ToInt32(order.ExecuteScalar());
        order.ExecuteNonQuery();
        using var last = Command(c, tx, "SELECT LAST_INSERT_ID()");
        return Convert.ToInt32(last.ExecuteScalar());
    }
    public List<OrderHeader> Orders(User actor)
    {
        using var c = Open();
        if (!RequireUser(c,null,actor).CanManage) throw new UnauthorizedAccessException("Список заказов доступен менеджеру и администратору.");
        using var cmd = Command(c,null,"SELECT o.id,o.order_date,CONCAT_WS(' ',u.last_name,u.first_name,u.patronymic),COALESCE(SUM(i.quantity*i.unit_price),0) FROM orders o JOIN users u ON u.id=o.user_id LEFT JOIN order_items i ON i.order_id=o.id GROUP BY o.id,o.order_date,CONCAT_WS(' ',u.last_name,u.first_name,u.patronymic) ORDER BY o.order_date DESC,o.id DESC");
        using var r=cmd.ExecuteReader();
        var result=new List<OrderHeader>();
        while(r.Read()) result.Add(new OrderHeader(r.GetInt32(0),r.GetDateTime(1),r.GetString(2),r.GetDecimal(3)));
        return result;
    }
    public List<OrderLine> OrderLines(User actor,int orderId)
    {
        using var c=Open();
        if(!RequireUser(c,null,actor).CanManage) throw new UnauthorizedAccessException("Состав заказа доступен менеджеру и администратору.");
        using var cmd=Command(c,null,"SELECT i.id,i.stock_id,p.name,m.name,z.label,i.quantity,i.unit_price FROM order_items i JOIN stock_items s ON s.id=i.stock_id JOIN products p ON p.id=s.product_id JOIN manufacturers m ON m.id=p.manufacturer_id JOIN sizes z ON z.id=s.size_id WHERE i.order_id=@p0 ORDER BY i.id",orderId);
        using var r=cmd.ExecuteReader();
        var result=new List<OrderLine>();
        while(r.Read())result.Add(new OrderLine(r.GetInt32(0),r.GetInt32(1),r.GetString(2),r.GetString(3),r.GetString(4),r.GetInt32(5),r.GetDecimal(6)));
        return result;
    }
    public void DeleteOrder(User actor,int orderId) => ChangeOrder(actor,orderId,null,null);
    public void DeleteLine(User actor,int orderId,int lineId) => ChangeOrder(actor,orderId,lineId,null);
    public void ChangeDate(User actor,int orderId,DateTime date) => ChangeOrder(actor,orderId,null,date);
    private void ChangeOrder(User actor,int orderId,int? lineId,DateTime? date)
    {
        using var c=Open();
        using var tx=c.BeginTransaction();
        try
        {
            var user=RequireUser(c,tx,actor);
            if(!user.CanManage || ((lineId.HasValue||date.HasValue)&&!user.IsAdmin)) throw new UnauthorizedAccessException("Недостаточно прав для изменения заказа.");
            bool accounted;
            using(var cmd=Command(c,tx,"SELECT stock_accounted FROM orders WHERE id=@p0 FOR UPDATE",orderId))
            {
                var value=cmd.ExecuteScalar();
                if(value is null)throw new InvalidOperationException("Заказ уже удалён. Обновите список.");
                accounted=Convert.ToBoolean(value);
            }
            if(date.HasValue)
            {
                using var cmd=Command(c,tx,"UPDATE orders SET order_date=@p0 WHERE id=@p1",date.Value,orderId);
                cmd.ExecuteNonQuery();
            }
            else
            {
                var returned=new List<(int StockId,int Quantity)>();
                using(var cmd=Command(c,tx,"SELECT stock_id,quantity FROM order_items WHERE order_id=@p0 AND id=COALESCE(@p1,id) ORDER BY stock_id FOR UPDATE",orderId,lineId))
                {
                    using var reader=cmd.ExecuteReader();
                    while(reader.Read())returned.Add((reader.GetInt32(0),reader.GetInt32(1)));
                }
                if(lineId.HasValue&&returned.Count==0)throw new InvalidOperationException("Строка заказа не найдена.");
                if(accounted)foreach(var item in returned)
                {
                    using var update=Command(c,tx,"UPDATE stock_items SET available=available+@p0 WHERE id=@p1",item.Quantity,item.StockId);
                    update.ExecuteNonQuery();
                }
                using var remove=Command(c,tx,lineId.HasValue?"DELETE FROM order_items WHERE order_id=@p0 AND id=@p1":"DELETE FROM orders WHERE id=@p0",orderId,lineId);
                remove.ExecuteNonQuery();
            }
            tx.Commit();
        }
        catch
        {
            tx.Rollback();
            throw;
        }
    }
}
