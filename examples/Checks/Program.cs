using ProgDemo;
using MySqlConnector;
using Npgsql;
using System.Data.Common;
using System.Text.Json;

var results=new List<object>();
void Check(string name,Action test){test();results.Add(new {name,passed=true});Console.WriteLine("PASS "+name);}
void Assert(bool ok,string message){if(!ok)throw new Exception(message);}
void Denied(Action action){bool failed=false;try{action();}catch(Exception e) when(e is InvalidOperationException or UnauthorizedAccessException){failed=true;}Assert(failed,"Operation should be rejected");}
Check("previous calendar month across year",()=>{var (s,e)=Rules.PreviousMonth(new DateTime(2027,1,5));Assert(s==new DateTime(2026,12,1)&&e==new DateTime(2027,1,1),"Calendar boundaries");});
Check("discount and rounding",()=>{Assert(Rules.Price(100m,false)==75m&&Rules.Price(100m,true)==100m,"Discount");Assert(Rules.Price(10.01m,false)==7.51m,"Rounding");});
Check("quantity boundaries 3 4 5 6",()=>{Assert(Rules.LowStock(3)&&!Rules.LowStock(4),"Color");Assert(Rules.QuantityLabel(5)=="мало"&&Rules.QuantityLabel(6)=="много","Quantity label");});
var postgresConnection = Environment.GetEnvironmentVariable("PROG_DEMO_POSTGRES_CONNECTION");
bool postgres = !string.IsNullOrWhiteSpace(postgresConnection);
var connection = postgres ? postgresConnection : Environment.GetEnvironmentVariable("PROG_DEMO_CONNECTION");
if(!string.IsNullOrWhiteSpace(connection))
{
    string? database = postgres ? new NpgsqlConnectionStringBuilder(connection).Database
        : new MySqlConnectionStringBuilder(connection).Database;
    if(database?.StartsWith("prog_demo_checks",StringComparison.Ordinal)!=true)throw new Exception("Integration checks require a separate prog_demo_checks* database.");
    DbConnection Connect() => postgres ? new NpgsqlConnection(connection) : new MySqlConnection(connection);
    var store=new Store(Connect,postgres);var date=new DateTime(2026,5,15);
    object? Scalar(string sql)
    {
        using var c=Connect();
        c.Open();
        using var cmd=c.CreateCommand();
        cmd.CommandText=sql;
        return cmd.ExecuteScalar();
    }
    var admin=store.Login("isivanov")!;var manager=store.Login("papetrov")!;var client=store.Login("asidorova")!;
    Check("imported rows",()=>{Assert(Convert.ToInt32(Scalar("SELECT COUNT(*) FROM products"))==31,"products");Assert(Convert.ToInt32(Scalar("SELECT COUNT(*) FROM stock_items"))==92,"stock");Assert(Convert.ToInt32(Scalar("SELECT COUNT(*) FROM orders"))==10,"orders");Assert(Convert.ToInt32(Scalar("SELECT COUNT(*) FROM order_items"))==30,"lines");});
    Check("login without password and unknown login",()=>Assert(admin.IsAdmin&&manager.CanManage&&store.Login("missing") is null&&store.Login("' OR 1=1 --") is null,"Login"));
    var products=store.Catalog(date);
    Check("both discount branches",()=>Assert(products.Any(p=>p.Price==p.BasePrice)&&products.Any(p=>p.Price<p.BasePrice),"Discount branches"));
    Check("combined filter search sort",()=>{var p=products[0];var list=store.Catalog(date,p.Name[..8],p.Category,true);Assert(list.Count>0&&list.All(x=>x.Category==p.Category)&&list.Select(x=>x.Price).SequenceEqual(list.Select(x=>x.Price).OrderByDescending(x=>x)),"Combined filters");});
    var selected=products.First(p=>store.Sizes(p.Id).Any(s=>s.Available>2));var position=store.Sizes(selected.Id).First(s=>s.Available>2);var before=position.Available;
    Check("roles enforced at operation boundary",()=>{Denied(()=>store.Orders(client));Denied(()=>store.Customers(client));Denied(()=>store.ChangeDate(manager,1,date));Denied(()=>store.DeleteLine(manager,1,1));Denied(()=>store.Orders(client with{Role="Администратор"}));Denied(()=>store.PlaceOrder(client,admin.Id,[new(position.Id,1)],Guid.NewGuid(),date));});
    Check("reject invalid quantities",()=>{Denied(()=>store.PlaceOrder(client,client.Id,[new(position.Id,0)],Guid.NewGuid(),date));Denied(()=>store.PlaceOrder(client,client.Id,[new(position.Id,before+1)],Guid.NewGuid(),date));});
    Check("atomic rollback when one position fails",()=>{int count=Convert.ToInt32(Scalar("SELECT COUNT(*) FROM orders"));Denied(()=>store.PlaceOrder(client,client.Id,[new(position.Id,1),new(int.MaxValue,1)],Guid.NewGuid(),date));Assert(Convert.ToInt32(Scalar("SELECT COUNT(*) FROM orders"))==count&&store.Sizes(selected.Id).Single(x=>x.Id==position.Id).Available==before,"Partial write");});
    int id=0;var request=Guid.NewGuid();
    Check("confirmation and duplicate request",()=>{id=store.PlaceOrder(client,client.Id,[new(position.Id,1)],request,date);Assert(store.PlaceOrder(client,client.Id,[new(position.Id,1)],request,date)==id,"Duplicate request");Assert(store.Sizes(selected.Id).Single(x=>x.Id==position.Id).Available==before-1,"Stock");});
    Check("stored unit price and admin edit",()=>{var lines=store.OrderLines(admin,id);Assert(lines.Count==1&&lines[0].Price==selected.Price,"Stored price");store.ChangeDate(admin,id,date.AddDays(2));Assert(store.Orders(admin).Single(x=>x.Id==id).Date==date.AddDays(2),"Edit date");store.DeleteLine(admin,id,lines[0].Id);Assert(store.Sizes(selected.Id).Single(x=>x.Id==position.Id).Available==before,"Return line stock");});
    Check("manager delete and repeat rejection",()=>{store.DeleteOrder(manager,id);Denied(()=>store.DeleteOrder(manager,id));Assert(store.Sizes(selected.Id).Single(x=>x.Id==position.Id).Available==before,"Double return");});
    Check("exhausted size stays in the range but cannot be ordered", () =>
    {
        int order = store.PlaceOrder(client, client.Id, [new(position.Id, before)], Guid.NewGuid(), date);
        try
        {
            Assert(store.Sizes(selected.Id).All(size => size.Id != position.Id), "Exhausted size is selectable");
            Assert(store.Sizes(selected.Id, includeUnavailable: true)
                .Any(size => size.Id == position.Id && size.Available == 0), "Size range lost an exhausted size");
        }
        finally { store.DeleteOrder(admin, order); }
    });
    Check("order date is independent of the discount calculation date", () =>
    {
        var product = products.First(p => p.Price == p.BasePrice && store.Sizes(p.Id).Count > 0);
        var size = store.Sizes(product.Id)[0];
        var orderDate = new DateTime(2026, 11, 9, 16, 30, 0);
        int order = store.PlaceOrder(client, client.Id, [new(size.Id, 1)], Guid.NewGuid(), orderDate, calculationDate: date);
        try
        {
            Assert(store.Orders(admin).Single(row => row.Id == order).Date == orderDate, "Wrong order date");
            Assert(store.OrderLines(admin, order).Single().Price == product.Price, "Wrong pricing month");
        }
        finally { store.DeleteOrder(admin, order); }
    });
    Check("order cancellation restores stock once",()=>{int next=store.PlaceOrder(manager,client.Id,[new(position.Id,2)],Guid.NewGuid(),date);store.DeleteOrder(admin,next);Assert(store.Sizes(selected.Id).Single(x=>x.Id==position.Id).Available==before,"Cancel stock");});
}
var json=JsonSerializer.Serialize(new {checks=results,integration=!string.IsNullOrWhiteSpace(connection)},new JsonSerializerOptions{WriteIndented=true});
if(args.Length>0)File.WriteAllText(args[0],json);
Console.WriteLine(json);
