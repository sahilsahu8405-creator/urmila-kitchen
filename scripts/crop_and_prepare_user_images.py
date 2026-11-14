from PIL import Image
import os
import json

img1 = Image.open('C:/Users/91977/.gemini/antigravity/brain/be6647cd-1d44-4670-a96b-ca9079b3e180/.user_uploaded/media_1794619716550_9a9518fd.jpg')
img4 = Image.open('C:/Users/91977/.gemini/antigravity/brain/be6647cd-1d44-4670-a96b-ca9079b3e180/.user_uploaded/media_1794619716569_9dcef807.jpg')

# Output directory for processed square webp files
OUTPUT_DIR = 'public/images/menu'
BG_COLOR = (251, 249, 245) # Warm cream matching Urmila's Kitchen background

def create_square_dish_image(card_crop, target_size=600):
    cw, ch = card_crop.size
    # Fit into target square with subtle margins
    max_dim = target_size - 30
    scale = min(max_dim / cw, max_dim / ch)
    new_w = int(cw * scale)
    new_h = int(ch * scale)
    resized = card_crop.resize((new_w, new_h), Image.Resampling.LANCZOS)
    
    square = Image.new('RGB', (target_size, target_size), BG_COLOR)
    pos_x = (target_size - new_w) // 2
    pos_y = (target_size - new_h) // 2
    square.paste(resized, (pos_x, pos_y))
    return square

# 1. STARTERS (17 items from img4)
# img4 is 1024x682.
# Rows:
# Row 0 (4 items): y=5 to 168
# Row 1 (4 items): y=175 to 338
# Row 2 (4 items): y=345 to 508
# Row 3 (5 items): y=515 to 678
starters_items = [
    # (slug, filename, x1, y1, x2, y2)
    ("corn-bunch", "corn-bunch.webp", 5, 5, 252, 168),
    ("cheese-corn-balls", "cheese-corn-balls.webp", 258, 5, 505, 168),
    ("garlic-bread", "garlic-bread.webp", 512, 5, 759, 168),
    ("hara-bhara-kebab", "hara-bhara-kebab.webp", 765, 5, 1015, 168),
    
    ("hara-bhara-paneer-roll", "hara-bhara-paneer-roll.webp", 5, 175, 252, 338),
    ("tart-with-corn-filling", "tart-with-corn-filling.webp", 258, 175, 505, 338),
    ("bruschetta", "bruschetta.webp", 512, 175, 759, 338),
    ("nachos-with-salsa-cheese-dip", "nachos-with-salsa-cheese-dip.webp", 765, 175, 1015, 338),
    
    ("dabeli", "dabeli.webp", 5, 345, 252, 508),
    ("vada-pav", "vada-pav.webp", 258, 345, 505, 508),
    ("dabeli-bruschetta", "dabeli-bruschetta.webp", 512, 345, 759, 508),
    ("pav-bhaji-fondue", "pav-bhaji-fondue.webp", 765, 345, 1015, 508),
    
    ("thecha-masala-pav", "thecha-masala-pav.webp", 5, 515, 205, 678),
    ("mexican-chilli-burger", "mexican-chilli-burger.webp", 208, 515, 408, 678),
    ("paneer-chilli-burger", "paneer-chilli-burger.webp", 412, 515, 612, 678),
    ("dahi-ke-kabab", "dahi-ke-kabab.webp", 615, 515, 815, 678),
    ("thatte-idli", "thatte-idli.webp", 818, 515, 1018, 678)
]

# 2. CHAATS (9 items from img1)
# y=320 to 418 (includes food + dish name pill)
chaats_items = [
    ("gold-coin-chaat", "gold-coin-chaat.webp", 8, 320, 112, 418),
    ("pineapple-bhel", "pineapple-bhel.webp", 114, 320, 226, 418),
    ("tiranga-bhel", "tiranga-bhel.webp", 228, 320, 340, 418),
    ("hara-bhara-bird-s-nest-chaat", "hara-bhara-bird-s-nest-chaat.webp", 342, 320, 454, 418),
    ("mexican-khakhra-chaat", "mexican-khakhra-chaat.webp", 456, 320, 567, 418),
    ("tamatar-chaat", "tamatar-chaat.webp", 569, 320, 681, 418),
    ("chinese-bhel", "chinese-bhel.webp", 683, 320, 795, 418),
    ("batata-chaat", "batata-chaat.webp", 797, 320, 909, 418),
    ("matar-chaat", "matar-chaat.webp", 911, 320, 1015, 418)
]

# 3. MAINS ROW 1 (8 items from img1)
# y=470 to 565 (includes food + dish name pill)
mains_row1_items = [
    ("spanish-rice-with-tandoori-sauce", "spanish-rice-with-tandoori-sauce.webp", 7, 470, 127, 565),
    ("paneer-begum-bahar", "paneer-begum-bahar.webp", 129, 470, 255, 565),
    ("paneer-tikka-roll", "paneer-tikka-roll.webp", 257, 470, 383, 565),
    ("veg-frankie", "veg-frankie.webp", 387, 470, 511, 565),
    ("pav-bhaji", "pav-bhaji.webp", 513, 470, 637, 565),
    ("paneer-fried-noodles", "paneer-fried-noodles.webp", 641, 470, 767, 565),
    ("chili-garlic-paneer-burger", "chili-garlic-paneer-burger.webp", 769, 470, 895, 565),
    ("chola-kulcha-platter", "chola-kulcha-platter.webp", 900, 470, 1017, 565)
]

# 4. MAINS ROW 2 (6 items from img1)
# y=575 to 668 (includes food + dish name pill)
mains_row2_items = [
    ("pan-fried-noodles", "pan-fried-noodles.webp", 6, 575, 168, 668),
    ("french-casserole", "french-casserole.webp", 172, 575, 338, 668),
    ("stacked-enchiladas", "stacked-enchiladas.webp", 342, 575, 508, 668),
    ("american-chop-suey", "american-chop-suey.webp", 512, 575, 678, 668),
    ("chinese-rice-with-fried-noodles", "chinese-rice-with-fried-noodles.webp", 682, 575, 848, 668),
    ("muglai-paratha-with-lehsun-chutney", "muglai-paratha-with-lehsun-chutney.webp", 852, 575, 1017, 668)
]

# 5. FONDUE: Pav bhaji fondue platter
# We can use the Pav Bhaji Fondue card from Starters or Fondue!
fondue_items = [
    ("pav-bhaji-fondue-platter", "pav-bhaji-fondue-platter.webp", 765, 345, 1015, 508)
]

all_crops = []

# Process Starters
for slug, filename, x1, y1, x2, y2 in starters_items:
    card = img4.crop((x1, y1, x2, y2))
    sq = create_square_dish_image(card)
    path = os.path.join(OUTPUT_DIR, 'starters', filename)
    sq.save(path, format='WEBP', quality=90)
    all_crops.append(('starters', slug, filename, path))

# Process Chaats
for slug, filename, x1, y1, x2, y2 in chaats_items:
    card = img1.crop((x1, y1, x2, y2))
    sq = create_square_dish_image(card)
    path = os.path.join(OUTPUT_DIR, 'chaats', filename)
    sq.save(path, format='WEBP', quality=90)
    all_crops.append(('chaats', slug, filename, path))

# Process Mains R1
for slug, filename, x1, y1, x2, y2 in mains_row1_items:
    card = img1.crop((x1, y1, x2, y2))
    sq = create_square_dish_image(card)
    path = os.path.join(OUTPUT_DIR, 'mains', filename)
    sq.save(path, format='WEBP', quality=90)
    all_crops.append(('mains', slug, filename, path))

# Process Mains R2
for slug, filename, x1, y1, x2, y2 in mains_row2_items:
    card = img1.crop((x1, y1, x2, y2))
    sq = create_square_dish_image(card)
    path = os.path.join(OUTPUT_DIR, 'mains', filename)
    sq.save(path, format='WEBP', quality=90)
    all_crops.append(('mains', slug, filename, path))

# Process Fondue
for slug, filename, x1, y1, x2, y2 in fondue_items:
    card = img4.crop((x1, y1, x2, y2))
    sq = create_square_dish_image(card)
    path = os.path.join(OUTPUT_DIR, 'fondue', filename)
    sq.save(path, format='WEBP', quality=90)
    all_crops.append(('fondue', slug, filename, path))

print(f"Successfully processed and generated {len(all_crops)} user dish images!")
with open('scripts/user_cropped_list.json', 'w', encoding='utf-8') as f:
    json.dump(all_crops, f, indent=2)

