import re
import json

with open('src/lib/initialData.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Extract items
pattern = r"id:\s*'([^']+)',\s*category_id:\s*'([^']+)',\s*name:\s*'([^']+)'"
items = re.findall(pattern, text)
print(f"Total extracted items: {len(items)}")

categories = {
    'cat-1': 'starters',
    'cat-2': 'chaats',
    'cat-3': 'mains',
    'cat-4': 'mexican-mains',
    'cat-5': 'baked-dishes',
    'cat-6': 'sandwich-corner',
    'cat-7': 'fondue',
    'cat-8': 'drinks',
    'cat-9': 'desserts'
}

dishes = []
for item_id, cat_id, name in items:
    cat_slug = categories.get(cat_id, 'other')
    # Generate clean kebab-case filename
    slug = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')
    filename = f"{slug}.webp"
    dishes.append({
        'id': item_id,
        'cat_id': cat_id,
        'cat_slug': cat_slug,
        'name': name,
        'slug': slug,
        'filename': filename,
        'rel_path': f"images/menu/{cat_slug}/{filename}",
        'full_path': f"public/images/menu/{cat_slug}/{filename}"
    })

with open('scripts/dishes.json', 'w', encoding='utf-8') as f:
    json.dump(dishes, f, indent=2)

print(f"Saved {len(dishes)} dishes to scripts/dishes.json")
for idx, d in enumerate(dishes, 1):
    print(f"{idx:02d}. [{d['cat_slug']}] {d['name']} -> {d['rel_path']}")

