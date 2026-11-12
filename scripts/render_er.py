import html
import json
import math
import subprocess
from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen.canvas import Canvas

INK = '#202a3a'
MUTED = '#526175'
LINE = '#d4ddea'
PAPER = '#ffffff'
CANVAS = '#eef2f7'
SOFT = '#f5f8fc'
ACCENT = '#a51f42'

def draw(repo, graph, schema, suffix, name):
    tables = {table["id"]: table for table in schema["tables"]}
    width, height = graph['width'], graph['height'] + 50
    path = repo / 'materials' / ('ER' + suffix)
    pdf = Canvas(str(path.with_suffix('.pdf')), pagesize=(width, height), invariant=1)
    pdf.setTitle('Чудо Обувь · ER-диаграмма · ' + name)
    svg = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" font-family="system-ui,sans-serif">']

    def rect(x, y, w, h, fill, stroke=None, radius=0):
        pdf.setFillColor(HexColor(fill))
        pdf.setStrokeColor(HexColor(stroke or fill))
        pdf.roundRect(x, height-y-h, w, h, radius, stroke=bool(stroke), fill=1)
        svg.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{radius}" fill="{fill}"'
                   + (f' stroke="{stroke}"' if stroke else '') + '/>')

    def text(x, y, label, size=12, color=INK, bold=False):
        pdf.setFillColor(HexColor(color))
        pdf.setFont('DiagramBold' if bold else 'DiagramRegular', size)
        pdf.drawString(x, height-y, label)
        svg.append(f'<text x="{x}" y="{y}" font-size="{size}" fill="{color}"'
                   + (' font-weight="bold"' if bold else '') + '>' + html.escape(label) + '</text>')

    def line(points, color, fill=False):
        pdf.setStrokeColor(HexColor(color))
        pdf.setFillColor(HexColor(color))
        p = pdf.beginPath()
        p.moveTo(points[0][0], height-points[0][1])
        for x, y in points[1:]:
            p.lineTo(x, height-y)
        if fill:
            p.close()
        pdf.drawPath(p, stroke=not fill, fill=fill)
        coords = ' '.join(f'{x},{y}' for x,y in points)
        if fill:
            svg.append(f'<polygon points="{coords}" fill="{color}"/>')
        else:
            svg.append(f'<polyline points="{coords}" stroke="{color}" fill="none"/>')

    rect(0, 0, width, height, CANVAS)
    text(28, 28, 'Чудо Обувь · ' + name + ' · Связи от FK к PK', 18, bold=True)
    for node in graph['nodes']:
        x, y, w, h = node['x'], node['y']+50, node['width'], node['height']
        table = tables[node['id']]
        rect(x, y, w, h, PAPER, LINE, 10)
        rect(x+1, y+1, w-2, 63, SOFT, radius=8)
        text(x+12, y+24, table['title'], 14, bold=True)
        text(x+12, y+45, table['id'], 11, MUTED)
        for index, field in enumerate(table['fields']):
            row = y+65+index*44
            line([(x+1,row),(x+w-1,row)], LINE)
            keys = ' · '.join(label for prop,label in [('pk','PK'),('fk','FK'),('unique','UNIQUE')] if field[prop])
            text(x+12, row+17, field['id']+(' · '+keys if keys else ''), 13, bold=True)
            text(x+12, row+34, field['type'], 11, MUTED)
    parents = set()
    edges = {link['from']+'.'+link['field']:link for link in schema['links']}
    for edge in graph['edges']:
        for section in edge['sections']:
            points = [(p['x'], p['y']+50) for p in reversed([
                section['startPoint'], *section.get('bendPoints', []), section['endPoint']])]
            line(points, MUTED)
            x, y = points[-1]
            start_x, start_y = points[-2]
            magnitude = math.hypot(x-start_x, y-start_y)
            if magnitude:
                dx, dy = (x-start_x)/magnitude, (y-start_y)/magnitude
                line([(x,y),(x-8*dx+4*dy,y-8*dy-4*dx),(x-8*dx-4*dy,y-8*dy+4*dx)], ACCENT, True)
            child_x, child_y = points[0]
            text(child_x-15, child_y-5, 'N', 12, bold=True)
            link = edges[edge['id']]
            parent = link['to']+'.'+link['target']
            if parent not in parents:
                parents.add(parent)
                text(x+5, y-5, '1', 12, bold=True)
    svg.append('</svg>')
    path.with_suffix('.svg').write_text(''.join(svg), encoding='utf-8')
    pdf.showPage()
    pdf.save()


def export_er(repo, font):
    regular = Path(font)
    windows_bold = {'segoeui':'segoeuib.ttf','arial':'arialbd.ttf'}.get(regular.stem.lower())
    candidates = [regular.with_name(regular.stem + '-Bold.ttf')]
    if windows_bold:
        candidates.insert(0, regular.with_name(windows_bold))
    bold = next((candidate for candidate in candidates if candidate.exists()), regular)
    pdfmetrics.registerFont(TTFont('DiagramRegular', font))
    pdfmetrics.registerFont(TTFont('DiagramBold', str(bold)))
    data = json.loads(subprocess.check_output(
        ['node', 'scripts/export-er-data.mjs'], cwd=repo, encoding='utf-8'))
    for stack, suffix, name in [('mysql', '', 'MySQL / MariaDB'), ('postgresql', '-postgresql', 'PostgreSQL')]:
        draw(repo, data['layout'], data['stacks'][stack], suffix, name)
