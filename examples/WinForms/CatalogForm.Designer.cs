namespace ProgDemo.WinForms
{
    partial class CatalogForm
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
            System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(CatalogForm));
            DataGridViewCellStyle dataGridViewCellStyle2 = new DataGridViewCellStyle();
            DataGridViewCellStyle dataGridViewCellStyle1 = new DataGridViewCellStyle();
            logoPictureBox = new PictureBox();
            titleLabel = new Label();
            identityLabel = new Label();
            loginButton = new Button();
            cartButton = new Button();
            ordersButton = new Button();
            refreshButton = new Button();
            dateLabel = new Label();
            searchLabel = new Label();
            searchTextBox = new TextBox();
            categoryComboBox = new ComboBox();
            sortComboBox = new ComboBox();
            statusLabel = new Label();
            catalogGrid = new DataGridView();
            imageColumn = new DataGridViewImageColumn();
            detailsColumn = new DataGridViewTextBoxColumn();
            priceColumn = new DataGridViewTextBoxColumn();
            ((System.ComponentModel.ISupportInitialize)logoPictureBox).BeginInit();
            ((System.ComponentModel.ISupportInitialize)catalogGrid).BeginInit();
            SuspendLayout();
            // 
            // logoPictureBox
            // 
            logoPictureBox.Image = (Image)resources.GetObject("logoPictureBox.Image");
            logoPictureBox.Location = new Point(24, 12);
            logoPictureBox.Name = "logoPictureBox";
            logoPictureBox.Size = new Size(85, 65);
            logoPictureBox.SizeMode = PictureBoxSizeMode.Zoom;
            logoPictureBox.TabIndex = 0;
            logoPictureBox.TabStop = false;
            // 
            // titleLabel
            // 
            titleLabel.Font = new Font("Calibri", 16F, FontStyle.Bold);
            titleLabel.Location = new Point(125, 12);
            titleLabel.Name = "titleLabel";
            titleLabel.Size = new Size(450, 65);
            titleLabel.TabIndex = 1;
            titleLabel.Text = "Чудо Обувь\nКаталог моделей и размеров";
            // 
            // identityLabel
            // 
            identityLabel.Anchor = AnchorStyles.Top | AnchorStyles.Right;
            identityLabel.Location = new Point(600, 12);
            identityLabel.Name = "identityLabel";
            identityLabel.Size = new Size(360, 65);
            identityLabel.TabIndex = 2;
            identityLabel.Text = "Гость";
            identityLabel.TextAlign = ContentAlignment.MiddleRight;
            // 
            // loginButton
            // 
            loginButton.BackColor = Color.FromArgb(210, 246, 231);
            loginButton.FlatStyle = FlatStyle.Flat;
            loginButton.Location = new Point(24, 100);
            loginButton.Name = "loginButton";
            loginButton.Size = new Size(250, 40);
            loginButton.TabIndex = 0;
            loginButton.Text = "Войти / сменить пользователя";
            loginButton.UseVisualStyleBackColor = false;
            loginButton.Click += loginButton_Click;
            // 
            // cartButton
            // 
            cartButton.BackColor = Color.FromArgb(112, 178, 175);
            cartButton.FlatStyle = FlatStyle.Flat;
            cartButton.Location = new Point(285, 100);
            cartButton.Name = "cartButton";
            cartButton.Size = new Size(200, 40);
            cartButton.TabIndex = 1;
            cartButton.Text = "Мой заказ (0)";
            cartButton.UseVisualStyleBackColor = false;
            cartButton.Click += cartButton_Click;
            // 
            // ordersButton
            // 
            ordersButton.BackColor = Color.FromArgb(210, 246, 231);
            ordersButton.FlatStyle = FlatStyle.Flat;
            ordersButton.Location = new Point(495, 100);
            ordersButton.Name = "ordersButton";
            ordersButton.Size = new Size(200, 40);
            ordersButton.TabIndex = 2;
            ordersButton.Text = "Заказы клиентов";
            ordersButton.UseVisualStyleBackColor = false;
            ordersButton.Click += ordersButton_Click;
            // 
            // refreshButton
            // 
            refreshButton.BackColor = Color.FromArgb(210, 246, 231);
            refreshButton.FlatStyle = FlatStyle.Flat;
            refreshButton.Location = new Point(705, 100);
            refreshButton.Name = "refreshButton";
            refreshButton.Size = new Size(250, 40);
            refreshButton.TabIndex = 3;
            refreshButton.Text = "Обновить каталог";
            refreshButton.UseVisualStyleBackColor = false;
            refreshButton.Click += refreshButton_Click;
            // 
            // dateLabel
            // 
            dateLabel.Location = new Point(24, 150);
            dateLabel.Name = "dateLabel";
            dateLabel.Size = new Size(600, 30);
            dateLabel.TabIndex = 4;
            dateLabel.Text = "Дата расчёта";
            // 
            // searchLabel
            // 
            searchLabel.Location = new Point(24, 190);
            searchLabel.Name = "searchLabel";
            searchLabel.Size = new Size(60, 30);
            searchLabel.TabIndex = 5;
            searchLabel.Text = "Поиск";
            // 
            // searchTextBox
            // 
            searchTextBox.Location = new Point(90, 190);
            searchTextBox.Name = "searchTextBox";
            searchTextBox.PlaceholderText = "Название или описание";
            searchTextBox.Size = new Size(260, 25);
            searchTextBox.TabIndex = 4;
            searchTextBox.TextChanged += searchTextBox_TextChanged;
            // 
            // categoryComboBox
            // 
            categoryComboBox.DropDownStyle = ComboBoxStyle.DropDownList;
            categoryComboBox.FormattingEnabled = true;
            categoryComboBox.Location = new Point(370, 190);
            categoryComboBox.Name = "categoryComboBox";
            categoryComboBox.Size = new Size(250, 26);
            categoryComboBox.TabIndex = 5;
            categoryComboBox.SelectedIndexChanged += categoryComboBox_SelectedIndexChanged;
            // 
            // sortComboBox
            // 
            sortComboBox.DropDownStyle = ComboBoxStyle.DropDownList;
            sortComboBox.FormattingEnabled = true;
            sortComboBox.Items.AddRange(new object[] { "Цена: по возрастанию", "Цена: по убыванию" });
            sortComboBox.Location = new Point(640, 190);
            sortComboBox.Name = "sortComboBox";
            sortComboBox.Size = new Size(315, 26);
            sortComboBox.TabIndex = 6;
            sortComboBox.SelectedIndexChanged += sortComboBox_SelectedIndexChanged;
            // 
            // statusLabel
            // 
            statusLabel.Anchor = AnchorStyles.Bottom | AnchorStyles.Left | AnchorStyles.Right;
            statusLabel.Location = new Point(24, 595);
            statusLabel.Name = "statusLabel";
            statusLabel.Size = new Size(952, 25);
            statusLabel.TabIndex = 7;
            statusLabel.Text = "Выберите модель двойным щелчком";
            // 
            // catalogGrid
            // 
            catalogGrid.AllowUserToAddRows = false;
            catalogGrid.AllowUserToDeleteRows = false;
            catalogGrid.Anchor = AnchorStyles.Top | AnchorStyles.Bottom | AnchorStyles.Left | AnchorStyles.Right;
            catalogGrid.AutoSizeColumnsMode = DataGridViewAutoSizeColumnsMode.Fill;
            catalogGrid.AutoSizeRowsMode = DataGridViewAutoSizeRowsMode.AllCells;
            catalogGrid.BackgroundColor = Color.White;
            catalogGrid.ColumnHeadersHeightSizeMode = DataGridViewColumnHeadersHeightSizeMode.AutoSize;
            catalogGrid.ColumnHeadersVisible = false;
            catalogGrid.Columns.AddRange(new DataGridViewColumn[] { imageColumn, detailsColumn, priceColumn });
            dataGridViewCellStyle2.Alignment = DataGridViewContentAlignment.MiddleLeft;
            dataGridViewCellStyle2.BackColor = SystemColors.Window;
            dataGridViewCellStyle2.Font = new Font("Calibri", 11F);
            dataGridViewCellStyle2.ForeColor = SystemColors.ControlText;
            dataGridViewCellStyle2.SelectionBackColor = SystemColors.Highlight;
            dataGridViewCellStyle2.SelectionForeColor = SystemColors.HighlightText;
            dataGridViewCellStyle2.WrapMode = DataGridViewTriState.True;
            catalogGrid.DefaultCellStyle = dataGridViewCellStyle2;
            catalogGrid.Location = new Point(24, 235);
            catalogGrid.MultiSelect = false;
            catalogGrid.Name = "catalogGrid";
            catalogGrid.ReadOnly = true;
            catalogGrid.RowHeadersVisible = false;
            catalogGrid.RowTemplate.Height = 160;
            catalogGrid.SelectionMode = DataGridViewSelectionMode.FullRowSelect;
            catalogGrid.Size = new Size(952, 350);
            catalogGrid.TabIndex = 7;
            catalogGrid.CellDoubleClick += catalogGrid_CellDoubleClick;
            catalogGrid.CellFormatting += catalogGrid_CellFormatting;
            // 
            // imageColumn
            // 
            imageColumn.DataPropertyName = "Image";
            imageColumn.FillWeight = 130F;
            imageColumn.HeaderText = "Фото";
            imageColumn.ImageLayout = DataGridViewImageCellLayout.Zoom;
            imageColumn.Name = "imageColumn";
            imageColumn.ReadOnly = true;
            // 
            // detailsColumn
            // 
            detailsColumn.DataPropertyName = "Details";
            detailsColumn.FillWeight = 650F;
            detailsColumn.HeaderText = "Модель";
            detailsColumn.Name = "detailsColumn";
            detailsColumn.ReadOnly = true;
            detailsColumn.SortMode = DataGridViewColumnSortMode.NotSortable;
            // 
            // priceColumn
            // 
            priceColumn.DataPropertyName = "Price";
            dataGridViewCellStyle1.Alignment = DataGridViewContentAlignment.MiddleRight;
            dataGridViewCellStyle1.Font = new Font("Calibri", 16F, FontStyle.Bold);
            dataGridViewCellStyle1.Format = "C2";
            priceColumn.DefaultCellStyle = dataGridViewCellStyle1;
            priceColumn.FillWeight = 170F;
            priceColumn.HeaderText = "Цена";
            priceColumn.Name = "priceColumn";
            priceColumn.ReadOnly = true;
            priceColumn.SortMode = DataGridViewColumnSortMode.NotSortable;
            // 
            // CatalogForm
            // 
            AutoScaleDimensions = new SizeF(8F, 18F);
            AutoScaleMode = AutoScaleMode.Font;
            BackColor = Color.White;
            ClientSize = new Size(1000, 640);
            Controls.Add(catalogGrid);
            Controls.Add(statusLabel);
            Controls.Add(sortComboBox);
            Controls.Add(categoryComboBox);
            Controls.Add(searchTextBox);
            Controls.Add(searchLabel);
            Controls.Add(dateLabel);
            Controls.Add(refreshButton);
            Controls.Add(ordersButton);
            Controls.Add(cartButton);
            Controls.Add(loginButton);
            Controls.Add(identityLabel);
            Controls.Add(titleLabel);
            Controls.Add(logoPictureBox);
            Font = new Font("Calibri", 11F);
            Icon = (Icon)resources.GetObject("$this.Icon");
            Margin = new Padding(3, 4, 3, 4);
            MinimumSize = new Size(1016, 560);
            Name = "CatalogForm";
            StartPosition = FormStartPosition.CenterScreen;
            Text = "Чудо Обувь — Каталог";
            FormClosed += CatalogForm_FormClosed;
            ((System.ComponentModel.ISupportInitialize)logoPictureBox).EndInit();
            ((System.ComponentModel.ISupportInitialize)catalogGrid).EndInit();
            ResumeLayout(false);
            PerformLayout();
        }

        #endregion

        private PictureBox logoPictureBox;
        private Label titleLabel;
        private Label identityLabel;
        private Button loginButton;
        private Button cartButton;
        private Button ordersButton;
        private Button refreshButton;
        private Label dateLabel;
        private Label searchLabel;
        private TextBox searchTextBox;
        private ComboBox categoryComboBox;
        private ComboBox sortComboBox;
        private Label statusLabel;
        private DataGridView catalogGrid;
        private DataGridViewImageColumn imageColumn;
        private DataGridViewTextBoxColumn detailsColumn;
        private DataGridViewTextBoxColumn priceColumn;
    }
}