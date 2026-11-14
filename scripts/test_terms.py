import requests

terms = ['Vada pav', 'Dabeli', 'Pav bhaji', 'Quesadilla', 'Idli', 'Samosa chaat', 'Nachos', 'Bhel puri', 'Bruschetta', 'Apple crumble', 'Gratin', 'Moussaka', 'Mojito', 'Frappe']
for t in terms:
    title = t.replace(' ', '_')
    url = f'https://en.wikipedia.org/w/api.php?action=query&titles={title}&prop=pageimages&format=json&pithumbsize=600'
    headers = {'User-Agent': 'UrmilaKitchen/1.0'}
    r = requests.get(url, headers=headers).json()
    pages = r.get('query', {}).get('pages', {})
    thumb = None
    for pid, p in pages.items():
        if 'thumbnail' in p:
            thumb = p['thumbnail']['source']
    print(f"{t:15s} -> {thumb[:60] if thumb else 'NO DIRECT PAGE'}")

