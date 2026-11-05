# Создание окон в Visual Studio Designer

Компоненты добавляются из Toolbox, свойства и события задаются в Properties. Код `InitializeComponent` сохраняет Visual Studio; вручную его не набирайте. Прикладные обработчики находятся в обычном файле формы.

## Масштаб конструктора

Сначала задайте шрифт формы, затем её размеры и расположение компонентов. Смена шрифта после компоновки может изменить размеры через AutoScaleMode.Font.

При масштабе Windows 200% откройте файл проекта через Edit Project File и добавьте в PropertyGroup настройку проекта:

```xml
<ForceDesignerDPIUnaware>true</ForceDesignerDPIUnaware>
```

Сохраните проект и переоткройте конструктор. В проверенной VM после смены настройки потребовалось закрыть собственное окно Visual Studio и открыть решение командой `devenv /noScale`. Другие решения и Windows перезапускать не требуется. В конструкторе появилось сообщение **This project is set to open the WinForms Designer in DPI-Unaware mode**. Это настройка среды проектирования; [описание Microsoft](https://learn.microsoft.com/en-us/visualstudio/designers/disable-dpi-awareness).

## Форма подключения ConnectionForm

1. Откройте исходную Form1 через Shift+F7. Щёлкните по свободному месту формы, затем F4.
2. В Properties задайте `(Name) = ConnectionForm`. Имя класса изменится; имя файла может остаться Form1.cs. Переименование файла выполняется отдельно в Solution Explorer.
3. Задайте Font **Calibri, 11pt**, BackColor **White**, Text **Чудо Обувь — Подключение**, FormBorderStyle **FixedDialog**, MaximizeBox **False**, StartPosition **CenterScreen**. Размер формы настраивайте после шрифта и рамки: **Size = 656, 609**. Проверенный размер клиентской области — **640 × 570**.
4. Ctrl+Alt+X открывает Toolbox. Найдите TextBox и дважды щёлкните именно **TextBox**: поиск также показывает MaskedTextBox и RichTextBox. После каждого добавления задайте имя и свойства из таблицы.
5. Добавьте Label для каждой подписи, заголовка и пояснения. У Label отключите AutoSize перед заданием Size. Метки не требуют изменения TabStop: у обычного Label это свойство не отображается в Properties.
6. Добавьте Button. Задайте имя **connectButton**, Text **Проверить и открыть**, FlatStyle **Flat**, BackColor **112, 178, 175**. Это цвет #70B2AF.
7. Выделите кнопку, откройте вкладку событий Properties (молния), найдите **Click** и введите **connectButton_Click**. Visual Studio создаст метод и привязку события. Переход в редактор кода после этого ожидаем.
8. Вернитесь Shift+F7, выделите форму, откройте вкладку свойств (ключ) и выберите **AcceptButton = connectButton**. Сохраните всё через Ctrl+Shift+S.

| Компонент | (Name) | Location | Size | Text / дополнительные свойства |
| --- | --- | --- | --- | --- |
| TextBox | serverTextBox | 210, 90 | 380, 25 | 127.0.0.1; TabIndex 0 |
| TextBox | portTextBox | 210, 140 | 380, 25 | 3306; TabIndex 1 |
| TextBox | databaseTextBox | 210, 190 | 380, 25 | prog_demo_student; TabIndex 2 |
| TextBox | userTextBox | 210, 240 | 380, 25 | root; TabIndex 3 |
| TextBox | passwordTextBox | 210, 290 | 380, 25 | пусто; UseSystemPasswordChar True; TabIndex 4 |
| Button | connectButton | 210, 350 | 380, 42 | Проверить и открыть; TabIndex 5 |
| Label | serverLabel | 28, 90 | 170, 28 | Сервер |
| Label | portLabel | 28, 140 | 170, 28 | Порт |
| Label | databaseLabel | 28, 190 | 170, 28 | База данных |
| Label | userLabel | 28, 240 | 170, 28 | Пользователь СУБД |
| Label | passwordLabel | 28, 290 | 170, 28 | Пароль СУБД |
| Label | headingLabel | 28, 24 | 580, 42 | Подключение к базе; Calibri 16pt Bold |
| Label | noteLabel | 28, 420 | 580, 110 | Пояснение о собственной БД и двух разных входах |

Сервер, порт, имя базы и пользователь в таблице — начальные учебные значения. Перед запуском укажите параметры своей среды. В проверенной VM MariaDB работает на порту **3307**, база называется `prog_demo_student_20261105`. Не меняйте службу на другом порту и не подставляйте пароль в исходники.

![Форма подключения, созданная через Toolbox и Properties](../materials/screens/vs-connection-designer.png)

Проверьте сохранённый результат в Solution Explorer: обычный `.cs`, вложенный `.Designer.cs` и `.resx`. В автоматически созданном коде должны присутствовать пять полей TextBox, семь Label, одна Button, `AcceptButton = connectButton` и `connectButton.Click += connectButton_Click`. Это проверка результата сохранения, а не инструкция редактировать Designer.cs.

В обычном `.cs` реализуйте обработчик подключения по [примеру ConnectionForm.cs](../examples/WinForms/ConnectionForm.cs): проверка порта, сбор строки подключения, проверочный запрос и возврат результата. Здесь нет создания компонентов.

Создание компонентов, свойств и события проверено в Windows Visual Studio. Сборка перенесённой формы с основным примером прошла без ошибок и предупреждений. Проверка этой формы при выполнении в Windows и остальные окна ещё продолжаются; полный маршрут пока не считается завершённым.

## Добавление следующей формы

Ctrl+Shift+A может сначала открыть компактное окно **Add new item**. Нажмите **Show all templates**, выберите **Form (Windows Forms)**, в Name укажите, например, `LoginForm.cs`, затем Add. Простое добавление файла `.cs` через компактное окно создаёт класс и не заменяет шаблон формы.

## Окно входа LoginForm

Добавьте `LoginForm.cs` указанным шаблоном. Задайте Font **Calibri, 11pt**, BackColor **White**, Text **Чудо Обувь — Вход**, FormBorderStyle **FixedDialog**, Size **506, 379**, MaximizeBox **False**, StartPosition **CenterParent**. Клиентская область в проверенном результате — **490 × 340**.

Добавьте компоненты из Toolbox. У Label перед Size отключите AutoSize. Компонент Toolbox можно выделить и добавить клавишей Enter.

| Компонент | (Name) | Location | Size | Остальные свойства |
| --- | --- | --- | --- | --- |
| Label | headingLabel | 24, 20 | 450, 40 | Text: Вход в Чудо Обувь; Font: Calibri 16pt Bold |
| Label | noteLabel | 24, 64 | 450, 60 | Text: Введите логин из списка пользователей. Пароль покупателя не требуется. |
| Label | loginLabel | 24, 140 | 100, 30 | Text: Логин |
| TextBox | loginTextBox | 140, 140 | 330, 25 | TabIndex 0 |
| Button | loginButton | 140, 200 | 160, 40 | Text: Войти; FlatStyle Flat; BackColor 112, 178, 175; TabIndex 1 |
| Button | guestButton | 310, 200 | 160, 40 | Text: Как гость; FlatStyle Flat; BackColor 210, 246, 231; TabIndex 2 |

Через вкладку событий создайте **loginButton.Click → loginButton_Click** и **guestButton.Click → guestButton_Click**. У самой формы задайте **AcceptButton = loginButton**. Проверьте сохранённые привязки и файлы формы. Прикладные функции находятся в [LoginForm.cs](../examples/WinForms/LoginForm.cs).

![Окно входа без пароля в конструкторе Visual Studio](../materials/screens/vs-login-designer.png)

Закрытие окна крестиком отменяет смену пользователя. Кнопка «Как гость» явно выбирает гостевой режим. Если в каталоге есть незавершённый заказ, очистка подтверждается отдельно; отказ от очистки сохраняет прежнего пользователя и корзину. Эти функции требуют последующей проверки во время выполнения приложения.

## Карточка модели ProductForm

Добавьте `ProductForm.cs` шаблоном Form (Windows Forms). Свойства формы: Font **Calibri, 11pt**, Text **Чудо Обувь — Карточка модели**, BackColor **White**, FormBorderStyle **FixedDialog**, Size **716, 689**, MaximizeBox **False**, StartPosition **CenterParent**. Клиентская область — **700 × 650**.

| Компонент | (Name) | Location | Size | Дополнительные свойства |
| --- | --- | --- | --- | --- |
| PictureBox | photoPictureBox | 24, 24 | 652, 180 | SizeMode Zoom |
| Label | detailsLabel | 24, 220 | 652, 150 | AutoSize False; временная подпись о модели |
| Label | availableLabel | 24, 380 | 652, 30 | AutoSize False; Text: Доступные размеры |
| Label | sizeLabel | 24, 430 | 100, 30 | AutoSize False; Text: Размер |
| Label | quantityLabel | 24, 480 | 100, 30 | AutoSize False; Text: Пар |
| ComboBox | sizeComboBox | 140, 430 | 300, 26 | DropDownStyle DropDownList; TabIndex 0 |
| NumericUpDown | quantityNumericUpDown | 140, 480 | 100, 25 | Maximum 1, Minimum 1, Value 1; TabIndex 1 |
| Button | addButton | 24, 540 | 300, 42 | Text: Добавить в заказ; BackColor 112, 178, 175; FlatStyle Flat; TabIndex 2 |
| Button | backButton | 340, 540 | 300, 42 | Text: Назад в каталог; BackColor 210, 246, 231; FlatStyle Flat; TabIndex 3 |

Создайте через вкладку событий четыре привязки:

- `sizeComboBox.SelectedIndexChanged → sizeComboBox_SelectedIndexChanged`;
- `addButton.Click → addButton_Click`;
- `backButton.Click → backButton_Click`;
- у самой формы `FormClosed → ProductForm_FormClosed`.

При переходе из обработчика обратно в конструктор проверьте поиск Toolbox: Visual Studio может сбросить его. Перед добавлением следующего компонента снова найдите нужный тип.

![Верхняя часть карточки в конструкторе](../materials/screens/vs-product-designer-top.png)

Если нижняя часть не помещается в редакторе Visual Studio, прокрутите **поверхность конструктора**, а не список свойств. В приложении это отдельное окно.

![Нижняя часть той же карточки после прокрутки конструктора](../materials/screens/vs-product-designer-bottom.png)

В [ProductForm.cs](../examples/WinForms/ProductForm.cs) запросы заполняют готовые объекты: изображение, описание и список доступных размеров. Функция RefreshLimit меняет Maximum существующего NumericUpDown по выбранному остатку. При закрытии освобождается загруженное изображение. Новые компоненты этот код не создаёт. Поведение с реальными данными проверяется следующим этапом.
