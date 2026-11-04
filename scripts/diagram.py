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
origins={'roles':'Users_import.xlsx → Роль','users':'Users_import.xlsx → Фамилия, Имя, Отчетсво, Логин, Роль','categories':'Products_import.xlsx → Категория','subcategories':'Products_import.xlsx → Категория, Подкатегория','manufacturers':'Products_import.xlsx → Производство','products':'Products_import.xlsx → Наименование, Фото, Состав, Описание, Цена','sizes':'Sizes_import.xlsx → Размер','stock_items':'Stock_Items_import.xlsx → Модель, Производство, Размер, Остаток','orders':'Orders_import.xlsx → Номер заказа, Дата, ФИО','order_items':'Orders_import.xlsx → Номер, Модель, Размер, Количество, Цена'}
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
        field,type=match.groups();fields.append(dict(id=field,type=type,pk='PRIMARY KEY' in p,fk=field in fks,origin=origins[name] if field not in ('id','request_id','stock_accounted','created_by','sort_value') else 'Техническое поле разработчика; назначение объяснено в модели.'))
    for field,(target,key) in fks.items():links.append(dict(source=name,field=field,target=target,key=key,cardinality='N : 1'))
    x,y=positions[name];tables.append(dict(id=name,x=30+x*410,y=70+y*355,width=370,fields=fields,origin=origins[name]))
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
