import json
import os
import requests
from PIL import Image, ImageFilter, ImageEnhance

img4 = Image.open('C:/Users/91977/.gemini/antigravity/brain/be6647cd-1d44-4670-a96b-ca9079b3e180/.user_uploaded/media_1794619716569_9dcef807.jpg')
img1 = Image.open('C:/Users/91977/.gemini/antigravity/brain/be6647cd-1d44-4670-a96b-ca9079b3e180/.user_uploaded/media_1794619716550_9a9518fd.jpg')

OUTPUT_DIR = 'public/images/menu'

def process_food_photo(crop_img, target_width=600):
    w, h = crop_img.size
    scale = target_width / w
    target_h = int(h * scale)
    
    # 1. High-fidelity Lanczos resampling
    up = crop_img.resize((target_width, target_h), Image.Resampling.LANCZOS)
    
    # 2. Detail unsharp mask to remove any blur and pop culinary textures
    sharp = up.filter(ImageFilter.UnsharpMask(radius=2, percent=145, threshold=2))
    
    # 3. Fine sharpness enhancement
    sharp = ImageEnhance.Sharpness(sharp).enhance(1.25)
    
    # 4. Color & contrast tuning for vibrant, appetizing presentation
    sharp = ImageEnhance.Contrast(sharp).enhance(1.06)
    sharp = ImageEnhance.Color(sharp).enhance(1.04)
    
    return sharp

# 1. STARTERS (17 items from img4) - Strictly above pill (which starts at y=135, 305, 475, 645)
starters_data = [
    # Row 0 (y=6 to 132)
    ("corn-bunch", "corn-bunch.webp", 8, 6, 250, 132),
    ("cheese-corn-balls", "cheese-corn-balls.webp", 260, 6, 503, 132),
    ("garlic-bread", "garlic-bread.webp", 514, 6, 757, 132),
    ("hara-bhara-kebab", "hara-bhara-kebab.webp", 768, 6, 1012, 132),
    
    # Row 1 (y=176 to 302)
    ("hara-bhara-paneer-roll", "hara-bhara-paneer-roll.webp", 8, 176, 250, 302),
    ("tart-with-corn-filling", "tart-with-corn-filling.webp", 260, 176, 503, 302),
    ("bruschetta", "bruschetta.webp", 514, 176, 757, 302),
    ("nachos-with-salsa-cheese-dip", "nachos-with-salsa-cheese-dip.webp", 768, 176, 1012, 302),
    
    # Row 2 (y=346 to 472)
    ("dabeli", "dabeli.webp", 8, 346, 250, 472),
    ("vada-pav", "vada-pav.webp", 260, 346, 503, 472),
    ("dabeli-bruschetta", "dabeli-bruschetta.webp", 514, 346, 757, 472),
    ("pav-bhaji-fondue", "pav-bhaji-fondue.webp", 768, 346, 1012, 472),
    
    # Row 3 (y=516 to 642)
    ("thecha-masala-pav", "thecha-masala-pav.webp", 8, 516, 202, 642),
    ("mexican-chilli-burger", "mexican-chilli-burger.webp", 210, 516, 405, 642),
    ("paneer-chilli-burger", "paneer-chilli-burger.webp", 414, 516, 610, 642),
    ("dahi-ke-kabab", "dahi-ke-kabab.webp", 618, 516, 812, 642),
    ("thatte-idli", "thatte-idli.webp", 820, 516, 1015, 642)
]

# 2. CHAATS (9 items from img1) - Row y=322 to 391
chaats_data = [
    ("gold-coin-chaat", "gold-coin-chaat.webp", 9, 322, 111, 391),
    ("pineapple-bhel", "pineapple-bhel.webp", 115, 322, 225, 391),
    ("tiranga-bhel", "tiranga-bhel.webp", 229, 322, 339, 391),
    ("hara-bhara-bird-s-nest-chaat", "hara-bhara-bird-s-nest-chaat.webp", 343, 322, 453, 391),
    ("mexican-khakhra-chaat", "mexican-khakhra-chaat.webp", 457, 322, 566, 391),
    ("tamatar-chaat", "tamatar-chaat.webp", 570, 322, 680, 391),
    ("chinese-bhel", "chinese-bhel.webp", 684, 322, 794, 391),
    ("batata-chaat", "batata-chaat.webp", 798, 322, 908, 391),
    ("matar-chaat", "matar-chaat.webp", 912, 322, 1014, 391)
]

# 3. MAINS ROW 1 (8 items from img1) - Row y=472 to 533
mains_r1_data = [
    ("spanish-rice-with-tandoori-sauce", "spanish-rice-with-tandoori-sauce.webp", 8, 472, 126, 533),
    ("paneer-begum-bahar", "paneer-begum-bahar.webp", 130, 472, 254, 533),
    ("paneer-tikka-roll", "paneer-tikka-roll.webp", 258, 472, 382, 533),
    ("veg-frankie", "veg-frankie.webp", 388, 472, 510, 533),
    ("pav-bhaji", "pav-bhaji.webp", 514, 472, 636, 533),
    ("paneer-fried-noodles", "paneer-fried-noodles.webp", 642, 472, 766, 533),
    ("chili-garlic-paneer-burger", "chili-garlic-paneer-burger.webp", 770, 472, 894, 533),
    ("chola-kulcha-platter", "chola-kulcha-platter.webp", 901, 472, 1016, 533)
]

# 4. MAINS ROW 2 (6 items from img1) - Row y=575 to 642
mains_r2_data = [
    ("pan-fried-noodles", "pan-fried-noodles.webp", 7, 575, 167, 642),
    ("french-casserole", "french-casserole.webp", 173, 575, 337, 642),
    ("stacked-enchiladas", "stacked-enchiladas.webp", 343, 575, 507, 642),
    ("american-chop-suey", "american-chop-suey.webp", 513, 575, 677, 642),
    ("chinese-rice-with-fried-noodles", "chinese-rice-with-fried-noodles.webp", 683, 575, 847, 642),
    ("muglai-paratha-with-lehsun-chutney", "muglai-paratha-with-lehsun-chutney.webp", 853, 575, 1016, 642)
]

# 5. FONDUE (Pav bhaji fondue platter from img4)
fondue_data = [
    ("pav-bhaji-fondue-platter", "pav-bhaji-fondue-platter.webp", 768, 346, 1012, 472)
]

all_crops = []

# Process Starters
for slug, filename, x1, y1, x2, y2 in starters_data:
    raw = img4.crop((x1, y1, x2, y2))
    proc = process_food_photo(raw)
    out_path = os.path.join(OUTPUT_DIR, 'starters', filename)
    proc.save(out_path, format='WEBP', quality=95)
    all_crops.append(('starters', slug, filename, out_path))

# Process Chaats
for slug, filename, x1, y1, x2, y2 in chaats_data:
    raw = img1.crop((x1, y1, x2, y2))
    proc = process_food_photo(raw)
    out_path = os.path.join(OUTPUT_DIR, 'chaats', filename)
    proc.save(out_path, format='WEBP', quality=95)
    all_crops.append(('chaats', slug, filename, out_path))

# Process Mains R1
for slug, filename, x1, y1, x2, y2 in mains_r1_data:
    raw = img1.crop((x1, y1, x2, y2))
    proc = process_food_photo(raw)
    out_path = os.path.join(OUTPUT_DIR, 'mains', filename)
    proc.save(out_path, format='WEBP', quality=95)
    all_crops.append(('mains', slug, filename, out_path))

# Process Mains R2
for slug, filename, x1, y1, x2, y2 in mains_r2_data:
    raw = img1.crop((x1, y1, x2, y2))
    proc = process_food_photo(raw)
    out_path = os.path.join(OUTPUT_DIR, 'mains', filename)
    proc.save(out_path, format='WEBP', quality=95)
    all_crops.append(('mains', slug, filename, out_path))

# Process Fondue
for slug, filename, x1, y1, x2, y2 in fondue_data:
    raw = img4.crop((x1, y1, x2, y2))
    proc = process_food_photo(raw)
    out_path = os.path.join(OUTPUT_DIR, 'fondue', filename)
    proc.save(out_path, format='WEBP', quality=95)
    all_crops.append(('fondue', slug, filename, out_path))

print(f"Generated {len(all_crops)} pure food photographs without any text labels!")
with open('scripts/clean_crops_list.json', 'w', encoding='utf-8') as f:
    json.dump(all_crops, f, indent=2)

