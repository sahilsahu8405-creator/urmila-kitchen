import re

with open('src/lib/initialData.ts', encoding='utf-8') as f:
    text = f.read()

blocks = re.findall(r"\{\s*id:\s*'item-\d+'[^}]+}", text)
for b in blocks:
    if "image_url: null" in b:
        id_m = re.search(r"id:\s*'([^']+)'", b)
        cat_m = re.search(r"category_id:\s*'([^']+)'", b)
        name_m = re.search(r"name:\s*'([^']+)'", b)
        print(id_m.group(1), cat_m.group(1), name_m.group(1))
