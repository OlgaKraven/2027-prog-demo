"""Development check: compare C# data-only SQL with all six CSV inputs independently."""
import argparse
import csv
import hashlib
import json
import platform
import re
import shutil
import subprocess
import tempfile
from decimal import Decimal
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
NAMES = ('products', 'stock', 'sizes', 'users', 'orders', 'items')
DLL = ROOT / 'examples/Import/bin/Debug/net10.0/ProgDemo.Import.dll'


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def csv_rows(path):
    with path.open(encoding='utf-8-sig', newline='') as stream:
        return list(csv.DictReader(stream))


def invoke(source, target, success=True):
    result = subprocess.run(['dotnet', str(DLL), str(source), str(target), 'prog_demo_student'],
                            cwd=ROOT, capture_output=True, text=True, encoding='utf-8', errors='replace')
    assert (result.returncode == 0) == success, result.stdout + result.stderr
    return result


def sql_rows(path):
    sql = path.read_text(encoding='utf8')
    assert sql.startswith('USE `prog_demo_student`;\nSTART TRANSACTION;\n')
    assert sql.endswith('COMMIT;\n')
    assert not re.search(r'\b(CREATE|ALTER|DROP|TRUNCATE|DELETE|UPDATE)\b', sql, re.I)

    def literal(value):
        encoded = re.fullmatch(r"CONVERT\(X'([0-9A-F]*)' USING utf8mb4\)", value)
        if encoded:
            return bytes.fromhex(encoded[1]).decode('utf8')
        if value.startswith("'"):
            return value[1:-1]
        return Decimal(value)

    tables = {}
    for line in sql.splitlines():
        match = re.fullmatch(r'INSERT INTO (\w+)\(([^)]+)\) VALUES\((.*)\);', line)
        if match:
            row = dict(zip(match[2].split(','), map(literal, match[3].split(','))))
            assert len(row) == len(match[2].split(','))
            tables.setdefault(match[1], {})[int(row['id'])] = row
    assert len(tables) == 10
    return tables


def check_variant(source, target):
    data = {name: csv_rows(source / (name + '.csv')) for name in NAMES}
    invoke(source, target)
    tables = sql_rows(target / 'data.sql')
    for name, table in [('products', 'products'), ('stock', 'stock_items'), ('sizes', 'sizes'),
                        ('users', 'users'), ('orders', 'orders'), ('items', 'order_items')]:
        assert len(tables[table]) == len(data[name]), (source.name, table)
    for p in data['products']:
        row = tables['products'][int(p['id'])]
        for key in ('name', 'image', 'composition', 'description'):
            assert row[key] == p[key], (source.name, key, p['id'])
        assert row['price'] == Decimal(p['price'])
        sub = tables['subcategories'][int(row['subcategory_id'])]
        assert sub['name'] == p['subcategory']
        assert tables['categories'][int(sub['category_id'])]['name'] == p['category']
        assert tables['manufacturers'][int(row['manufacturer_id'])]['name'] == p['manufacturer']
    for user in data['users']:
        row = tables['users'][int(user['id'])]
        for key in ('login', 'last_name', 'first_name', 'patronymic'):
            assert row[key] == user[key]
        assert tables['roles'][int(row['role_id'])]['name'] == user['role']
    assert {Decimal(r['label']) for r in tables['sizes'].values()} == {Decimal(r['size']) for r in data['sizes']}
    for stock in data['stock']:
        row = tables['stock_items'][int(stock['id'])]
        assert row['product_id'] == Decimal(stock['product_id'])
        assert Decimal(tables['sizes'][int(row['size_id'])]['label']) == Decimal(stock['size'])
        assert row['available'] == Decimal(stock['available'])
    for order in data['orders']:
        row = tables['orders'][int(order['id'])]
        assert row['order_date'] == order['date'].replace('T', ' ')
        assert row['user_id'] == row['created_by'] == Decimal(order['user_id'])
        assert row['stock_accounted'] == 0
    for item in data['items']:
        row = tables['order_items'][int(item['id'])]
        for source_key, sql_key in [('order_id', 'order_id'), ('stock_id', 'stock_id'),
                                    ('quantity', 'quantity'), ('price', 'unit_price')]:
            assert row[sql_key] == Decimal(item[source_key])
    return {'variant': source.name, 'counts': {name: len(rows) for name, rows in data.items()},
            'sqlSha256': digest(target / 'data.sql')}


def write_csv(path, rows):
    with path.open('w', encoding='utf-8-sig', newline='') as stream:
        writer = csv.DictWriter(stream, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--report', default='output/csv-import-check.json')
    args = parser.parse_args()
    subprocess.run(['dotnet', 'build', 'examples/Import/ProgDemo.Import.csproj', '--nologo', '-v', 'quiet'],
                   cwd=ROOT, check=True)
    sources = sorted((ROOT / 'content/variants').glob('V*/*.csv')) + sorted((ROOT / 'materials/resources').glob('*.xlsx'))
    before = {str(p.relative_to(ROOT)): digest(p) for p in sources}
    with tempfile.TemporaryDirectory(prefix='prog-demo-import-') as scratch:
        temporary = Path(scratch)
        variants = [check_variant(source, temporary / source.name)
                    for source in sorted((ROOT / 'content/variants').glob('V*')) if source.is_dir()]
        assert len(variants) == 30
        original = temporary / 'original'
        invoke(ROOT / 'materials/resources', original)
        baseline = json.loads((ROOT / 'docs/audit/windows-data-import.json').read_text())['sha256']
        assert digest(original / 'data.sql') == baseline, 'Original XLSX output changed'
        negative = []
        cases = [('items', 'stock_id', '999999'), ('stock', 'id', '2'),
                 ('orders', 'stock_accounted', 'True'), ('users', 'full_name', 'Mismatch')]
        for index, (name, field, value) in enumerate(cases):
            source = temporary / ('bad-' + str(index))
            source.mkdir()
            for csv_name in NAMES:
                shutil.copyfile(ROOT / 'content/variants/V01' / (csv_name + '.csv'), source / (csv_name + '.csv'))
            file = source / (name + '.csv')
            rows = csv_rows(file)
            rows[0][field] = value
            write_csv(file, rows)
            output = temporary / ('rejected-' + str(index))
            invoke(source, output, False)
            assert not (output / 'data.sql').exists()
            negative.append(name + '.' + field)
        existing = temporary / 'V01/data.sql'
        saved_hash = digest(existing)
        invoke(ROOT / 'content/variants/V01', temporary / 'V01', False)
        assert digest(existing) == saved_hash
        negative.append('refuse-overwrite')
    assert all(digest(ROOT / path) == expected for path, expected in before.items())
    report = ROOT / args.report
    report.parent.mkdir(parents=True, exist_ok=True)
    report.write_text(json.dumps({'complete': True, 'platform': platform.system(), 'dataOnly': True,
        'independentCsvToSqlFieldComparison': True, 'variants': variants,
        'negativeCases': negative, 'inputFilesUnchanged': len(sources), 'originalSqlSha256': baseline},
        ensure_ascii=False, indent=2) + '\n', encoding='utf8')
    print('Verified: 30 variants, every mapped field, original SHA-256, five rejected cases; inputs unchanged.')


if __name__ == '__main__':
    main()
