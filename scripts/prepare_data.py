#!/usr/bin/env python3
# coding: utf-8
"""Convert original XLSX, preserving originals and recording explicit mappings."""
import copy
import datetime as dt
import hashlib
import json
import pathlib
import zipfile
from decimal import Decimal, ROUND_HALF_UP
from audit_sources import xlsx_rows, norm

ROOT = pathlib.Path(__file__).resolve().parents[1]
RES = ROOT / 'materials/resources'
OUT = ROOT / 'content'


def write_json(p, value):
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


def prepare():
    books = {p.stem: xlsx_rows(p) for p in RES.glob('*.xlsx')}
    roles = ['Администратор', 'Менеджер', 'Авторизованный пользователь']
    categories = sorted({r['Категория'] for r in books['Products_import']})
    subcategories = sorted({(r['Категория'], r['Подкатегория']) for r in books['Products_import']})
    makers = sorted({r['Производство'] for r in books['Products_import']})
    sizes = [r['Размер'] for r in books['Sizes_import']]
    products = []
    for i,r in enumerate(books['Products_import'], 1):
        products.append(dict(id=i,category=r['Категория'],subcategory=r['Подкатегория'],manufacturer=r['Производство'],name=r['Наименование товара'],image=r['Изображение'],composition=r['Состав'],description=r['Описание'],price=r['Цена']))
    def model(name,maker):
        if name=='Черные туфли в классическом стиле' and maker=='Барбари':
            name='Черные туфли в классическом стиле — база для деловых образов'
        candidates=[p for p in products if norm(p['name'])==norm(name) and norm(p['manufacturer'])==norm(maker)]
        if len(candidates)!=1: raise ValueError(('Ambiguous product',name,maker))
        return candidates[0]['id']
    stock=[dict(id=i,product_id=model(r['Наименование товара'],r['Производство']),size=r['Размер'],available=int(r['Количество доступное для заказа'])) for i,r in enumerate(books['Stock_Items_import'],1)]
    stock_keys={(s['product_id'],s['size']):s['id'] for s in stock}
    users=[dict(id=i,login=r['Логин'],full_name=' '.join([r['Фамилия'],r['Имя'],r['Отчетсво']]),last_name=r['Фамилия'],first_name=r['Имя'],patronymic=r['Отчетсво'],role=r['Роль']) for i,r in enumerate(books['Users_import'],1)]
    user_keys={u['full_name']:u['id'] for u in users}
    orders={};items=[]
    for i,r in enumerate(books['Orders_import'],1):
        number=int(r['Номер заказа']); date=(dt.datetime(1899,12,30)+dt.timedelta(days=float(r['Дата заказа']))).isoformat()
        order=dict(id=number,date=date,user_id=user_keys[r['ФИО']],stock_accounted=False)
        if number in orders and orders[number]!=order:raise ValueError('Inconsistent order header')
        orders[number]=order
        items.append(dict(id=i,order_id=number,stock_id=stock_keys[(model(r['Наименование товара'],r['Производство']),r['Размер'])],quantity=int(r['Количество']),price=r['Цена за единицу']))
    return dict(roles=roles,categories=categories,subcategories=[dict(category=c,name=s) for c,s in subcategories],manufacturers=makers,sizes=sizes,users=users,products=products,stock=stock,orders=list(orders.values()),items=items)


def literal(value):
    if value is None:return 'NULL'
    if isinstance(value,bool):return str(int(value))
    if isinstance(value,(int,float)):return str(value)
    # Hex UTF-8 literals preserve apostrophes and backslashes independently of sql_mode.
    return "CONVERT(X'"+str(value).encode('utf8').hex()+"' USING utf8mb4)"


def sql(data, database):
    if not database.replace('_','').isalnum():raise ValueError('Unsafe database name')
    lines=[f'CREATE DATABASE IF NOT EXISTS `{database}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;',f'USE `{database}`;',(ROOT/'scripts/schema.sql').read_text(),'START TRANSACTION;']
    def insert(table,columns,values):
        for row in values:lines.append(f"INSERT INTO {table}({columns}) VALUES("+','.join(literal(v) for v in row)+');')
    insert('roles','id,name',enumerate(data['roles'],1))
    insert('users','id,login,last_name,first_name,patronymic,role_id',((u['id'],u['login'],u['last_name'],u['first_name'],u['patronymic'],data['roles'].index(u['role'])+1) for u in data['users']))
    insert('categories','id,name',enumerate(data['categories'],1))
    insert('subcategories','id,category_id,name',((i,data['categories'].index(x['category'])+1,x['name']) for i,x in enumerate(data['subcategories'],1)))
    insert('manufacturers','id,name',enumerate(data['manufacturers'],1))
    insert('products','id,subcategory_id,manufacturer_id,name,image,composition,description,price',((p['id'],next(i for i,s in enumerate(data['subcategories'],1) if s['category']==p['category'] and s['name']==p['subcategory']),data['manufacturers'].index(p['manufacturer'])+1,p['name'],p['image'],p['composition'],p['description'],Decimal(p['price'])) for p in data['products']))
    insert('sizes','id,label,sort_value',((i,s,Decimal(s)) for i,s in enumerate(data['sizes'],1)))
    insert('stock_items','id,product_id,size_id,available',((s['id'],s['product_id'],data['sizes'].index(s['size'])+1,s['available']) for s in data['stock']))
    insert('orders','id,order_date,user_id,created_by,stock_accounted',((o['id'],o['date'].replace('T',' '),o['user_id'],o['user_id'],False) for o in data['orders']))
    insert('order_items','id,order_id,stock_id,quantity,unit_price',((i['id'],i['order_id'],i['stock_id'],i['quantity'],Decimal(i['price'])) for i in data['items']))
    return '\n'.join(lines+['COMMIT;'])+'\n'


def control(data, date=dt.date(2026,5,15)):
    first=date.replace(day=1);start=(first-dt.timedelta(days=1)).replace(day=1)
    orders={o['id']:o for o in data['orders']}; stock={s['id']:s for s in data['stock']}
    ordered={stock[i['stock_id']]['product_id'] for i in data['items'] if start<=dt.date.fromisoformat(orders[i['order_id']]['date'][:10])<first}
    return [dict(id=p['id'],quantity=sum(s['available'] for s in data['stock'] if s['product_id']==p['id']),price=str((Decimal(p['price'])*(Decimal('1') if p['id'] in ordered else Decimal('.75'))).quantize(Decimal('.01'),rounding=ROUND_HALF_UP)),discount=p['id'] not in ordered) for p in data['products']]


def main():
    data=prepare();write_json(OUT/'sample.json',data)
    (OUT/'sample.sql').write_text(sql(data,'prog_demo_sample'))
    write_json(ROOT/'docs/sample-control.json',control(data))
    manifest=[dict(path=p.relative_to(ROOT/'materials').as_posix(),sha256=hashlib.sha256(p.read_bytes()).hexdigest()) for p in sorted((ROOT/'materials').rglob('*')) if p.is_file() and p.relative_to(ROOT/'materials').parts[0] in ('original','resources')]
    write_json(ROOT/'docs/source-manifest.json',manifest)
    variants=[]
    for n in range(1,31):
        v=copy.deepcopy(data)
        for p in v['products']:p['price']=str(Decimal(p['price'])+Decimal(17*n));p['name']=f"{p['name']} · коллекция {n:02d}"
        for s in v['stock']:s['available']=(s['id']+n)%18
        for u in v['users']:u['login']=f"v{n:02d}_{u['login']}"
        for i in v['items']:i['price']=str(Decimal(i['price'])+Decimal(17*n))
        id=f'V{n:02d}';vdir=OUT/'variants'/id;vdir.mkdir(parents=True,exist_ok=True)
        write_json(vdir/'data.json',v)
        (vdir/'database.sql').write_text(sql(v,'prog_demo_'+id.lower()))
        write_json(ROOT/'docs/variant-controls'/f'{id}.json',control(v))
        statement=f'''# Учебный вариант {n}\n\nМагазин «Чудо Обувь», коллекция {n:02d}. Создайте базу в 3НФ, каталог, оформление заказа и работу менеджера/администратора. Это авторский тренировочный вариант инвариантного ядра, не официальный вариант профильной вариативной части.\n\nИсходные данные находятся в data.json и шести CSV. database.sql — отдельный образец решения для сверки после самостоятельного выполнения; в экзаменационный ZIP он не включается. Используйте исходное руководство по стилю и изображения. Для контрольного расчёта дата 15.05.2026, для рабочего приложения — текущая дата. Вход только по логину.\n\n1. Импортируйте {len(v['products'])} модель, {len(v['stock'])} позиций, {len(v['users'])} пользователей и 10 заказов/30 строк. Сохраните ER PDF и SQL с данными.\n2. Покажите фото, категорию, название, производство, состав, цену со скидкой и «много/мало». Скидка 25% при отсутствии заказа в предыдущем календарном месяце; подсветка суммарного остатка ≤3.\n3. Реализуйте поиск по названию и описанию, фильтр категории и сортировку цены совместно без кнопки поиска. По логину выберите размер и количество, сформируйте несколько строк, подтвердите или отмените заказ. Остаток не может стать отрицательным.\n4. Менеджер и администратор работают со списком и составом заказов. Администратор дополнительно меняет дату и удаляет строки. Передайте исходники структурой, исполняемый результат, SQL с данными, ER PDF и README.\n'''
        (vdir/'Задание.md').write_text(statement)
        import csv
        for name in ['products','stock','sizes','users','orders','items']:
            values=v[name]
            if name=='sizes':values=[dict(size=x) for x in values]
            with (vdir/(name+'.csv')).open('w',newline='',encoding='utf-8-sig') as f:
                writer=csv.DictWriter(f,fieldnames=values[0]);writer.writeheader();writer.writerows(values)
        variants.append(dict(id=id,title=f'Коллекция {n:02d}',database='prog_demo_'+id.lower(),counts={k:len(v[k]) for k in ['products','stock','users','orders','items']}))
    write_json(OUT/'variants.json',variants)
    print('Prepared original sample and 30 coherent author variants.')


if __name__=='__main__':main()
