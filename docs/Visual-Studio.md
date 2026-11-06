# Настройка решения Visual Studio

Используйте Visual Studio с рабочей нагрузкой **.NET desktop development** и .NET 10. Таблицы и связи сначала создайте по [инструкции DBeaver](DBeaver.md).

## Добавьте библиотеку

1. В уже открытом решении Windows Forms выберите **File → Add → New Project…**.
2. Найдите **Class Library**, выберите C# без пометки .NET Framework. Имя — **ProgDemo.Core**, платформа — **.NET 10.0**. Нажмите Create.
3. Выделите ProgDemo.WinForms в Solution Explorer. Выберите **Project → Add Project Reference…**, слева Projects → Solution, отметьте ProgDemo.Core и нажмите OK.
4. Раскройте Dependencies оконного проекта: ссылка на Core должна появиться в Projects.

![Выбор платформы библиотеки](../materials/screens/vs-core-framework.png)

![Ссылка оконного проекта на библиотеку](../materials/screens/vs-core-reference.png)

## Установите пакет и добавьте обычные классы

1. Щёлкните правой кнопкой по ProgDemo.Core → **Manage NuGet Packages… → Browse**.
2. Найдите **MySqlConnector**, выберите пакет с этим точным именем. В Version выберите **2.6.1**, нажмите Install, проверьте список изменений и нажмите Apply.
3. Убедитесь, что показано **Installed: 2.6.1**. В оконный проект повторно устанавливать пакет не требуется: зависимость приходит через Core.
4. В Core удалите пустой Class1.cs. Через **Project → Add Class…** создайте Models.cs и Store.cs. Заполните их по [Models.cs](../examples/Core/Models.cs) и [Store.cs](../examples/Core/Store.cs).
5. В ProgDemo.WinForms через **Project → Add Class…** добавьте Ui.cs и заполните по [Ui.cs](../examples/WinForms/Ui.cs). В нём функции обработки ошибок и загрузки изображения с заглушкой.
6. Создайте формы и обработчики по [инструкции конструктора](Forms-designer.md). Содержимое обычных файлов форм можно сверять с примерами. Файлы Designer.cs и resx сохраняет конструктор.

![Подтверждение установки MySqlConnector 2.6.1](../materials/screens/vs-mysqlconnector-preview.png)

## Подключите изображения

1. В папке проекта ProgDemo.WinForms создайте **Assets**, внутри — **Images**. Скопируйте оригинальные 31 фотографию в Images, а picture.png и «Чудо Обувь.png» — в Assets. Поместите туда же «Чудо Обувь.ico».
2. В Solution Explorer раскройте Assets → Images. Выделите первую фотографию, затем с Shift последнюю: должны быть выделены все 31 PNG, без папки.
3. Нажмите F4. В **Copy to Output Directory** выберите **Copy if newer**. Повторите для Assets/picture.png. Нажмите **Save All**.
4. Для логотипа каталога отдельно используйте PictureBox → Image → Local resource → Import по инструкции формы. Такой логотип сохраняется внутри ресурса формы.
5. Выделите проект ProgDemo.WinForms, откройте **Project → ProgDemo.WinForms Properties → Application → Win32 Resources**.
6. У поля **Icon** нажмите Browse и выберите **Assets/Чудо Обувь.ico**. Нажмите Save All. В поле Icon должен остаться относительный путь к файлу.

![Значок в свойствах приложения](../materials/screens/vs-application-icon.png)

## Соберите и запустите

1. Для оконного проекта выберите **Set as Startup Project**, если он не выделен жирным в Solution Explorer.
2. Выберите **Build → Build Solution**. В Output должно быть **2 succeeded, 0 failed**, если пока созданы только библиотека и оконный проект. С добавленным импортёром ожидаются **3 succeeded, 0 failed** при первой сборке этой конфигурации.
3. В папке bin/Debug/net10.0-windows проверьте Assets/Images и Assets/picture.png. Если их нет, повторите настройку копирования, затем сборку.
4. Нажмите F5. В окне подключения введите адрес, порт и имя **своей** базы. Порт зависит от вашей установки; в проверенной VM использовался 3307. Пользователь и пароль здесь относятся к СУБД.
5. Нажмите «Проверить и открыть». Откроется каталог. Покупатель входит позже по исходному логину без пароля.

![Сборка студенческого решения в Visual Studio](../materials/screens/vs-student-build.png)

## Соберите результат для сдачи

1. Выберите Release в верхнем списке конфигурации и выполните **Build → Build Solution**.
2. Скопируйте целиком папку bin/Release/net10.0-windows оконного проекта в отдельную папку App. Оставьте в ней exe, dll, runtimeconfig.json, deps.json и Assets.
3. Запустите ProgDemo.WinForms.exe из App. Подключитесь к восстановленной учебной базе и проверьте открытие каталога с фотографиями. Для запуска этой сборки требуется .NET Desktop Runtime 10 подходящей архитектуры.
4. Рядом с App положите SQL со структурой и данными, ER в PDF и README. Исходники сдайте как проект со структурой каталогов.

![Release из отдельной папки на восстановленной базе](../materials/screens/vs-release-catalog.png)
