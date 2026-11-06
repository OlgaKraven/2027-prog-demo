using MySqlConnector;

namespace ProgDemo.WinForms;

public static class Ui
{
    public static void Guard(Action action)
    {
        try{action();}
        catch(MySqlException){MessageBox.Show("Не удалось выполнить операцию с базой. Проверьте, запущен ли MySQL, импортирована ли база и верны ли настройки подключения. Изменения не подтверждены; обновите каталог перед повтором.","Ошибка базы данных",MessageBoxButtons.OK,MessageBoxIcon.Error);}
        catch(Exception e) when(e is InvalidOperationException or UnauthorizedAccessException or ArgumentException or OverflowException)
        {MessageBox.Show(e.Message,"Действие не выполнено",MessageBoxButtons.OK,MessageBoxIcon.Warning);}
    }
    public static Image Picture(string filename)
    {
        var root=Path.Combine(AppContext.BaseDirectory,"Assets");
        var path=Path.Combine(root,"Images",Path.GetFileName(filename));
        if(!File.Exists(path))path=Path.Combine(root,"picture.png");
        if(!File.Exists(path))return new Bitmap(100,100);
        using var source=Image.FromFile(path);
        return new Bitmap(source);
    }
}
