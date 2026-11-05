namespace ProgDemo.WinForms
{
    partial class ConnectionForm
    {
        /// <summary>
        ///  Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        ///  Clean up any resources being used.
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
        ///  Required method for Designer support - do not modify
        ///  the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            connectButton = new Button();
            serverTextBox = new TextBox();
            portTextBox = new TextBox();
            databaseTextBox = new TextBox();
            userTextBox = new TextBox();
            passwordTextBox = new TextBox();
            serverLabel = new Label();
            portLabel = new Label();
            databaseLabel = new Label();
            userLabel = new Label();
            passwordLabel = new Label();
            headingLabel = new Label();
            noteLabel = new Label();
            SuspendLayout();
            // 
            // connectButton
            // 
            connectButton.BackColor = Color.FromArgb(112, 178, 175);
            connectButton.FlatStyle = FlatStyle.Flat;
            connectButton.Location = new Point(210, 350);
            connectButton.Margin = new Padding(3, 2, 3, 2);
            connectButton.Name = "connectButton";
            connectButton.Size = new Size(380, 42);
            connectButton.TabIndex = 5;
            connectButton.Text = "Проверить и открыть";
            connectButton.UseVisualStyleBackColor = false;
            connectButton.Click += connectButton_Click;
            // 
            // serverTextBox
            // 
            serverTextBox.Location = new Point(210, 90);
            serverTextBox.Name = "serverTextBox";
            serverTextBox.Size = new Size(380, 25);
            serverTextBox.TabIndex = 0;
            serverTextBox.Text = "127.0.0.1";
            // 
            // portTextBox
            // 
            portTextBox.Location = new Point(210, 140);
            portTextBox.Name = "portTextBox";
            portTextBox.Size = new Size(380, 25);
            portTextBox.TabIndex = 1;
            portTextBox.Text = "3306";
            // 
            // databaseTextBox
            // 
            databaseTextBox.Location = new Point(210, 190);
            databaseTextBox.Name = "databaseTextBox";
            databaseTextBox.Size = new Size(380, 25);
            databaseTextBox.TabIndex = 2;
            databaseTextBox.Text = "prog_demo_student";
            // 
            // userTextBox
            // 
            userTextBox.Location = new Point(210, 240);
            userTextBox.Name = "userTextBox";
            userTextBox.Size = new Size(380, 25);
            userTextBox.TabIndex = 3;
            userTextBox.Text = "root";
            // 
            // passwordTextBox
            // 
            passwordTextBox.Location = new Point(210, 290);
            passwordTextBox.Name = "passwordTextBox";
            passwordTextBox.Size = new Size(380, 25);
            passwordTextBox.TabIndex = 4;
            passwordTextBox.UseSystemPasswordChar = true;
            // 
            // serverLabel
            // 
            serverLabel.Location = new Point(28, 90);
            serverLabel.Name = "serverLabel";
            serverLabel.Size = new Size(170, 28);
            serverLabel.TabIndex = 5;
            serverLabel.Text = "Сервер";
            // 
            // portLabel
            // 
            portLabel.Location = new Point(28, 140);
            portLabel.Name = "portLabel";
            portLabel.Size = new Size(170, 28);
            portLabel.TabIndex = 6;
            portLabel.Text = "Порт";
            // 
            // databaseLabel
            // 
            databaseLabel.Location = new Point(28, 190);
            databaseLabel.Name = "databaseLabel";
            databaseLabel.Size = new Size(170, 28);
            databaseLabel.TabIndex = 7;
            databaseLabel.Text = "База данных";
            // 
            // userLabel
            // 
            userLabel.Location = new Point(28, 240);
            userLabel.Name = "userLabel";
            userLabel.Size = new Size(170, 28);
            userLabel.TabIndex = 8;
            userLabel.Text = "Пользователь СУБД";
            // 
            // passwordLabel
            // 
            passwordLabel.Location = new Point(28, 290);
            passwordLabel.Name = "passwordLabel";
            passwordLabel.Size = new Size(170, 28);
            passwordLabel.TabIndex = 9;
            passwordLabel.Text = "Пароль СУБД";
            // 
            // headingLabel
            // 
            headingLabel.Font = new Font("Calibri", 16F, FontStyle.Bold);
            headingLabel.Location = new Point(28, 24);
            headingLabel.Name = "headingLabel";
            headingLabel.Size = new Size(580, 42);
            headingLabel.TabIndex = 10;
            headingLabel.Text = "Подключение к базе";
            // 
            // noteLabel
            // 
            noteLabel.Location = new Point(28, 420);
            noteLabel.Name = "noteLabel";
            noteLabel.Size = new Size(580, 110);
            noteLabel.TabIndex = 11;
            noteLabel.Text = "Сначала создайте таблицы и загрузите данные в свою учебную базу. Эти реквизиты относятся к СУБД. Покупатель входит позже по логину без пароля. Настройки подключения не сохраняются на диск.";
            // 
            // ConnectionForm
            // 
            AcceptButton = connectButton;
            AutoScaleDimensions = new SizeF(8F, 18F);
            AutoScaleMode = AutoScaleMode.Font;
            BackColor = Color.White;
            ClientSize = new Size(640, 570);
            Controls.Add(noteLabel);
            Controls.Add(headingLabel);
            Controls.Add(passwordLabel);
            Controls.Add(userLabel);
            Controls.Add(databaseLabel);
            Controls.Add(portLabel);
            Controls.Add(serverLabel);
            Controls.Add(passwordTextBox);
            Controls.Add(userTextBox);
            Controls.Add(databaseTextBox);
            Controls.Add(portTextBox);
            Controls.Add(serverTextBox);
            Controls.Add(connectButton);
            Font = new Font("Calibri", 11F);
            FormBorderStyle = FormBorderStyle.FixedDialog;
            Margin = new Padding(3, 2, 3, 2);
            MaximizeBox = false;
            Name = "ConnectionForm";
            StartPosition = FormStartPosition.CenterScreen;
            Text = "Чудо Обувь — Подключение";
            ResumeLayout(false);
            PerformLayout();
        }

        #endregion

        private Button connectButton;
        private TextBox serverTextBox;
        private TextBox portTextBox;
        private TextBox databaseTextBox;
        private TextBox userTextBox;
        private TextBox passwordTextBox;
        private Label serverLabel;
        private Label portLabel;
        private Label databaseLabel;
        private Label userLabel;
        private Label passwordLabel;
        private Label headingLabel;
        private Label noteLabel;
    }
}
