import json
import os
import io
import time
import requests
from PIL import Image

# 1. Load Supabase inventory
with open('scripts/sb_inventory.json', 'r', encoding='utf-8') as f:
    inventory = json.load(f)

# Supabase config
SUPABASE_URL = 'https://crtqlfpebjtqkiemqnpp.supabase.co'
ANON_KEY = 'sb_publishable_iG5OIy-HtCWQL0GRDQt2qQ_4-dnDbR1'

HEADERS_WIKI = {
    'User-Agent': 'UrmilaKitchenBot/1.0 (https://urmilakitchen.com; contact@urmilakitchen.com) Python-requests/2.31'
}

# Tailored search queries for each dish
QUERY_MAP = {
    # Fondue
    "Pav bhaji fondue (Platter)": ["pav bhaji platter", "pav bhaji street food", "cheese fondue"],
    "Mexican fondue": ["queso fundido", "nachos cheese sauce", "cheese dip"],
    "Cheese fondue": ["swiss cheese fondue", "fondue cheese pot", "melted cheese bread"],
    "Pav bhaji fondue": ["pav bhaji toasted bread", "fondue bread cubes", "pav bhaji"],

    # Starters
    "Corn Bunch": ["baby corn pakoda", "crispy baby corn", "corn fritters"],
    "Cheese Corn Balls": ["cheese corn balls", "fried cheese balls", "arancini"],
    "Garlic Bread": ["garlic bread baguettes", "garlic toast herbs", "bruschetta"],
    "Hara Bhara Kebab": ["hara bhara kabab", "veg shami kabab", "spinach cutlet"],
    "Hara Bhara Paneer Roll": ["paneer kathi roll", "paneer frankie", "paneer wrap"],
    "Tart with Corn Filling": ["corn tart savoury", "cheese corn quiche", "savoury tartlet"],
    "Bruschetta": ["bruschetta tomato basil", "bruschetta baguette", "tomato toast"],
    "Nachos with Salsa & Cheese Dip": ["tortilla chips salsa cheese", "nachos guacamole dip", "nachos bowl"],
    "Dabeli": ["kachchi dabeli", "daabeli pav", "dabeli"],
    "Vada pav": ["vada pav street food", "batata vada pav", "vada pav"],
    "Dabeli bruschetta": ["masala toast bread", "dabeli toasted", "bruschetta"],
    "Thecha masala pav": ["masala pav mumbai", "thecha pav", "butter masala pav"],
    "Mexican Chilli Burger": ["black bean burger", "chilli burger vegetarian", "veggie burger"],
    "Paneer chilli burger": ["paneer burger", "crispy paneer burger", "spicy veg burger"],
    "Dahi ke kabab": ["dahi ke kebab", "dahi kebab", "hung curd cutlet"],
    "Thatte idli": ["thatte idli", "idli sambar", "idli chutney"],

    # Chaats
    "Gold Coin Chaat": ["sev puri chaat", "papdi chaat canapes", "coin chaat"],
    "Pineapple Bhel": ["bhel puri chaat", "mumbai bhel puri", "fruit bhel"],
    "Tiranga Bhel": ["bhel puri indian street food", "sev murmura", "bhel"],
    "Hara Bhara Bird’s Nest Chaat": ["katori chaat basket", "tokri chaat", "aloo basket chaat"],
    "Mexican Khakhra Chaat": ["masala papad", "khakhra roasted", "nachos salsa"],
    "Tamatar Chaat": ["tamatar chaat banarasi", "tomato chaat spicy", "aloo chaat"],
    "Chinese Bhel": ["chinese bhel crispy noodles", "fried noodles schezwan", "crispy chow mein"],
    "Batata Chaat": ["aloo chaat potato", "crispy batata chaat", "spiced potato chaat"],
    "Matar Chaat": ["safed matar chaat", "ragda chaat", "dry pea chaat"],

    # Mains
    "Spanish Rice with Tandoori Sauce": ["spanish seasoned rice", "vegetarian paella", "mexican rice bowl"],
    "Paneer Begum Bahar": ["shahi paneer royal", "paneer butter masala", "paneer makhani"],
    "Paneer Tikka Roll": ["paneer tikka roll wrap", "paneer roll wrap", "kathi roll"],
    "Veg Frankie": ["veg frankie wrap", "vegetable roll street food", "veg roll"],
    "Pav Bhaji": ["pav bhaji butter", "bambayya pav bhaji", "pav bhaji street"],
    "Paneer Fried Noodles": ["paneer noodles stir fry", "hakka noodles paneer", "veg chow mein"],
    "Chili Garlic Paneer Burger": ["chili paneer burger", "paneer burger gourmet", "veggie burger"],
    "Chola kulcha platter": ["chole bhature platter", "chole kulche", "punjabi chole"],
    "Pan fried noodles": ["pan fried noodles crispy", "crispy noodles stir fry", "fried noodles"],
    "French Casserole": ["vegetable casserole gratin", "ratatouille casserole", "potato gratin"],
    "Stacked Enchiladas": ["cheese enchiladas baked", "stacked enchiladas", "enchilada casserole"],
    "American Chop Suey": ["american chop suey vegetarian", "chop suey noodles", "sweet and sour noodles"],
    "Chinese Rice with Fried Noodles": ["fried rice crispy noodles", "schezwan fried rice", "veg fried rice"],
    "Muglai paratha with Lehsun chutney": ["mughlai paratha stuffed", "lachha paratha", "stuffed paratha"],

    # Mexican Mains
    "Mexican Rice": ["mexican red rice arroz", "mexican seasoned rice", "arroz rojo"],
    "Quesadillas": ["cheese quesadilla wedges", "mexican quesadilla", "quesadillas"],
    "Pocket Pizza": ["calzone pocket pizza", "baked pizza pocket", "mini calzone"],
    "Nachos with Salsa & Cheese Dip (Mexican)": ["loaded nachos salsa jalapeno", "mexican nachos plate", "nachos"],

    # Baked Dishes
    "Baked Begum Bahar": ["vegetable gratin au gratin", "baked vegetable casserole", "vegetable au gratin"],
    "Vegetable Gratin": ["vegetable gratin cheese", "potato cauliflower gratin", "gratin dauphinois"],
    "Tri-Colour Baking Delight": ["tricolour vegetable bake", "layered pasta bake", "spinach tomato bake"],
    "Baked Florentine": ["baked spinach florentine", "spinach gratin bechamel", "creamed spinach baked"],
    "Lasagne Verdi": ["lasagne verdi spinach", "vegetable lasagna baked", "lasagna"],
    "Baked Spanish Rice with Tomato Sauce": ["spanish rice casserole baked", "baked tomato rice", "arroz al horno"],
    "Tart with Corn Filling & Cheese Sauce": ["cheese corn tartlet baked", "savoury corn quiche", "tartlet"],
    "Moussaka": ["vegetarian moussaka eggplant", "greek moussaka vegetarian", "moussaka"],

    # Sandwich Corner
    "Russian Sandwich": ["russian salad sandwich", "coleslaw club sandwich", "vegetable sandwich"],
    "Corn Toast": ["cheese corn toast bread", "sweet corn toast", "toasted sandwich"],
    "Pinwheel Sandwich": ["pinwheel tea sandwiches", "rolled finger sandwiches", "cucumber sandwich"],
    "Creamy Spanish Sandwich": ["spanish vegetable sandwich", "grilled bocadillo", "panini sandwich"],

    # Drinks
    "Frappe": ["iced coffee frappe whipped", "frappuccino cold coffee", "iced frappe"],
    "Iced Mojito": ["virgin mint mojito lime", "sparkling mint cooler", "mojito cocktail"],
    "Tulsi Mojito": ["basil mint cooler iced", "holy basil drink", "green herb cooler"],

    # Desserts
    "Butterscotch Spanish Crème": ["crema catalana caramel", "butterscotch pudding custard", "creme brulee"],
    "Chocolate Spanish Crème": ["chocolate creme catalana", "chocolate pot de creme", "chocolate mousse dessert"],
    "Mango Spanish Crème": ["mango custard pudding", "mango mousse dessert", "mango panna cotta"],
    "Chocolate Monte Carlo": ["chocolate gateau cake", "chocolate layered mousse", "opera cake chocolate"],
    "Apple Crumble": ["apple crumble baked", "apple crisp dessert", "warm apple pie"],
    "Chocolate fondue": ["chocolate fondue strawberries", "chocolate fondue pot", "melted chocolate dip"]
}

def search_commons(query, seen_urls):
    url = 'https://commons.wikimedia.org/w/api.php'
    params = {
        'action': 'query',
        'generator': 'search',
        'gsrsearch': f'{query} -audio -ogg',
        'gsrnamespace': 6,
        'gsrlimit': 6,
        'prop': 'imageinfo',
        'iiprop': 'url',
        'iiurlwidth': 900,
        'format': 'json'
    }
    try:
        r = requests.get(url, params=params, headers=HEADERS_WIKI, timeout=12)
        if r.status_code != 200:
            return None
        data = r.json()
        pages = data.get('query', {}).get('pages', {})
        for pid, p in pages.items():
            infos = p.get('imageinfo', [])
            if not infos:
                continue
            thumb = infos[0].get('thumburl') or infos[0].get('url')
            if not thumb:
                continue
            if thumb in seen_urls:
                continue
            # avoid non-image files
            thumb_low = thumb.lower()
            if any(ext in thumb_low for ext in ['.jpg', '.jpeg', '.png', '.webp']):
                return thumb
    except Exception as e:
        print(f"  Search error on '{query}': {e}")
    return None

def download_and_process_image(image_url):
    r = requests.get(image_url, headers=HEADERS_WIKI, timeout=20)
    if r.status_code != 200 or len(r.content) < 500:
        return None
    img = Image.open(io.BytesIO(r.content)).convert('RGB')
    w, h = img.size
    min_dim = min(w, h)
    left = (w - min_dim) // 2
    top = (h - min_dim) // 2
    img_cropped = img.crop((left, top, left + min_dim, top + min_dim))
    img_resized = img_cropped.resize((600, 600), Image.Resampling.LANCZOS)
    
    buf = io.BytesIO()
    img_resized.save(buf, format='WEBP', quality=85)
    return buf.getvalue()

def upload_to_supabase(storage_path, webp_bytes):
    url = f'{SUPABASE_URL}/storage/v1/object/product-images/{storage_path}'
    headers = {
        'apikey': ANON_KEY,
        'Authorization': f'Bearer {ANON_KEY}',
        'Content-Type': 'image/webp',
        'x-upsert': 'true'
    }
    r = requests.post(url, headers=headers, data=webp_bytes, timeout=25)
    if r.status_code in (200, 201):
        return f'{SUPABASE_URL}/storage/v1/object/public/product-images/{storage_path}'
    else:
        print(f"  Upload failed ({r.status_code}): {r.text}")
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

print(f"Beginning complete menu image generation for {len(inventory)} items...\n")
seen_source_urls = set()
results = []

for idx, item in enumerate(inventory, 1):
    name = item['name']
    cat = item['cat_slug']
    item_id = item['id']
    full_path = item['full_path']
    rel_path = item['rel_path']
    storage_path = f"menu/{cat}/{item['filename']}"
    
    print(f"[{idx}/{len(inventory)}] Processing '{name}' ({cat})...")
    
    queries = QUERY_MAP.get(name, [name, f"{name} food", f"{cat} food"])
    image_url = None
    for q in queries:
        image_url = search_commons(q, seen_source_urls)
        if image_url:
            break
        time.sleep(0.3)
    
    if not image_url:
        print(f"  WARNING: No image found for {name} with queries {queries}")
        results.append({"name": name, "status": "FAILED_SEARCH", "id": item_id})
        continue

    seen_source_urls.add(image_url)
    
    # Download & process
    webp_data = download_and_process_image(image_url)
    if not webp_data:
        print(f"  WARNING: Failed to download/process image from {image_url}")
        results.append({"name": name, "status": "FAILED_DOWNLOAD", "id": item_id})
        continue
    
    # Save locally
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, 'wb') as f:
        f.write(webp_data)
        
    # Upload to Supabase Storage
    public_url = upload_to_supabase(storage_path, webp_data)
    if not public_url:
        print(f"  WARNING: Failed upload to Supabase for {storage_path}")
        results.append({"name": name, "status": "FAILED_UPLOAD", "id": item_id})
        continue
        
    # Update Supabase menu_items record
    rpc_ok = update_item_rpc(item_id, public_url)
    if not rpc_ok:
        print(f"  WARNING: RPC update failed for item {item_id}")
        results.append({"name": name, "status": "FAILED_RPC", "id": item_id})
        continue
        
    print(f"  SUCCESS: {rel_path} -> {public_url[:75]}...")
    results.append({
        "id": item_id,
        "name": name,
        "category": cat,
        "filename": item['filename'],
        "local_path": "/" + rel_path,
        "public_url": public_url,
        "source": image_url,
        "status": "SUCCESS"
    })
    
    # Gentle rate limiting
    time.sleep(0.4)

with open('scripts/image_sync_report.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, indent=2)

success_count = sum(1 for r in results if r['status'] == 'SUCCESS')
print(f"\n==========================================")
print(f"Complete: {success_count}/{len(inventory)} items successfully processed.")
print(f"==========================================")

