import json
import requests
import time

inv = json.load(open('scripts/sb_inventory.json', encoding='utf-8'))

headers = {'User-Agent': 'UrmilaKitchen/1.0 (culinary@urmilakitchen.com)'}

def search_wikimedia(query):
    try:
        url = 'https://commons.wikimedia.org/w/api.php'
        params = {
            'action': 'query',
            'list': 'search',
            'srsearch': f'{query} food -file:audio -file:ogg',
            'srnamespace': 6,
            'format': 'json',
            'srlimit': 5
        }
        r = requests.get(url, params=params, headers=headers, timeout=8).json()
        search_results = r.get('query', {}).get('search', [])
        if not search_results:
            return None
        
        # Get thumburl for first valid image
        for item in search_results:
            title = item['title']
            if any(ext in title.lower() for ext in ['.jpg', '.jpeg', '.png', '.webp']):
                info_params = {
                    'action': 'query',
                    'titles': title,
                    'prop': 'imageinfo',
                    'iiprop': 'url',
                    'iiurlwidth': 800,
                    'format': 'json'
                }
                ir = requests.get(url, params=info_params, headers=headers, timeout=8).json()
                pages = ir.get('query', {}).get('pages', {})
                for p_id, p_val in pages.items():
                    infos = p_val.get('imageinfo', [])
                    if infos and 'thumburl' in infos[0]:
                        return infos[0]['thumburl']
    except Exception as e:
        pass
    return None

print("Testing first 10 items with search_wikimedia:")
for it in inv[:10]:
    name = it['name']
    url = search_wikimedia(name)
    print(f"[{it['cat_slug']}] {name} -> {url[:60] if url else 'NOT FOUND'}")
    time.sleep(0.5)

