namespace ProgDemo.WinForms
{
    partial class BasketForm
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
            customerLabel = new Label();
            totalLabel = new Label();
            customerComboBox = new ComboBox();
            quantityNumericUpDown = new NumericUpDown();
            quantityButton = new Button();
            removeButton = new Button();
            backButton = new Button();
            cancelButton = new Button();
            confirmButton = new Button();
            basketGrid = new DataGridView();
            stockIdColumn = new DataGridViewTextBoxColumn();
            productColumn = new DataGridViewTextBoxColumn();
            sizeColumn = new DataGridViewTextBoxColumn();
            quantityColumn = new DataGridViewTextBoxColumn();
            priceColumn = new DataGridViewTextBoxColumn();
            totalColumn = new DataGridViewTextBoxColumn();
            ((System.ComponentModel.ISupportInitialize)quantityNumericUpDown).BeginInit();
            ((System.ComponentModel.ISupportInitialize)basketGrid).BeginInit();
            SuspendLayout();
            // 
            // headingLabel
            // 
            headingLabel.Font = new Font("Calibri", 16F, FontStyle.Bold);
            headingLabel.Location = new Point(24, 16);
            headingLabel.Name = "headingLabel";
            headingLabel.Size = new Size(800, 40);
            headingLabel.TabIndex = 0;
            headingLabel.Text = "Оформление заказа";
            // 
            // customerLabel
            // 
            customerLabel.Location = new Point(24, 70);
            customerLabel.Name = "customerLabel";
            customerLabel.Size = new Size(100, 30);
            customerLabel.TabIndex = 1;
            customerLabel.Text = "Клиент";
            // 
            // totalLabel
            // 
            totalLabel.Anchor = AnchorStyles.Top | AnchorStyles.Right;
            totalLabel.Location = new Point(650, 140);
            totalLabel.Name = "totalLabel";
            totalLabel.Size = new Size(290, 30);
            totalLabel.TabIndex = 2;
            totalLabel.Text = "Итого: 0,00 ₽";
            // 
            // customerComboBox
            // 
            customerComboBox.DropDownStyle = ComboBoxStyle.DropDownList;
            customerComboBox.FormattingEnabled = true;
            customerComboBox.Location = new Point(140, 70);
            customerComboBox.Name = "customerComboBox";
            customerComboBox.Size = new Size(530, 26);
            customerComboBox.TabIndex = 0;
            // 
            // quantityNumericUpDown
            // 
            quantityNumericUpDown.Location = new Point(24, 140);
            quantityNumericUpDown.Maximum = new decimal(new int[] { 100000, 0, 0, 0 });
            quantityNumericUpDown.Minimum = new decimal(new int[] { 1, 0, 0, 0 });
            quantityNumericUpDown.Name = "quantityNumericUpDown";
            quantityNumericUpDown.Size = new Size(100, 25);
            quantityNumericUpDown.TabIndex = 1;
            quantityNumericUpDown.Value = new decimal(new int[] { 1, 0, 0, 0 });
            // 
            // quantityButton
            // 
            quantityButton.BackColor = Color.FromArgb(210, 246, 231);
            quantityButton.FlatStyle = FlatStyle.Flat;
            quantityButton.Location = new Point(140, 135);
            quantityButton.Name = "quantityButton";
            quantityButton.Size = new Size(250, 40);
            quantityButton.TabIndex = 2;
            quantityButton.Text = "Изменить количество";
            quantityButton.UseVisualStyleBackColor = false;
            quantityButton.Click += quantityButton_Click;
            // 
            // removeButton
            // 
            removeButton.BackColor = Color.FromArgb(210, 246, 231);
            removeButton.FlatStyle = FlatStyle.Flat;
            removeButton.Location = new Point(410, 135);
            removeButton.Name = "removeButton";
            removeButton.Size = new Size(220, 40);
            removeButton.TabIndex = 3;
            removeButton.Text = "Удалить позицию";
            removeButton.UseVisualStyleBackColor = false;
            removeButton.Click += removeButton_Click;
            // 
            // backButton
            // 
            backButton.Anchor = AnchorStyles.Bottom | AnchorStyles.Left;
            backButton.BackColor = Color.FromArgb(210, 246, 231);
            backButton.FlatStyle = FlatStyle.Flat;
            backButton.Location = new Point(24, 575);
            backButton.Name = "backButton";
            backButton.Size = new Size(250, 42);
            backButton.TabIndex = 5;
            backButton.Text = "Назад к выбору";
            backButton.UseVisualStyleBackColor = false;
            backButton.Click += backButton_Click;
            // 
            // cancelButton
            // 
            cancelButton.Anchor = AnchorStyles.Bottom | AnchorStyles.Left;
            cancelButton.BackColor = Color.FromArgb(210, 246, 231);
            cancelButton.FlatStyle = FlatStyle.Flat;
            cancelButton.Location = new Point(284, 575);
            cancelButton.Name = "cancelButton";
            cancelButton.Size = new Size(300, 42);
            cancelButton.TabIndex = 6;
            cancelButton.Text = "Отказаться от заказа";
            cancelButton.UseVisualStyleBackColor = false;
            cancelButton.Click += cancelButton_Click;
            // 
            // confirmButton
            // 
            confirmButton.Anchor = AnchorStyles.Bottom | AnchorStyles.Right;
            confirmButton.BackColor = Color.FromArgb(112, 178, 175);
            confirmButton.FlatStyle = FlatStyle.Flat;
            confirmButton.Location = new Point(604, 575);
            confirmButton.Name = "confirmButton";
            confirmButton.Size = new Size(352, 42);
            confirmButton.TabIndex = 7;
            confirmButton.Text = "Подтвердить заказ";
            confirmButton.UseVisualStyleBackColor = false;
            confirmButton.Click += confirmButton_Click;
            // 
            // basketGrid
            // 
            basketGrid.AllowUserToAddRows = false;
            basketGrid.AllowUserToDeleteRows = false;
            basketGrid.Anchor = AnchorStyles.Top | AnchorStyles.Bottom | AnchorStyles.Left | AnchorStyles.Right;
            basketGrid.AutoSizeColumnsMode = DataGridViewAutoSizeColumnsMode.Fill;
            basketGrid.AutoSizeRowsMode = DataGridViewAutoSizeRowsMode.AllCells;
            basketGrid.BackgroundColor = Color.White;
            basketGrid.ColumnHeadersHeightSizeMode = DataGridViewColumnHeadersHeightSizeMode.AutoSize;
            basketGrid.Columns.AddRange(new DataGridViewColumn[] { stockIdColumn, productColumn, sizeColumn, quantityColumn, priceColumn, totalColumn });
            dataGridViewCellStyle3.Alignment = DataGridViewContentAlignment.MiddleLeft;
            dataGridViewCellStyle3.BackColor = SystemColors.Window;
            dataGridViewCellStyle3.Font = new Font("Calibri", 11F);
            dataGridViewCellStyle3.ForeColor = SystemColors.ControlText;
            dataGridViewCellStyle3.SelectionBackColor = SystemColors.Highlight;
            dataGridViewCellStyle3.SelectionForeColor = SystemColors.HighlightText;
            dataGridViewCellStyle3.WrapMode = DataGridViewTriState.True;
            basketGrid.DefaultCellStyle = dataGridViewCellStyle3;
            basketGrid.Location = new Point(24, 190);
            basketGrid.MultiSelect = false;
            basketGrid.Name = "basketGrid";
            basketGrid.ReadOnly = true;
            basketGrid.RowHeadersVisible = false;
            basketGrid.SelectionMode = DataGridViewSelectionMode.FullRowSelect;
            basketGrid.Size = new Size(932, 355);
            basketGrid.TabIndex = 4;
            basketGrid.SelectionChanged += basketGrid_SelectionChanged;
            // 
            // stockIdColumn
            // 
            stockIdColumn.DataPropertyName = "StockId";
            stockIdColumn.FillWeight = 45F;
            stockIdColumn.HeaderText = "Позиция";
            stockIdColumn.Name = "stockIdColumn";
            stockIdColumn.ReadOnly = true;
            stockIdColumn.SortMode = DataGridViewColumnSortMode.NotSortable;
            // 
            // productColumn
            // 
            productColumn.DataPropertyName = "Product";
            productColumn.FillWeight = 250F;
            productColumn.HeaderText = "Модель";
            productColumn.Name = "productColumn";
            productColumn.ReadOnly = true;
            productColumn.SortMode = DataGridViewColumnSortMode.NotSortable;
            // 
            // sizeColumn
            // 
            sizeColumn.DataPropertyName = "Size";
            sizeColumn.FillWeight = 45F;
            sizeColumn.HeaderText = "Размер";
            sizeColumn.Name = "sizeColumn";
            sizeColumn.ReadOnly = true;
            sizeColumn.SortMode = DataGridViewColumnSortMode.NotSortable;
            // 
            // quantityColumn
            // 
            quantityColumn.DataPropertyName = "Quantity";
            quantityColumn.FillWeight = 40F;
            quantityColumn.HeaderText = "Пар";
            quantityColumn.Name = "quantityColumn";
            quantityColumn.ReadOnly = true;
            quantityColumn.SortMode = DataGridViewColumnSortMode.NotSortable;
            // 
            // priceColumn
            // 
            priceColumn.DataPropertyName = "Price";
            dataGridViewCellStyle1.Alignment = DataGridViewContentAlignment.MiddleRight;
            dataGridViewCellStyle1.Format = "N2";
            priceColumn.DefaultCellStyle = dataGridViewCellStyle1;
            priceColumn.FillWeight = 75F;
            priceColumn.HeaderText = "Цена, ₽";
            priceColumn.Name = "priceColumn";
            priceColumn.ReadOnly = true;
            priceColumn.SortMode = DataGridViewColumnSortMode.NotSortable;
            // 
            // totalColumn
            // 
            totalColumn.DataPropertyName = "Total";
            dataGridViewCellStyle2.Alignment = DataGridViewContentAlignment.MiddleRight;
            dataGridViewCellStyle2.Format = "N2";
            totalColumn.DefaultCellStyle = dataGridViewCellStyle2;
            totalColumn.FillWeight = 75F;
            totalColumn.HeaderText = "Сумма, ₽";
            totalColumn.Name = "totalColumn";
            totalColumn.ReadOnly = true;
            totalColumn.SortMode = DataGridViewColumnSortMode.NotSortable;
            // 
            // BasketForm
            // 
            AutoScaleDimensions = new SizeF(8F, 18F);
            AutoScaleMode = AutoScaleMode.Font;
            BackColor = Color.White;
            ClientSize = new Size(980, 640);
            Controls.Add(basketGrid);
            Controls.Add(confirmButton);
            Controls.Add(cancelButton);
            Controls.Add(backButton);
            Controls.Add(removeButton);
            Controls.Add(quantityButton);
            Controls.Add(quantityNumericUpDown);
            Controls.Add(customerComboBox);
            Controls.Add(totalLabel);
            Controls.Add(customerLabel);
            Controls.Add(headingLabel);
            Font = new Font("Calibri", 11F);
            Margin = new Padding(3, 4, 3, 4);
            MinimumSize = new Size(996, 560);
            Name = "BasketForm";
            StartPosition = FormStartPosition.CenterParent;
            Text = "Чудо Обувь — Оформление заказа";
            ((System.ComponentModel.ISupportInitialize)quantityNumericUpDown).EndInit();
            ((System.ComponentModel.ISupportInitialize)basketGrid).EndInit();
            ResumeLayout(false);
        }

        #endregion

        private Label headingLabel;
        private Label customerLabel;
        private Label totalLabel;
        private ComboBox customerComboBox;
        private NumericUpDown quantityNumericUpDown;
        private Button quantityButton;
        private Button removeButton;
        private Button backButton;
        private Button cancelButton;
        private Button confirmButton;
        private DataGridView basketGrid;
        private DataGridViewTextBoxColumn stockIdColumn;
        private DataGridViewTextBoxColumn productColumn;
        private DataGridViewTextBoxColumn sizeColumn;
        private DataGridViewTextBoxColumn quantityColumn;
        private DataGridViewTextBoxColumn priceColumn;
        private DataGridViewTextBoxColumn totalColumn;
    }
}