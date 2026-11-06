namespace ProgDemo.WinForms
{
    partial class OrderDetailsForm
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
            DataGridViewCellStyle dataGridViewCellStyle9 = new DataGridViewCellStyle();
            DataGridViewCellStyle dataGridViewCellStyle7 = new DataGridViewCellStyle();
            DataGridViewCellStyle dataGridViewCellStyle8 = new DataGridViewCellStyle();
            headingLabel = new Label();
            dateLabel = new Label();
            totalLabel = new Label();
            orderDatePicker = new DateTimePicker();
            changeDateButton = new Button();
            deleteLineButton = new Button();
            backButton = new Button();
            linesGrid = new DataGridView();
            lineIdColumn = new DataGridViewTextBoxColumn();
            stockIdColumn = new DataGridViewTextBoxColumn();
            productColumn = new DataGridViewTextBoxColumn();
            manufacturerColumn = new DataGridViewTextBoxColumn();
            sizeColumn = new DataGridViewTextBoxColumn();
            quantityColumn = new DataGridViewTextBoxColumn();
            priceColumn = new DataGridViewTextBoxColumn();
            totalColumn = new DataGridViewTextBoxColumn();
            ((System.ComponentModel.ISupportInitialize)linesGrid).BeginInit();
            SuspendLayout();
            // 
            // headingLabel
            // 
            headingLabel.Font = new Font("Calibri", 16F, FontStyle.Bold);
            headingLabel.Location = new Point(24, 16);
            headingLabel.Name = "headingLabel";
            headingLabel.Size = new Size(800, 40);
            headingLabel.TabIndex = 0;
            headingLabel.Text = "Состав заказа";
            // 
            // dateLabel
            // 
            dateLabel.Location = new Point(24, 70);
            dateLabel.Name = "dateLabel";
            dateLabel.Size = new Size(120, 30);
            dateLabel.TabIndex = 1;
            dateLabel.Text = "Дата заказа";
            // 
            // totalLabel
            // 
            totalLabel.Anchor = AnchorStyles.Bottom | AnchorStyles.Left | AnchorStyles.Right;
            totalLabel.Location = new Point(290, 590);
            totalLabel.Name = "totalLabel";
            totalLabel.Size = new Size(650, 30);
            totalLabel.TabIndex = 2;
            totalLabel.Text = "Итого: 0,00 ₽";
            // 
            // orderDatePicker
            // 
            orderDatePicker.CustomFormat = "dd.MM.yyyy";
            orderDatePicker.Format = DateTimePickerFormat.Custom;
            orderDatePicker.Location = new Point(150, 70);
            orderDatePicker.Name = "orderDatePicker";
            orderDatePicker.Size = new Size(160, 25);
            orderDatePicker.TabIndex = 0;
            // 
            // changeDateButton
            // 
            changeDateButton.BackColor = Color.FromArgb(112, 178, 175);
            changeDateButton.FlatStyle = FlatStyle.Flat;
            changeDateButton.Location = new Point(330, 65);
            changeDateButton.Name = "changeDateButton";
            changeDateButton.Size = new Size(240, 40);
            changeDateButton.TabIndex = 1;
            changeDateButton.Text = "Изменить дату";
            changeDateButton.UseVisualStyleBackColor = false;
            changeDateButton.Click += changeDateButton_Click;
            // 
            // deleteLineButton
            // 
            deleteLineButton.BackColor = Color.FromArgb(210, 246, 231);
            deleteLineButton.FlatStyle = FlatStyle.Flat;
            deleteLineButton.Location = new Point(590, 65);
            deleteLineButton.Name = "deleteLineButton";
            deleteLineButton.Size = new Size(240, 40);
            deleteLineButton.TabIndex = 2;
            deleteLineButton.Text = "Удалить строку";
            deleteLineButton.UseVisualStyleBackColor = false;
            deleteLineButton.Click += deleteLineButton_Click;
            // 
            // backButton
            // 
            backButton.Anchor = AnchorStyles.Bottom | AnchorStyles.Left;
            backButton.BackColor = Color.FromArgb(210, 246, 231);
            backButton.FlatStyle = FlatStyle.Flat;
            backButton.Location = new Point(24, 585);
            backButton.Name = "backButton";
            backButton.Size = new Size(240, 40);
            backButton.TabIndex = 4;
            backButton.Text = "Назад к заказам";
            backButton.UseVisualStyleBackColor = false;
            backButton.Click += backButton_Click;
            // 
            // linesGrid
            // 
            linesGrid.AllowUserToAddRows = false;
            linesGrid.AllowUserToDeleteRows = false;
            linesGrid.Anchor = AnchorStyles.Top | AnchorStyles.Bottom | AnchorStyles.Left | AnchorStyles.Right;
            linesGrid.AutoSizeColumnsMode = DataGridViewAutoSizeColumnsMode.Fill;
            linesGrid.AutoSizeRowsMode = DataGridViewAutoSizeRowsMode.AllCells;
            linesGrid.BackgroundColor = Color.White;
            linesGrid.ColumnHeadersHeightSizeMode = DataGridViewColumnHeadersHeightSizeMode.AutoSize;
            linesGrid.Columns.AddRange(new DataGridViewColumn[] { lineIdColumn, stockIdColumn, productColumn, manufacturerColumn, sizeColumn, quantityColumn, priceColumn, totalColumn });
            dataGridViewCellStyle9.Alignment = DataGridViewContentAlignment.MiddleLeft;
            dataGridViewCellStyle9.BackColor = SystemColors.Window;
            dataGridViewCellStyle9.Font = new Font("Calibri", 11F);
            dataGridViewCellStyle9.ForeColor = SystemColors.ControlText;
            dataGridViewCellStyle9.SelectionBackColor = SystemColors.Highlight;
            dataGridViewCellStyle9.SelectionForeColor = SystemColors.HighlightText;
            dataGridViewCellStyle9.WrapMode = DataGridViewTriState.True;
            linesGrid.DefaultCellStyle = dataGridViewCellStyle9;
            linesGrid.Location = new Point(24, 130);
            linesGrid.MultiSelect = false;
            linesGrid.Name = "linesGrid";
            linesGrid.ReadOnly = true;
            linesGrid.RowHeadersVisible = false;
            linesGrid.SelectionMode = DataGridViewSelectionMode.FullRowSelect;
            linesGrid.Size = new Size(932, 430);
            linesGrid.TabIndex = 3;
            // 
            // lineIdColumn
            // 
            lineIdColumn.DataPropertyName = "Id";
            lineIdColumn.FillWeight = 35F;
            lineIdColumn.HeaderText = "№ строки";
            lineIdColumn.Name = "lineIdColumn";
            lineIdColumn.ReadOnly = true;
            lineIdColumn.SortMode = DataGridViewColumnSortMode.NotSortable;
            // 
            // stockIdColumn
            // 
            stockIdColumn.DataPropertyName = "StockId";
            stockIdColumn.FillWeight = 30F;
            stockIdColumn.HeaderText = "Код позиции";
            stockIdColumn.Name = "stockIdColumn";
            stockIdColumn.ReadOnly = true;
            stockIdColumn.SortMode = DataGridViewColumnSortMode.NotSortable;
            stockIdColumn.Visible = false;
            // 
            // productColumn
            // 
            productColumn.DataPropertyName = "Product";
            productColumn.FillWeight = 180F;
            productColumn.HeaderText = "Модель";
            productColumn.Name = "productColumn";
            productColumn.ReadOnly = true;
            productColumn.SortMode = DataGridViewColumnSortMode.NotSortable;
            // 
            // manufacturerColumn
            // 
            manufacturerColumn.DataPropertyName = "Manufacturer";
            manufacturerColumn.FillWeight = 120F;
            manufacturerColumn.HeaderText = "Производство";
            manufacturerColumn.Name = "manufacturerColumn";
            manufacturerColumn.ReadOnly = true;
            manufacturerColumn.SortMode = DataGridViewColumnSortMode.NotSortable;
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
            quantityColumn.FillWeight = 35F;
            quantityColumn.HeaderText = "Пар";
            quantityColumn.Name = "quantityColumn";
            quantityColumn.ReadOnly = true;
            quantityColumn.SortMode = DataGridViewColumnSortMode.NotSortable;
            // 
            // priceColumn
            // 
            priceColumn.DataPropertyName = "Price";
            dataGridViewCellStyle7.Alignment = DataGridViewContentAlignment.MiddleRight;
            dataGridViewCellStyle7.Format = "N2";
            priceColumn.DefaultCellStyle = dataGridViewCellStyle7;
            priceColumn.FillWeight = 60F;
            priceColumn.HeaderText = "Цена, ₽";
            priceColumn.Name = "priceColumn";
            priceColumn.ReadOnly = true;
            priceColumn.SortMode = DataGridViewColumnSortMode.NotSortable;
            // 
            // totalColumn
            // 
            totalColumn.DataPropertyName = "Total";
            dataGridViewCellStyle8.Alignment = DataGridViewContentAlignment.MiddleRight;
            dataGridViewCellStyle8.Format = "N2";
            totalColumn.DefaultCellStyle = dataGridViewCellStyle8;
            totalColumn.FillWeight = 60F;
            totalColumn.HeaderText = "Сумма, ₽";
            totalColumn.Name = "totalColumn";
            totalColumn.ReadOnly = true;
            totalColumn.SortMode = DataGridViewColumnSortMode.NotSortable;
            // 
            // OrderDetailsForm
            // 
            AutoScaleDimensions = new SizeF(8F, 18F);
            AutoScaleMode = AutoScaleMode.Font;
            BackColor = Color.White;
            ClientSize = new Size(980, 640);
            Controls.Add(linesGrid);
            Controls.Add(backButton);
            Controls.Add(deleteLineButton);
            Controls.Add(changeDateButton);
            Controls.Add(orderDatePicker);
            Controls.Add(totalLabel);
            Controls.Add(dateLabel);
            Controls.Add(headingLabel);
            Font = new Font("Calibri", 11F);
            Margin = new Padding(3, 4, 3, 4);
            MinimumSize = new Size(996, 560);
            Name = "OrderDetailsForm";
            StartPosition = FormStartPosition.CenterParent;
            Text = "Чудо Обувь — Состав заказа";
            ((System.ComponentModel.ISupportInitialize)linesGrid).EndInit();
            ResumeLayout(false);
        }

        #endregion

        private Label headingLabel;
        private Label dateLabel;
        private Label totalLabel;
        private DateTimePicker orderDatePicker;
        private Button changeDateButton;
        private Button deleteLineButton;
        private Button backButton;
        private DataGridView linesGrid;
        private DataGridViewTextBoxColumn lineIdColumn;
        private DataGridViewTextBoxColumn stockIdColumn;
        private DataGridViewTextBoxColumn productColumn;
        private DataGridViewTextBoxColumn manufacturerColumn;
        private DataGridViewTextBoxColumn sizeColumn;
        private DataGridViewTextBoxColumn quantityColumn;
        private DataGridViewTextBoxColumn priceColumn;
        private DataGridViewTextBoxColumn totalColumn;
    }
}