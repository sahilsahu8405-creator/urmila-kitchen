import json

inv = json.load(open('scripts/sb_inventory.json', encoding='utf-8'))
for i, item in enumerate(inv, 1):
    print(f"{i:2d}. [{item['cat_slug']}] {item['name']} -> {item['filename']}")

