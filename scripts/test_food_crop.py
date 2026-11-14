from PIL import Image

for slug in ["corn-bunch", "dabeli", "thecha-masala-pav", "thatte-idli"]:
    img = Image.open(f'scripts/crops/starters/{slug}.jpg')
    # Food is roughly top 0 to height-30
    food_only = img.crop((0, 0, img.width, img.height - 30))
    # Make it square by center crop or padding
    w, h = food_only.size
    print(f"{slug}: card size={img.size}, food size={food_only.size}")
    food_only.save(f'scripts/crops/starters/{slug}_food.jpg')

