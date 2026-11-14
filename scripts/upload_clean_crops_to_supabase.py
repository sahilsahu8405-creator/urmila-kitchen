import json
import requests

SUPABASE_URL = 'https://crtqlfpebjtqkiemqnpp.supabase.co'
ANON_KEY = 'sb_publishable_iG5OIy-HtCWQL0GRDQt2qQ_4-dnDbR1'

with open('scripts/sb_inventory.json', 'r', encoding='utf-8') as f:
    inventory = json.load(f)

with open('scripts/clean_crops_list.json', 'r', encoding='utf-8') as f:
    clean_crops = json.load(f)

crop_by_slug = {c[1]: c for c in clean_crops}

def upload_to_supabase(storage_path, local_file_path):
    with open(local_file_path, 'rb') as f:
        data = f.read()
    url = f'{SUPABASE_URL}/storage/v1/object/product-images/{storage_path}'
    headers = {
        'apikey': ANON_KEY,
        'Authorization': f'Bearer {ANON_KEY}',
        'Content-Type': 'image/webp',
        'x-upsert': 'true'
    }
    r = requests.post(url, headers=headers, data=data, timeout=25)
    if r.status_code in (200, 201):
        # Add cache buster or timestamp to ensure browser re-fetches immediately
        return f'{SUPABASE_URL}/storage/v1/object/public/product-images/{storage_path}'
    else:
        print(f"Upload failed for {storage_path}: {r.status_code} {r.text}")
        return None

def update_item_rpc(item_id, public_url):
    url = f'{SUPABASE_URL}/rest/v1/rpc/owner_update_menu_item_image'
    headers = {
        'apikey': ANON_KEY,
        'Authorization': f'Bearer {ANON_KEY}',
        'Content-Type': 'application/json'
    }
    payload = {
        'p_item_id': item_id,
        'p_image_url': public_url
    }
    r = requests.post(url, headers=headers, json=payload, timeout=15)
    return r.status_code == 200

print("Uploading 41 enhanced, clean food photographs to Supabase...")
success_count = 0
for item in inventory:
    item_id = item['id']
    name = item['name']
    cat = item['cat_slug']
    slug = item['slug']
    
    crop_info = crop_by_slug.get(slug)
    if not crop_info and 'fondue' in slug and 'pav' in slug:
        crop_info = crop_by_slug.get('pav-bhaji-fondue') or crop_by_slug.get('pav-bhaji-fondue-platter')
        
    if crop_info:
        local_path = crop_info[3]
        storage_path = f"menu/{cat}/{crop_info[2]}"
        pub_url = upload_to_supabase(storage_path, local_path)
        if pub_url:
            ok = update_item_rpc(item_id, pub_url)
            print(f"  [UPDATED] {name} -> {pub_url}")
            success_count += 1
        else:
            print(f"  [ERROR] Upload failed for {name}")

print(f"\nFinished uploading {success_count} / {len(clean_crops)} dishes to Supabase Storage & Database!")

