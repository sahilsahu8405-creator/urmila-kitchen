import json

dishes = json.load(open('scripts/dishes.json', encoding='utf-8'))
sb_items = json.load(open('scripts/supabase_items.json', encoding='utf-8'))

print(f"Total in dishes.json: {len(dishes)}")
print(f"Total in supabase_items.json: {len(sb_items)}")

# Check category mapping
cat_map = {
    "c1000000-0000-0000-0000-000000000001": "starters",
    "c1000000-0000-0000-0000-000000000002": "chaats",
    "c1000000-0000-0000-0000-000000000003": "mains",
    "c1000000-0000-0000-0000-000000000004": "mexican-mains",
    "c1000000-0000-0000-0000-000000000005": "baked-dishes",
    "c1000000-0000-0000-0000-000000000006": "sandwich-corner",
    "c1000000-0000-0000-0000-000000000007": "fondue",
    "c1000000-0000-0000-0000-000000000008": "drinks",
    "c1000000-0000-0000-0000-000000000009": "desserts",
}

# In supabase_items, each item has an id, name, category_id.
# Let's map each supabase item directly to its slug and filename.
import re

def slugify(text):
    text = text.lower()
    text = re.sub(r'[\(\)]', '', text)
    text = re.sub(r'[^a-z0-9]+', '-', text).strip('-')
    return text

sb_inventory = []
for it in sb_items:
    cat_slug = cat_map.get(it['category_id'], 'mains')
    dish_slug = slugify(it['name'])
    filename = f"{dish_slug}.webp"
    rel_path = f"images/menu/{cat_slug}/{filename}"
    full_path = f"public/images/menu/{cat_slug}/{filename}"
    sb_inventory.append({
        "id": it["id"],
        "name": it["name"],
        "category_id": it["category_id"],
        "cat_slug": cat_slug,
        "slug": dish_slug,
        "filename": filename,
        "rel_path": rel_path,
        "full_path": full_path,
        "price": it["price"],
        "is_available": it["is_available"]
    })

print(f"Generated sb_inventory with {len(sb_inventory)} items.")
with open('scripts/sb_inventory.json', 'w', encoding='utf-8') as f:
    json.dump(sb_inventory, f, indent=2)

# Check for any duplicate filenames within the same category
seen_paths = set()
duplicates = []
for it in sb_inventory:
    if it["rel_path"] in seen_paths:
        duplicates.append(it["rel_path"])
    seen_paths.add(it["rel_path"])

print(f"Unique paths: {len(seen_paths)} / {len(sb_inventory)}")
if duplicates:
    print(f"Duplicates found: {duplicates}")

