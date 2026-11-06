namespace ProgDemo.WinForms
{
    partial class OrdersForm
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
            DataGridViewCellStyle dataGridViewCellStyle3 = new DataGridViewCellStyle();
            DataGridViewCellStyle dataGridViewCellStyle1 = new DataGridViewCellStyle();
            DataGridViewCellStyle dataGridViewCellStyle2 = new DataGridViewCellStyle();
            headingLabel = new Label();
            statusLabel = new Label();
            detailsButton = new Button();
            addOrderButton = new Button();
            deleteOrderButton = new Button();
            backButton = new Button();
            ordersGrid = new DataGridView();
            idColumn = new DataGridViewTextBoxColumn();
            dateColumn = new DataGridViewTextBoxColumn();
            customerColumn = new DataGridViewTextBoxColumn();
            totalColumn = new DataGridViewTextBoxColumn();
            ((System.ComponentModel.ISupportInitialize)ordersGrid).BeginInit();
            SuspendLayout();
            // 
            // headingLabel
            // 
            headingLabel.Font = new Font("Calibri", 16F, FontStyle.Bold);
            headingLabel.Location = new Point(24, 16);
            headingLabel.Name = "headingLabel";
            headingLabel.Size = new Size(600, 40);
            headingLabel.TabIndex = 0;
            headingLabel.Text = "Заказы клиентов";
            // 
            // statusLabel
            // 
            statusLabel.Anchor = AnchorStyles.Bottom | AnchorStyles.Left | AnchorStyles.Right;
            statusLabel.Location = new Point(24, 595);
            statusLabel.Name = "statusLabel";
            statusLabel.Size = new Size(932, 25);
            statusLabel.TabIndex = 1;
            statusLabel.Text = "Заказов: 0";
            // 
            // detailsButton
            // 
            detailsButton.BackColor = Color.FromArgb(210, 246, 231);
            detailsButton.FlatStyle = FlatStyle.Flat;
            detailsButton.Location = new Point(24, 70);
            detailsButton.Name = "detailsButton";
            detailsButton.Size = new Size(200, 42);
            detailsButton.TabIndex = 0;
            detailsButton.Text = "Состав заказа";
            detailsButton.UseVisualStyleBackColor = false;
            detailsButton.Click += detailsButton_Click;
            // 
            // addOrderButton
            // 
            addOrderButton.BackColor = Color.FromArgb(112, 178, 175);
            addOrderButton.FlatStyle = FlatStyle.Flat;
            addOrderButton.Location = new Point(234, 70);
            addOrderButton.Name = "addOrderButton";
            addOrderButton.Size = new Size(200, 42);
            addOrderButton.TabIndex = 1;
            addOrderButton.Text = "Добавить заказ";
            addOrderButton.UseVisualStyleBackColor = false;
            addOrderButton.Click += addOrderButton_Click;
            // 
            // deleteOrderButton
            // 
            deleteOrderButton.BackColor = Color.FromArgb(210, 246, 231);
            deleteOrderButton.FlatStyle = FlatStyle.Flat;
            deleteOrderButton.Location = new Point(444, 70);
            deleteOrderButton.Name = "deleteOrderButton";
            deleteOrderButton.Size = new Size(200, 42);
            deleteOrderButton.TabIndex = 2;
            deleteOrderButton.Text = "Удалить заказ";
            deleteOrderButton.UseVisualStyleBackColor = false;
            deleteOrderButton.Click += deleteOrderButton_Click;
            // 
            // backButton
            // 
            backButton.BackColor = Color.FromArgb(210, 246, 231);
            backButton.FlatStyle = FlatStyle.Flat;
            backButton.Location = new Point(654, 70);
            backButton.Name = "backButton";
            backButton.Size = new Size(250, 42);
            backButton.TabIndex = 3;
            backButton.Text = "Назад в каталог";
            backButton.UseVisualStyleBackColor = false;
            backButton.Click += backButton_Click;
            // 
            // ordersGrid
            // 
            ordersGrid.AllowUserToAddRows = false;
            ordersGrid.AllowUserToDeleteRows = false;
            ordersGrid.Anchor = AnchorStyles.Top | AnchorStyles.Bottom | AnchorStyles.Left | AnchorStyles.Right;
            ordersGrid.AutoSizeColumnsMode = DataGridViewAutoSizeColumnsMode.Fill;
            ordersGrid.AutoSizeRowsMode = DataGridViewAutoSizeRowsMode.AllCells;
            ordersGrid.BackgroundColor = Color.White;
            ordersGrid.ColumnHeadersHeightSizeMode = DataGridViewColumnHeadersHeightSizeMode.AutoSize;
            ordersGrid.Columns.AddRange(new DataGridViewColumn[] { idColumn, dateColumn, customerColumn, totalColumn });
            dataGridViewCellStyle3.Alignment = DataGridViewContentAlignment.MiddleLeft;
            dataGridViewCellStyle3.BackColor = SystemColors.Window;
            dataGridViewCellStyle3.Font = new Font("Calibri", 11F);
            dataGridViewCellStyle3.ForeColor = SystemColors.ControlText;
            dataGridViewCellStyle3.SelectionBackColor = SystemColors.Highlight;
            dataGridViewCellStyle3.SelectionForeColor = SystemColors.HighlightText;
            dataGridViewCellStyle3.WrapMode = DataGridViewTriState.True;
            ordersGrid.DefaultCellStyle = dataGridViewCellStyle3;
            ordersGrid.Location = new Point(24, 130);
            ordersGrid.MultiSelect = false;
            ordersGrid.Name = "ordersGrid";
            ordersGrid.ReadOnly = true;
            ordersGrid.RowHeadersVisible = false;
            ordersGrid.SelectionMode = DataGridViewSelectionMode.FullRowSelect;
            ordersGrid.Size = new Size(932, 450);
            ordersGrid.TabIndex = 4;
            // 
            // idColumn
            // 
            idColumn.DataPropertyName = "Id";
            idColumn.FillWeight = 35F;
            idColumn.HeaderText = "№ заказа";
            idColumn.Name = "idColumn";
            idColumn.ReadOnly = true;
            idColumn.SortMode = DataGridViewColumnSortMode.NotSortable;
            // 
            // dateColumn
            // 
            dateColumn.DataPropertyName = "Date";
            dataGridViewCellStyle1.Format = "dd.MM.yyyy";
            dateColumn.DefaultCellStyle = dataGridViewCellStyle1;
            dateColumn.FillWeight = 60F;
            dateColumn.HeaderText = "Дата заказа";
            dateColumn.Name = "dateColumn";
            dateColumn.ReadOnly = true;
            dateColumn.SortMode = DataGridViewColumnSortMode.NotSortable;
            // 
            // customerColumn
            // 
            customerColumn.DataPropertyName = "Customer";
            customerColumn.FillWeight = 180F;
            customerColumn.HeaderText = "ФИО клиента";
            customerColumn.Name = "customerColumn";
            customerColumn.ReadOnly = true;
            customerColumn.SortMode = DataGridViewColumnSortMode.NotSortable;
            // 
            // totalColumn
            // 
            totalColumn.DataPropertyName = "Total";
            dataGridViewCellStyle2.Alignment = DataGridViewContentAlignment.MiddleRight;
            dataGridViewCellStyle2.Format = "N2";
            totalColumn.DefaultCellStyle = dataGridViewCellStyle2;
            totalColumn.FillWeight = 60F;
            totalColumn.HeaderText = "Итог, ₽";
            totalColumn.Name = "totalColumn";
            totalColumn.ReadOnly = true;
            totalColumn.SortMode = DataGridViewColumnSortMode.NotSortable;
            // 
            // OrdersForm
            // 
            AutoScaleDimensions = new SizeF(8F, 18F);
            AutoScaleMode = AutoScaleMode.Font;
            BackColor = Color.White;
            ClientSize = new Size(980, 640);
            Controls.Add(ordersGrid);
            Controls.Add(backButton);
            Controls.Add(deleteOrderButton);
            Controls.Add(addOrderButton);
            Controls.Add(detailsButton);
            Controls.Add(statusLabel);
            Controls.Add(headingLabel);
            Font = new Font("Calibri", 11F);
            Margin = new Padding(3, 4, 3, 4);
            MinimumSize = new Size(996, 560);
            Name = "OrdersForm";
            StartPosition = FormStartPosition.CenterParent;
            Text = "Чудо Обувь — Заказы клиентов";
            ((System.ComponentModel.ISupportInitialize)ordersGrid).EndInit();
            ResumeLayout(false);
        }

        #endregion

        private Label headingLabel;
        private Label statusLabel;
        private Button detailsButton;
        private Button addOrderButton;
        private Button deleteOrderButton;
        private Button backButton;
        private DataGridView ordersGrid;
        private DataGridViewTextBoxColumn idColumn;
        private DataGridViewTextBoxColumn dateColumn;
        private DataGridViewTextBoxColumn customerColumn;
        private DataGridViewTextBoxColumn totalColumn;
    }
}