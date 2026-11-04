#!/usr/bin/env python3
"""Read-only source audit. Python 3 stdlib; bsdtar is needed for RAR extraction."""
import argparse
import collections
import datetime
import hashlib
import json
import pathlib
import subprocess
import tempfile
import xml.etree.ElementTree as ET
import zipfile

NS = {"s": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}


def xlsx_rows(path):
    with zipfile.ZipFile(path) as archive:
        strings = []
        if "xl/sharedStrings.xml" in archive.namelist():
            root = ET.fromstring(archive.read("xl/sharedStrings.xml"))
            strings = ["".join(t.text or "" for t in item.findall(".//s:t", NS))
                       for item in root.findall("s:si", NS)]
        root = ET.fromstring(archive.read("xl/worksheets/sheet1.xml"))
        result = []
        for row in root.findall(".//s:row", NS):
            values = {}
            for cell in row:
                address = cell.get("r", "")
                letters = "".join(c for c in address if c.isalpha())
                index = 0
                for char in letters:
                    index = index * 26 + ord(char) - ord("A") + 1
                value = cell.find("s:v", NS)
                raw = value.text if value is not None else ""
                if cell.get("t") == "s":
                    raw = strings[int(raw)]
                elif cell.get("t") == "inlineStr":
                    raw = "".join(t.text or "" for t in cell.findall(".//s:t", NS))
                values[index - 1] = raw
            result.append([values.get(i, "") for i in range(max(values, default=-1) + 1)])
        headers = result[0]
        return [dict(zip(headers, row + [""] * (len(headers) - len(row))))
                for row in result[1:] if any(row)]


def norm(value):
    return " ".join(value.split())


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--downloads", type=pathlib.Path, required=True)
    parser.add_argument("--output", type=pathlib.Path, required=True)
    args = parser.parse_args()
    names = ["КИМ 09.02.07-2-2027 Том 1.pdf",
             "Метод_рекомендации_Выпуск_09.02.07-2-2027.pdf",
             "Метод_рекомендации_СПО_09.02.07-2-2027.pdf",
             "Прил_ОЗ_КИМ_09.02.07-2-2027.zip"]
    manifest = [{"name": name, "bytes": (args.downloads / name).stat().st_size,
                 "sha256": hashlib.sha256((args.downloads / name).read_bytes()).hexdigest()}
                for name in names]
    with tempfile.TemporaryDirectory(prefix="prog-demo-sources-") as directory:
        temp = pathlib.Path(directory)
        with zipfile.ZipFile(args.downloads / names[-1]) as archive:
            rar_name = next(n for n in archive.namelist() if n.startswith("БУ/") and n.endswith(".rar"))
            rar = temp / "resources.rar"
            rar.write_bytes(archive.read(rar_name))
            members = [{"name": n, "sha256": hashlib.sha256(archive.read(n)).hexdigest()}
                       for n in archive.namelist() if not n.endswith("/")]
        resources = temp / "resources"
        resources.mkdir()
        subprocess.run(["bsdtar", "-xf", str(rar), "-C", str(resources)], check=True)
        data = {p.stem: xlsx_rows(p) for p in resources.glob("*.xlsx")}
        products = data["Products_import"]
        stock = data["Stock_Items_import"]
        orders = data["Orders_import"]
        users = data["Users_import"]
        exact = {(r["Наименование товара"], r["Производство"]): r for r in products}
        normalized = collections.defaultdict(list)
        for key in exact:
            normalized[tuple(map(norm, key))].append(key)
        mismatches = []
        for sheet in ("Stock_Items_import", "Orders_import"):
            for number, row in enumerate(data[sheet], 2):
                key = row["Наименование товара"], row["Производство"]
                if key not in exact:
                    candidates = normalized.get(tuple(map(norm, key)), [])
                    mismatches.append({"sheet": sheet, "row": number, "source_key": key,
                                       "whitespace_candidates": candidates})
        product_counts = collections.Counter((r["Наименование товара"], r["Производство"]) for r in products)
        stock_counts = collections.Counter((r["Наименование товара"], r["Производство"], r["Размер"]) for r in stock)
        sizes = {r["Размер"] for r in data["Sizes_import"]}
        full_names = {" ".join((r["Фамилия"], r["Имя"], r["Отчетсво"])) for r in users}
        unknown_names = sorted({r["ФИО"] for r in orders} - full_names)
        dates = [datetime.datetime(1899, 12, 30) + datetime.timedelta(days=float(r["Дата заказа"])) for r in orders]
        report = {
            "source_files": manifest, "zip_members": members,
            "resource_files": [{"name": p.relative_to(resources).as_posix(),
                                "sha256": hashlib.sha256(p.read_bytes()).hexdigest()}
                               for p in sorted(resources.rglob("*")) if p.is_file()],
            "rows": {key: len(value) for key, value in data.items()},
            "distinct_orders": len({r["Номер заказа"] for r in orders}),
            "order_date_range": [min(dates).isoformat(), max(dates).isoformat()],
            "roles": dict(collections.Counter(r["Роль"] for r in users)),
            "duplicate_product_keys": [key for key, value in product_counts.items() if value > 1],
            "duplicate_stock_keys": [key for key, value in stock_counts.items() if value > 1],
            "duplicate_logins": [key for key, value in collections.Counter(r["Логин"] for r in users).items() if value > 1],
            "missing_images": [r["Изображение"] for r in products if r["Изображение"] and not (resources / "Images" / r["Изображение"]).exists()],
            "stock_unknown_sizes": sorted({r["Размер"] for r in stock} - sizes),
            "order_unknown_sizes": sorted({r["Размер"] for r in orders} - sizes),
            "orders_unknown_customer_names": unknown_names,
            "model_key_mismatches": mismatches,
            "whitespace_match_rows": sum(len(m["whitespace_candidates"]) == 1 for m in mismatches),
            "unresolved_match_rows": sum(len(m["whitespace_candidates"]) != 1 for m in mismatches),
            "scope": "Source audit only. No application or Windows runtime acceptance is claimed."
        }
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
        print(json.dumps({key: report[key] for key in ("rows", "distinct_orders", "whitespace_match_rows", "unresolved_match_rows", "orders_unknown_customer_names")}, ensure_ascii=False))


if __name__ == "__main__":
    main()
