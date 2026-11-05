using MySqlConnector;
using ProgDemo;

namespace ProgDemo.WinForms;

public partial class ConnectionForm : Form
{
    public string ConnectionString { get; private set; } = "";

    public ConnectionForm()
    {
        InitializeComponent();
    }

    private void connectButton_Click(object sender, EventArgs e)
    {
        Ui.Guard(() =>
        {
            if (!uint.TryParse(portTextBox.Text, out var port) || port is < 1 or > 65535)
                throw new InvalidOperationException("Введите порт от 1 до 65535.");

            var builder = new MySqlConnectionStringBuilder
            {
                Server = serverTextBox.Text.Trim(),
                Port = port,
                Database = databaseTextBox.Text.Trim(),
                UserID = userTextBox.Text.Trim(),
                Password = passwordTextBox.Text,
                CharacterSet = "utf8mb4"
            };
            var store = new Store(builder.ConnectionString);
            store.Categories();
            ConnectionString = builder.ConnectionString;
            passwordTextBox.Clear();
            DialogResult = DialogResult.OK;
        });
    }
}
