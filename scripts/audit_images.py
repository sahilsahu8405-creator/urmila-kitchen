import json
import requests
import os

SUPABASE_URL = 'https://crtqlfpebjtqkiemqnpp.supabase.co'
ANON_KEY = 'sb_publishable_iG5OIy-HtCWQL0GRDQt2qQ_4-dnDbR1'

headers = {'apikey': ANON_KEY, 'Authorization': f'Bearer {ANON_KEY}'}

# Fetch live items from Supabase
r = requests.get(f'{SUPABASE_URL}/rest/v1/menu_items?select=*', headers=headers)
if r.status_code != 200:
    print('Failed to fetch menu items from Supabase:', r.text)
    exit(1)

items = r.json()
total_items = len(items)

uploaded_count = 0
missing_images = []
failed_uploads = []
image_urls = []
duplicate_urls = []

seen_urls = set()

for it in items:
    url = it.get('image_url')
    name = it['name']
    item_id = it['id']
    
    if not url:
        missing_images.append({'id': item_id, 'name': name, 'reason': 'image_url is null'})
        continue
        
    if url in seen_urls:
        duplicate_urls.append({'id': item_id, 'name': name, 'url': url})
    seen_urls.add(url)
    
    # Check if storage URL is reachable
    try:
        head_res = requests.head(url, timeout=5)
        if head_res.status_code == 200:
            uploaded_count += 1
        else:
            failed_uploads.append({'id': item_id, 'name': name, 'url': url, 'status': head_res.status_code})
    except Exception as e:
        failed_uploads.append({'id': item_id, 'name': name, 'url': url, 'error': str(e)})

# Local file check
local_count = 0
for root, dirs, files in os.walk('public/images/menu'):
    for f in files:
        if f.endswith('.webp'):
            local_count += 1

audit_result = {
    "total_menu_items": total_items,
    "images_successfully_uploaded": uploaded_count,
    "missing_images": len(missing_images),
    "duplicate_image_urls": len(duplicate_urls),
    "failed_uploads": len(failed_uploads),
    "local_webp_files": local_count,
    "details": {
        "missing": missing_images,
        "duplicates": duplicate_urls,
        "failed": failed_uploads
    }
}

print(json.dumps(audit_result, indent=2))
with open('scripts/audit_result.json', 'w', encoding='utf-8') as f:
    json.dump(audit_result, f, indent=2)

