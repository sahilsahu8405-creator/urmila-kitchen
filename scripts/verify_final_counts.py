import json
import requests

SUPABASE_URL = 'https://crtqlfpebjtqkiemqnpp.supabase.co'
ANON_KEY = 'sb_publishable_iG5OIy-HtCWQL0GRDQt2qQ_4-dnDbR1'

headers = {'apikey': ANON_KEY, 'Authorization': f'Bearer {ANON_KEY}'}

r = requests.get(f'{SUPABASE_URL}/rest/v1/menu_items?select=*', headers=headers)
items = r.json()

has_img = [it for it in items if it.get('image_url')]
is_null = [it for it in items if not it.get('image_url')]

print(f"Total Supabase menu_items: {len(items)}")
print(f"Items with user dish images: {len(has_img)}")
print(f"Items with null image_url (fallback placeholder): {len(is_null)}")

# Category breakdown of items with user images
from collections import defaultdict
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

by_cat = defaultdict(list)
for it in has_img:
    c = cat_map.get(it['category_id'], 'other')
    by_cat[c].append(it['name'])

print("\nBreakdown of dishes with uploaded user images:")
for c, names in by_cat.items():
    print(f"  {c} ({len(names)}):")
    for n in names:
        print(f"    - {n}")

