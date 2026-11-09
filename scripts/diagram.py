#!/usr/bin/env python3
# coding: utf-8
"""Generate matching schema metadata, SVG and PDF from schema.sql."""
import html,json,pathlib,re,os
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
ROOT=pathlib.Path(__file__).resolve().parents[1]
sql=(ROOT/'scripts/schema.sql').read_text()
positions={'roles':(0,0),'users':(1,0),'orders':(2,0),'order_items':(3,0),'categories':(0,1),'subcategories':(1,1),'products':(2,1),'stock_items':(3,1),'manufacturers':(1,2),'sizes':(3,2)}
origins={'roles':'Users_import.xlsx → Роль','users':'Users_import.xlsx → Фамилия, Имя, Отчетсво, Логин, Роль','categories':'Products_import.xlsx → Категория','subcategories':'Products_import.xlsx → Категория, Подкатегория','manufacturers':'Products_import.xlsx → Производство','products':'Products_import.xlsx → Наименование товара, Изображение, Состав, Описание, Цена','sizes':'Sizes_import.xlsx → Размер','stock_items':'Stock_Items_import.xlsx → Наименование товара, Производство, Размер, Количество доступное для заказа','orders':'Orders_import.xlsx → Номер заказа, Дата заказа, ФИО','order_items':'Orders_import.xlsx → Номер заказа, Наименование товара, Размер, Количество, Цена за единицу'}
table_notes = {
    'roles': 'Справочник ролей определяет доступные действия покупателя, менеджера и администратора.',
    'users': 'Список пользователей хранит учебный логин, ФИО и ссылку на роль.',
    'categories': 'Верхний уровень каталога. Каждая подкатегория относится к одной категории.',
    'subcategories': 'Подкатегории уточняют вид обуви внутри категории. Одно название может повторяться в разных категориях.',
    'manufacturers': 'Справочник производителей позволяет нескольким моделям ссылаться на одного производителя.',
    'products': 'Одна строка описывает одну модель обуви и её общие свойства. Размеры и остатки хранятся в stock_items.',
    'sizes': 'Справочник хранит исходные обозначения размеров и значения для числовой сортировки.',
    'stock_items': 'Одна строка хранит доступный остаток для одной пары «модель + размер».',
    'orders': 'В заголовке заказа хранятся дата, покупатель и сведения о создании заказа.',
    'order_items': 'Строка заказа фиксирует конкретный размер, число пар и цену за пару на момент покупки.',
}
field_notes = {
    'roles.id': ('Первичный ключ роли. На него ссылается users.role_id.', ''),
    'roles.name': ('Название роли, по которому импортёр сопоставляет пользователя со справочником.', 'Users_import.xlsx → Роль'),
    'users.id': ('Первичный ключ пользователя. Его используют ссылки на покупателя и автора заказа.', ''),
    'users.login': ('Уникальный логин входа. Сравнение учитывает регистр букв.', 'Users_import.xlsx → Логин'),
    'users.last_name': ('Фамилия пользователя для отображения ФИО и сопоставления исходных заказов.', 'Users_import.xlsx → Фамилия'),
    'users.first_name': ('Имя пользователя для отображения ФИО и сопоставления исходных заказов.', 'Users_import.xlsx → Имя'),
    'users.patronymic': ('Отчество пользователя для отображения полного имени. Заголовок исходного столбца сохранён как в книге.', 'Users_import.xlsx → Отчетсво'),
    'users.role_id': ('Ссылка на роль пользователя. Приложение проверяет по ней права на действия.', 'Users_import.xlsx → Роль'),
    'categories.id': ('Первичный ключ категории. Его хранит каждая её подкатегория.', ''),
    'categories.name': ('Уникальное название верхнего уровня каталога, например «Детская обувь».', 'Products_import.xlsx → Категория'),
    'subcategories.id': ('Первичный ключ подкатегории. На него ссылаются модели.', ''),
    'subcategories.category_id': ('Ссылка на родительскую категорию подкатегории.', 'Products_import.xlsx → Категория'),
    'subcategories.name': ('Название подкатегории. Оно уникально внутри своей категории.', 'Products_import.xlsx → Подкатегория'),
    'manufacturers.id': ('Первичный ключ производителя. На него ссылаются модели каталога.', ''),
    'manufacturers.name': ('Уникальное название производителя. Вместе с названием модели помогает сопоставить исходные строки.', 'Products_import.xlsx → Производство'),
    'products.id': ('Первичный ключ модели. По нему складские позиции получают общие свойства модели.', ''),
    'products.subcategory_id': ('Ссылка на подкатегорию модели. Категория находится через эту подкатегорию.', 'Products_import.xlsx → Категория, Подкатегория'),
    'products.manufacturer_id': ('Ссылка на производителя модели.', 'Products_import.xlsx → Производство'),
    'products.name': ('Название модели. В сочетании с производителем определяет строку модели при импорте.', 'Products_import.xlsx → Наименование товара'),
    'products.image': ('Имя файла фотографии модели. Приложение ищет его в Assets/Images и при отсутствии показывает заглушку.', 'Products_import.xlsx → Изображение'),
    'products.composition': ('Описание материалов модели, которое показывается в каталоге и карточке.', 'Products_import.xlsx → Состав'),
    'products.description': ('Текст карточки модели. Приложение также использует его для поиска.', 'Products_import.xlsx → Описание'),
    'products.price': ('Базовая цена модели за пару. Цена со скидкой рассчитывается отдельно.', 'Products_import.xlsx → Цена'),
    'sizes.id': ('Первичный ключ размера. На него ссылается складская позиция.', ''),
    'sizes.label': ('Исходная надпись размера, которую видит покупатель. Дробное значение сохраняется полностью.', 'Sizes_import.xlsx → Размер'),
    'sizes.sort_value': ('Числовое представление размера для сортировки. Например, 38.5 следует после 38.', 'Sizes_import.xlsx → Размер'),
    'stock_items.id': ('Первичный ключ складской позиции. Строка заказа ссылается на него, чтобы указать точный размер модели.', ''),
    'stock_items.product_id': ('Ссылка на модель. Импортёр находит её по паре «название + производитель».', 'Stock_Items_import.xlsx → Наименование товара, Производство'),
    'stock_items.size_id': ('Ссылка на размер модели. Пара product_id и size_id уникальна в складских позициях.', 'Stock_Items_import.xlsx → Размер'),
    'stock_items.available': ('Доступное для заказа количество пар конкретного размера. Значение не может быть отрицательным.', 'Stock_Items_import.xlsx → Количество доступное для заказа'),
    'orders.id': ('Первичный ключ заказа. При импорте сохраняется исходный номер, а для нового заказа номер выдаёт база.', 'Orders_import.xlsx → Номер заказа'),
    'orders.order_date': ('Дата заказа. Её используют для просмотра истории и отбора продаж по периоду.', 'Orders_import.xlsx → Дата заказа'),
    'orders.user_id': ('Ссылка на покупателя. Импортёр находит пользователя по ФИО из заказа.', 'Orders_import.xlsx → ФИО'),
    'orders.created_by': ('Ссылка на пользователя, который оформил заказ. Для исходной истории импортёр ставит покупателя, поскольку отдельного автора в книге нет.', ''),
    'orders.request_id': ('Уникальный идентификатор подтверждения. Повторный запрос с тем же значением возвращает уже созданный заказ. У исходной истории здесь NULL.', ''),
    'orders.stock_accounted': ('Показывает, списывал ли заказ остаток. Импортированная история получает 0, потому что исходный остаток уже дан. Новый подтверждённый заказ получает 1. При удалении заказа или его строки остаток возвращается только при 1.', ''),
    'order_items.id': ('Первичный ключ строки заказа. Позволяет изменить или удалить именно выбранную позицию.', ''),
    'order_items.order_id': ('Ссылка на заголовок заказа. При удалении заголовка его строки удаляются каскадно.', 'Orders_import.xlsx → Номер заказа'),
    'order_items.stock_id': ('Ссылка на конкретную пару «модель + размер». Импортёр находит позицию по названию, производителю и размеру.', 'Orders_import.xlsx → Наименование товара, Производство, Размер'),
    'order_items.quantity': ('Число пар в этой строке заказа. Оно должно быть больше нуля.', 'Orders_import.xlsx → Количество'),
    'order_items.unit_price': ('Цена одной пары на момент продажи. При изменении каталога она сохраняется для истории.', 'Orders_import.xlsx → Цена за единицу'),
}
tables=[];links=[]
for name,body in re.findall(r'CREATE TABLE (\w+)\((.*?)\) ENGINE',sql):
    parts=[];start=0;depth=0
    for i,c in enumerate(body):
        if c=='(':depth+=1
        elif c==')':depth-=1
        elif c==',' and depth==0:parts.append(body[start:i].strip());start=i+1
    parts.append(body[start:].strip())
    fields=[]
    fks={a:(b,c) for a,b,c in re.findall(r'FOREIGN KEY\((\w+)\) REFERENCES (\w+)\((\w+)\)',body)}
    for p in parts:
        match=re.match(r'(\w+)\s+(INT|VARCHAR\(\d+\)|CHAR\(\d+\)|DECIMAL\(\d+,\d+\)|DATETIME|BOOLEAN|TEXT)',p)
        if not match:continue
        field,type=match.groups()
        meaning,origin=field_notes[f'{name}.{field}']
        pk='PRIMARY KEY' in p
        default=re.search(r'\bDEFAULT\s+(\S+)',p)
        fields.append(dict(id=field,type=type,pk=pk,fk=field in fks,
                           nullable=not pk and 'NOT NULL' not in p,unique='UNIQUE' in p,
                           default=default.group(1) if default else None,
                           meaning=meaning,origin=origin))
    for field,(target,key) in fks.items():links.append(dict(source=name,field=field,target=target,key=key,cardinality='N : 1'))
    x,y=positions[name];tables.append(dict(id=name,x=30+x*410,y=70+y*355,width=370,fields=fields,meaning=table_notes[name],origin=origins[name]))
data=dict(tables=tables,links=links,width=1680,height=1160)
(ROOT/'content/er.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
font=os.environ.get('PROG_DEMO_FONT') or next((p for p in ['/System/Library/Fonts/Supplemental/Arial.ttf','C:/Windows/Fonts/arial.ttf','/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'] if pathlib.Path(p).exists()),'')
if not font:raise SystemExit('Set PROG_DEMO_FONT to a Unicode TTF font path.')
pdfmetrics.registerFont(TTFont('DiagramArial',font))
pdf=canvas.Canvas(str(ROOT/'materials/ER.pdf'),pagesize=(1680,1160),invariant=1)
pdf.setTitle('Чудо Обувь — ER');pdf.setFont('DiagramArial',20);pdf.drawString(30,1128,'Чудо Обувь — таблицы, поля и связи FK → PK (N : 1)')
svg=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1680 1160"><rect width="1680" height="1160" fill="white"/><defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="#a20e24"/></marker></defs><g font-family="Arial,sans-serif" fill="#1c1c1c"><text x="30" y="32" font-size="20">Чудо Обувь — связи FK → PK (N : 1)</text>']
by={t['id']:t for t in tables}
for link in links:
    a,b=by[link['source']],by[link['target']]
    ay=a['y']+55+next(i for i,f in enumerate(a['fields']) if f['id']==link['field'])*25
    byy=b['y']+55
    ax=a['x'];bx=b['x']+b['width']
    if a['x']==b['x']:
        ax=a['x']+a['width']/2;bx=b['x']+b['width']/2;byy=b['y'];ay=a['y']+40+25*len(a['fields']);points=[(ax,ay),(ax,byy-12),(bx,byy)]
    else:points=[(ax,ay),((ax+bx)/2,ay),((ax+bx)/2,byy),(bx,byy)]
    coords=' '.join(f'{x},{y}' for x,y in points)
    svg.append(f'<polyline points="{coords}" fill="none" stroke="#a20e24" stroke-width="2" marker-end="url(#arrow)"/>')
    pdf.setStrokeColorRGB(.64,.055,.14);pdf.setLineWidth(1.5)
    path=pdf.beginPath();path.moveTo(points[0][0],1160-points[0][1])
    for x,y in points[1:]:path.lineTo(x,1160-y)
    pdf.drawPath(path);pdf.setFont('DiagramArial',10);pdf.drawString(points[0][0]+3,1160-points[0][1]+4,'N : 1')
for t in tables:
    x,y,w=t['x'],t['y'],t['width'];h=45+25*len(t['fields'])
    svg.append(f'<g><rect x="{x}" y="{y}" width="{w}" height="{h}" fill="#fff" stroke="#a20e24"/><rect x="{x}" y="{y}" width="{w}" height="32" fill="#D2F6E7"/><text x="{x+10}" y="{y+23}" font-size="19" font-weight="bold">{t["id"]}</text>')
    pdf.setFillColorRGB(1,1,1);pdf.rect(x,1160-y-h,w,h,fill=1);pdf.setFillColorRGB(.824,.965,.906);pdf.rect(x,1160-y-32,w,32,fill=1,stroke=0);pdf.setFillColorRGB(.1,.1,.1);pdf.setFont('DiagramArial',18);pdf.drawString(x+10,1160-y-23,t['id'])
    for i,f in enumerate(t['fields']):
        text=('PK ' if f['pk'] else 'FK ' if f['fk'] else '   ')+f['id']+' : '+f['type'];fy=y+55+i*25
        svg.append(f'<text x="{x+10}" y="{fy}" font-size="15">{html.escape(text)}</text>');pdf.setFont('DiagramArial',14);pdf.drawString(x+10,1160-fy,text)
    svg.append('</g>')
svg.append('</g></svg>');(ROOT/'materials/ER.svg').write_text(''.join(svg));pdf.showPage();pdf.save();print('Generated ER:',len(tables),'tables,',len(links),'links')
