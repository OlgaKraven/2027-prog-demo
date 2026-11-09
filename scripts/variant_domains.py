"""Prepare alternate retail domains while retaining the sample's relational model."""
from copy import deepcopy
from decimal import Decimal
from html import escape
from pathlib import Path
import struct
import zlib

SHAPES = {
    'shoe': [(19,72),(24,48),(41,43),(57,54),(79,60),(105,68),(115,78),(110,86),(22,86)],
    'top': [(26,26),(48,17),(60,25),(72,17),(94,26),(105,52),(87,58),(81,46),(81,89),(39,89),(39,46),(33,58),(15,52)],
    'glove': [(36,88),(29,62),(17,49),(22,42),(37,50),(38,27),(46,21),(51,44),(52,17),(61,15),(65,42),(69,20),(77,21),(79,45),(84,29),(92,32),(90,62),(78,87)],
    'helmet': [(15,73),(17,52),(32,33),(51,24),(77,25),(99,37),(109,54),(110,70),(91,77),(76,73),(65,84),(29,85)],
    'pad': [(39,32),(60,21),(81,32),(92,50),(87,73),(71,87),(49,87),(33,73),(28,50)],
    'loop': [(22,44),(34,33),(86,33),(101,44),(101,68),(86,79),(34,79),(22,68),(22,55),(37,65),(83,65),(87,59),(87,52),(83,47),(37,47),(22,55)],
    'mat': [(27,21),(102,21),(92,86),(17,86)],
    'bag': [(15,47),(41,47),(41,34),(49,25),(73,25),(82,34),(82,47),(106,47),(110,86),(11,86)],
    'trousers': [(35,21),(85,21),(95,89),(69,89),(60,48),(51,89),(25,89)],
}
COLORS = [(37,98,125),(166,60,79),(76,108,70)]
MODELS = ['Альта','Бриз','Вектор','Грань','Дельта','Искра','Линия','Маяк','Нева','Орбита','Пульс','Ритм','Сфера','Точка','Форма','Штрих']


def domains(path):
    for line in path.read_text(encoding='utf-8').splitlines():
        if not line or line.startswith('#'):
            continue
        title, shape, unit, start, step, material, entries = line.split('|')
        groups = [(name, types.split(',')) for name, types in (entry.split(':') for entry in entries.split(';'))]
        yield title, shape, unit, Decimal(start), Decimal(step), material, groups


def domain_data(sample, domain, number):
    title, _, _, start, step, material, groups = domain
    data = deepcopy(sample)
    data['categories'] = [name for name, _ in groups]
    data['subcategories'] = [
        {'category': category, 'name': product_type}
        for category, types in groups for product_type in types
    ]
    subcategories = {
        (original['category'], original['name']): updated
        for original, updated in zip(sample['subcategories'], data['subcategories'])
    }
    if len(data['categories']) != len(sample['categories']) or len(subcategories) != len(data['subcategories']) or len(subcategories) != len(sample['subcategories']):
        raise ValueError(f'Несовместимый набор категорий: {title}')
    data['manufacturers'] = ['Мастерская «'+name+'»' for name in MODELS]
    makers = dict(zip(sample['manufacturers'], data['manufacturers']))
    sizes = {
        size: format(start + i * step, 'f').rstrip('0').rstrip('.') if step % 1 else str(start + i * step)
        for i, size in enumerate(sample['sizes'])
    } if step else {size: size for size in sample['sizes']}
    data['sizes'] = list(sizes.values())
    for product in data['products']:
        subcategory = subcategories[(product['category'], product['subcategory'])]
        group = data['categories'].index(subcategory['category']) + 1
        product_type = subcategory['name']
        model = f'{MODELS[(product["id"]+number)%len(MODELS)]}-{product["id"]:02}'
        product.update(
            category=subcategory['category'], subcategory=product_type, manufacturer=makers[product['manufacturer']],
            name=f'{product_type.capitalize()} «{model}»', image='missing.png' if product['id']==31 else f'group-{group}.png',
            composition=material, description=f'{product_type.capitalize()} из раздела «{subcategory["category"]}». Модель «{model}».',
            price=str(500+number*40+(product['id']*137+number*73)%6500),
        )
    for row in data['stock']:
        row.update(size=sizes[row['size']], available=(row['id']+number)%18)
    for user in data['users']:
        user['login'] = f'v{number:02d}_{user["login"]}'
    products = {p['id']:p for p in data['products']}
    stock = {s['id']:s for s in data['stock']}
    for item in data['items']:
        item['price'] = products[stock[item['stock_id']]['product_id']]['price']
    return data


def polygon_png(shape, color, height=104):
    """Render an original, schematic catalog illustration as a WinForms-compatible PNG."""
    points = SHAPES[shape]
    width = 124

    def inside(x, y):
        hit = False
        for (x1, y1), (x2, y2) in zip(points, points[1:] + points[:1]):
            if (y1 > y) != (y2 > y) and x < x1 + (x2 - x1) * (y - y1) / (y2 - y1):
                hit = not hit
        return hit

    def chunk(kind, value):
        return struct.pack('>I', len(value)) + kind + value + struct.pack('>I', zlib.crc32(kind + value))

    pixels = b''.join(b'\0' + b''.join(bytes(color if inside(x+.5,y+.5) else (240,244,247)) for x in range(width)) for y in range(height))
    return b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR',struct.pack('>IIBBBBB',width,height,8,2,0,0,0)) + chunk(b'IDAT',zlib.compress(pixels)) + chunk(b'IEND',b'')


def domain_materials(folder, domain, placeholder):
    title, shape, unit, _, _, _, groups = domain
    resources = folder/'Ресурсы'
    images = resources/'Images'
    images.mkdir(parents=True,exist_ok=True)
    for i, color in enumerate(COLORS,1):
        (images/f'group-{i}.png').write_bytes(polygon_png(shape,color))
    (resources/'picture.png').write_bytes(placeholder.read_bytes())
    (resources/'logo.png').write_bytes(polygon_png(shape,COLORS[0]))
    icon = polygon_png(shape,COLORS[0],height=124)
    directory = struct.pack('<HHHBBBBHHII',0,1,1,124,124,0,0,1,32,len(icon),22)
    (resources/'logo.ico').write_bytes(directory+icon)
    labels = ''.join(f'<li>{escape(name)}. {escape(", ".join(types))}.</li>' for name, types in groups)
    subject = f'<h1>{escape(title)}</h1><p>Магазин ведёт каталог моделей с размерами и принимает заказы покупателей. Размер указан как {escape(unit)}.</p><ul>{labels}</ul><p>Файлы CSV описывают модели, размерные остатки, покупателей, заголовки и строки заказов. История заказов уже учтена в исходных остатках.</p>'
    style = '<h1>Руководство по стилю</h1><p>Шрифт Calibri. Основной фон #FFFFFF, дополнительный #D2F6E7, акцент #70B2AF. Модели с остатком до 3 включительно выделяйте #FF8080.</p><p>Покажите знак из файла Ресурсы/logo.png и укажите Ресурсы/logo.ico как значок приложения. В строке каталога слева разместите изображение, в центре название, категорию, производителя, состав и остаток, справа цену. Файлы group-1.png, group-2.png и group-3.png — условные иллюстрации разделов. Для модели с отсутствующим missing.png используйте Ресурсы/picture.png.</p>'
    for name, body in [('description.html', subject), ('style-guide.html', style)]:
        (folder/name).write_text('<!doctype html><html lang="ru"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+escape(title)+'</title><body>'+body+'</body></html>\n',encoding='utf-8')
