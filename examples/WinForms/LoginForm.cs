using ProgDemo;

namespace ProgDemo.WinForms;

public partial class LoginForm : Form
{
    private readonly Store store;
    public User? SelectedUser { get; private set; }

    public LoginForm(Store store)
    {
        InitializeComponent();
        this.store = store;
    }

    private void loginButton_Click(object sender, EventArgs e)
    {
        Ui.Guard(() =>
        {
            SelectedUser = store.Login(loginTextBox.Text)
                ?? throw new InvalidOperationException("Логин не найден. Проверьте написание по исходному списку пользователей.");
            DialogResult = DialogResult.OK;
        });
    }

    private void guestButton_Click(object sender, EventArgs e)
    {
        SelectedUser = null;
        DialogResult = DialogResult.OK;
    }
}
