namespace ProgDemo.WinForms
{
    partial class ProductForm
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
            photoPictureBox = new PictureBox();
            detailsLabel = new Label();
            availableLabel = new Label();
            sizeLabel = new Label();
            quantityLabel = new Label();
            sizeComboBox = new ComboBox();
            quantityNumericUpDown = new NumericUpDown();
            addButton = new Button();
            backButton = new Button();
            ((System.ComponentModel.ISupportInitialize)photoPictureBox).BeginInit();
            ((System.ComponentModel.ISupportInitialize)quantityNumericUpDown).BeginInit();
            SuspendLayout();
            // 
            // photoPictureBox
            // 
            photoPictureBox.Location = new Point(24, 24);
            photoPictureBox.Name = "photoPictureBox";
            photoPictureBox.Size = new Size(652, 180);
            photoPictureBox.SizeMode = PictureBoxSizeMode.Zoom;
            photoPictureBox.TabIndex = 0;
            photoPictureBox.TabStop = false;
            // 
            // detailsLabel
            // 
            detailsLabel.Location = new Point(24, 220);
            detailsLabel.Name = "detailsLabel";
            detailsLabel.Size = new Size(652, 150);
            detailsLabel.TabIndex = 1;
            detailsLabel.Text = "Производитель | Модель\nКатегория, цена, состав и описание";
            // 
            // availableLabel
            // 
            availableLabel.Location = new Point(24, 380);
            availableLabel.Name = "availableLabel";
            availableLabel.Size = new Size(652, 30);
            availableLabel.TabIndex = 2;
            availableLabel.Text = "Доступные размеры";
            // 
            // sizeLabel
            // 
            sizeLabel.Location = new Point(24, 430);
            sizeLabel.Name = "sizeLabel";
            sizeLabel.Size = new Size(100, 30);
            sizeLabel.TabIndex = 3;
            sizeLabel.Text = "Размер";
            // 
            // quantityLabel
            // 
            quantityLabel.Location = new Point(24, 480);
            quantityLabel.Name = "quantityLabel";
            quantityLabel.Size = new Size(100, 30);
            quantityLabel.TabIndex = 4;
            quantityLabel.Text = "Пар";
            // 
            // sizeComboBox
            // 
            sizeComboBox.DropDownStyle = ComboBoxStyle.DropDownList;
            sizeComboBox.FormattingEnabled = true;
            sizeComboBox.Location = new Point(140, 430);
            sizeComboBox.Name = "sizeComboBox";
            sizeComboBox.Size = new Size(300, 26);
            sizeComboBox.TabIndex = 0;
            sizeComboBox.SelectedIndexChanged += sizeComboBox_SelectedIndexChanged;
            // 
            // quantityNumericUpDown
            // 
            quantityNumericUpDown.Location = new Point(140, 480);
            quantityNumericUpDown.Maximum = new decimal(new int[] { 1, 0, 0, 0 });
            quantityNumericUpDown.Minimum = new decimal(new int[] { 1, 0, 0, 0 });
            quantityNumericUpDown.Name = "quantityNumericUpDown";
            quantityNumericUpDown.Size = new Size(100, 25);
            quantityNumericUpDown.TabIndex = 1;
            quantityNumericUpDown.Value = new decimal(new int[] { 1, 0, 0, 0 });
            // 
            // addButton
            // 
            addButton.BackColor = Color.FromArgb(112, 178, 175);
            addButton.FlatStyle = FlatStyle.Flat;
            addButton.Location = new Point(24, 540);
            addButton.Name = "addButton";
            addButton.Size = new Size(300, 42);
            addButton.TabIndex = 2;
            addButton.Text = "Добавить в заказ";
            addButton.UseVisualStyleBackColor = false;
            addButton.Click += addButton_Click;
            // 
            // backButton
            // 
            backButton.BackColor = Color.FromArgb(210, 246, 231);
            backButton.FlatStyle = FlatStyle.Flat;
            backButton.Location = new Point(340, 540);
            backButton.Name = "backButton";
            backButton.Size = new Size(300, 42);
            backButton.TabIndex = 3;
            backButton.Text = "Назад в каталог";
            backButton.UseVisualStyleBackColor = false;
            backButton.Click += backButton_Click;
            // 
            // ProductForm
            // 
            AutoScaleDimensions = new SizeF(8F, 18F);
            AutoScaleMode = AutoScaleMode.Font;
            BackColor = Color.White;
            ClientSize = new Size(700, 650);
            Controls.Add(backButton);
            Controls.Add(addButton);
            Controls.Add(quantityNumericUpDown);
            Controls.Add(sizeComboBox);
            Controls.Add(quantityLabel);
            Controls.Add(sizeLabel);
            Controls.Add(availableLabel);
            Controls.Add(detailsLabel);
            Controls.Add(photoPictureBox);
            Font = new Font("Calibri", 11F);
            FormBorderStyle = FormBorderStyle.FixedDialog;
            Margin = new Padding(3, 4, 3, 4);
            MaximizeBox = false;
            Name = "ProductForm";
            StartPosition = FormStartPosition.CenterParent;
            Text = "Чудо Обувь — Карточка модели";
            FormClosed += ProductForm_FormClosed;
            ((System.ComponentModel.ISupportInitialize)photoPictureBox).EndInit();
            ((System.ComponentModel.ISupportInitialize)quantityNumericUpDown).EndInit();
            ResumeLayout(false);
        }

        #endregion

        private PictureBox photoPictureBox;
        private Label detailsLabel;
        private Label availableLabel;
        private Label sizeLabel;
        private Label quantityLabel;
        private ComboBox sizeComboBox;
        private NumericUpDown quantityNumericUpDown;
        private Button addButton;
        private Button backButton;
    }
}