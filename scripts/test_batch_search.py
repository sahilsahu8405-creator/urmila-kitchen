import requests
import time

headers = {
    'User-Agent': 'UrmilaKitchenBot/1.0 (https://urmilakitchen.com; culinary@urmilakitchen.com) Python-requests/2.31'
}

queries = [
    'pav bhaji', 'paneer tikka', 'cheese fondue', 'quesadilla',
    'garlic bread', 'lasagne', 'mojito mint', 'coffee frappe',
    'idli sambar', 'nachos salsa cheese', 'bruschetta tomato', 'apple crumble',
    'chole bhature', 'bhel puri', 'dahi vada', 'vegetable au gratin',
    'moussaka', 'chocolate fondue'
]

for q in queries:
    params = {
        'action': 'query',
        'generator': 'search',
        'gsrsearch': f'{q} food -audio -ogg',
        'gsrnamespace': 6,
        'gsrlimit': 1,
        'prop': 'imageinfo',
        'iiprop': 'url',
        'iiurlwidth': 800,
        'format': 'json'
    }
    try:
        r = requests.get('https://commons.wikimedia.org/w/api.php', params=params, headers=headers, timeout=10).json()
        pages = r.get('query', {}).get('pages', {})
        thumb = None
        title = None
        for pid, p in pages.items():
            thumb = p.get('imageinfo', [{}])[0].get('thumburl')
            title = p.get('title')
        print(f"{q:24s} -> {title} | {thumb[:50] if thumb else 'NONE'}")
    except Exception as e:
        print(f"{q:24s} -> ERROR: {e}")
    time.sleep(0.3)

