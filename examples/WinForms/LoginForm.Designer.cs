namespace ProgDemo.WinForms
{
    partial class LoginForm
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            headingLabel = new Label();
            noteLabel = new Label();
            loginLabel = new Label();
            loginTextBox = new TextBox();
            loginButton = new Button();
            guestButton = new Button();
            SuspendLayout();
            // 
            // headingLabel
            // 
            headingLabel.Font = new Font("Calibri", 16F, FontStyle.Bold);
            headingLabel.Location = new Point(24, 20);
            headingLabel.Name = "headingLabel";
            headingLabel.Size = new Size(450, 40);
            headingLabel.TabIndex = 0;
            headingLabel.Text = "Вход в Чудо Обувь";
            // 
            // noteLabel
            // 
            noteLabel.Location = new Point(24, 64);
            noteLabel.Name = "noteLabel";
            noteLabel.Size = new Size(450, 60);
            noteLabel.TabIndex = 1;
            noteLabel.Text = "Введите логин из списка пользователей. Пароль покупателя не требуется.";
            // 
            // loginLabel
            // 
            loginLabel.Location = new Point(24, 140);
            loginLabel.Name = "loginLabel";
            loginLabel.Size = new Size(100, 30);
            loginLabel.TabIndex = 2;
            loginLabel.Text = "Логин";
            // 
            // loginTextBox
            // 
            loginTextBox.Location = new Point(140, 140);
            loginTextBox.Name = "loginTextBox";
            loginTextBox.Size = new Size(330, 25);
            loginTextBox.TabIndex = 0;
            // 
            // loginButton
            // 
            loginButton.BackColor = Color.FromArgb(112, 178, 175);
            loginButton.FlatStyle = FlatStyle.Flat;
            loginButton.Location = new Point(140, 200);
            loginButton.Name = "loginButton";
            loginButton.Size = new Size(160, 40);
            loginButton.TabIndex = 1;
            loginButton.Text = "Войти";
            loginButton.UseVisualStyleBackColor = false;
            loginButton.Click += loginButton_Click;
            // 
            // guestButton
            // 
            guestButton.BackColor = Color.FromArgb(210, 246, 231);
            guestButton.FlatStyle = FlatStyle.Flat;
            guestButton.Location = new Point(310, 200);
            guestButton.Name = "guestButton";
            guestButton.Size = new Size(160, 40);
            guestButton.TabIndex = 2;
            guestButton.Text = "Как гость";
            guestButton.UseVisualStyleBackColor = false;
            guestButton.Click += guestButton_Click;
            // 
            // LoginForm
            // 
            AcceptButton = loginButton;
            AutoScaleDimensions = new SizeF(8F, 18F);
            AutoScaleMode = AutoScaleMode.Font;
            BackColor = Color.White;
            ClientSize = new Size(490, 340);
            Controls.Add(guestButton);
            Controls.Add(loginButton);
            Controls.Add(loginTextBox);
            Controls.Add(loginLabel);
            Controls.Add(noteLabel);
            Controls.Add(headingLabel);
            Font = new Font("Calibri", 11F);
            FormBorderStyle = FormBorderStyle.FixedDialog;
            Margin = new Padding(3, 4, 3, 4);
            MaximizeBox = false;
            Name = "LoginForm";
            StartPosition = FormStartPosition.CenterParent;
            Text = "Чудо Обувь — Вход";
            ResumeLayout(false);
            PerformLayout();
        }

        #endregion

        private Label headingLabel;
        private Label noteLabel;
        private Label loginLabel;
        private TextBox loginTextBox;
        private Button loginButton;
        private Button guestButton;
    }
}