using ProgDemo;
using System.Globalization;

namespace ProgDemo.WinForms;

internal static class Program
{
    [STAThread]
    static void Main()
    {
        CultureInfo.CurrentCulture = CultureInfo.GetCultureInfo("ru-RU");
        CultureInfo.CurrentUICulture = CultureInfo.CurrentCulture;
        ApplicationConfiguration.Initialize();
        var connection = Environment.GetEnvironmentVariable("PROG_DEMO_CONNECTION");
        if (string.IsNullOrWhiteSpace(connection))
        {
            using var setup = new ConnectionForm();
            if (setup.ShowDialog() != DialogResult.OK) return;
            connection = setup.ConnectionString;
        }
        Ui.Guard(() => Application.Run(new CatalogForm(new Store(connection))));
    }
}
