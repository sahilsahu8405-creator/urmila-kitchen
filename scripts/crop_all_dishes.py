from PIL import Image
import os

img1 = Image.open('C:/Users/91977/.gemini/antigravity/brain/be6647cd-1d44-4670-a96b-ca9079b3e180/.user_uploaded/media_1794619716550_9a9518fd.jpg')
img4 = Image.open('C:/Users/91977/.gemini/antigravity/brain/be6647cd-1d44-4670-a96b-ca9079b3e180/.user_uploaded/media_1794619716569_9dcef807.jpg')

os.makedirs('scripts/crops/test_all', exist_ok=True)

# 1. Starters from img4 (Food photo only, excluding text banner at bottom)
starters_data = [
    # (slug, x1, y1, x2, y2)
    ("corn-bunch", 5, 5, 252, 136),
    ("cheese-corn-balls", 258, 5, 505, 136),
    ("garlic-bread", 512, 5, 759, 136),
    ("hara-bhara-kebab", 765, 5, 1015, 136),
    
    ("hara-bhara-paneer-roll", 5, 175, 252, 306),
    ("tart-with-corn-filling", 258, 175, 505, 306),
    ("bruschetta", 512, 175, 759, 306),
    ("nachos-with-salsa-cheese-dip", 765, 175, 1015, 306),
    
    ("dabeli", 5, 345, 252, 476),
    ("vada-pav", 258, 345, 505, 476),
    ("dabeli-bruschetta", 512, 345, 759, 476),
    ("pav-bhaji-fondue", 765, 345, 1015, 476),
    
    ("thecha-masala-pav", 5, 515, 205, 646),
    ("mexican-chilli-burger", 208, 515, 408, 646),
    ("paneer-chilli-burger", 412, 515, 612, 646),
    ("dahi-ke-kabab", 615, 515, 815, 646),
    ("thatte-idli", 818, 515, 1018, 646)
]

for slug, x1, y1, x2, y2 in starters_data:
    crop = img4.crop((x1, y1, x2, y2))
    crop.save(f'scripts/crops/test_all/starters_{slug}.jpg')

# 2. Chaats from img1 (y from 322 to 395 for food photo, label is 395 to 418)
chaats_cols = [
    ("gold-coin-chaat", 9, 112),
    ("pineapple-bhel", 114, 226),
    ("tiranga-bhel", 228, 340),
    ("hara-bhara-bird-s-nest-chaat", 342, 454),
    ("mexican-khakhra-chaat", 456, 567),
    ("tamatar-chaat", 569, 681),
    ("chinese-bhel", 683, 795),
    ("batata-chaat", 797, 909),
    ("matar-chaat", 911, 1015)
]

for slug, x1, x2 in chaats_cols:
    crop = img1.crop((x1, 322, x2, 395))
    crop.save(f'scripts/crops/test_all/chaats_{slug}.jpg')

# 3. Mains Row 1 from img1 (y from 472 to 542 for food photo)
mains1_cols = [
    ("spanish-rice-with-tandoori-sauce", 7, 127),
    ("paneer-begum-bahar", 129, 255),
    ("paneer-tikka-roll", 257, 383),
    ("veg-frankie", 387, 511),
    ("pav-bhaji", 513, 637),
    ("paneer-fried-noodles", 641, 767),
    ("chili-garlic-paneer-burger", 769, 895),
    ("chola-kulcha-platter", 900, 1017)
]

for slug, x1, x2 in mains1_cols:
    crop = img1.crop((x1, 472, x2, 542))
    crop.save(f'scripts/crops/test_all/mains_{slug}.jpg')

# 4. Mains Row 2 from img1 (y from 575 to 645 for food photo)
mains2_cols = [
    ("pan-fried-noodles", 6, 168),
    ("french-casserole", 172, 338),
    ("stacked-enchiladas", 342, 508),
    ("american-chop-suey", 512, 678),
    ("chinese-rice-with-fried-noodles", 682, 848),
    ("muglai-paratha-with-lehsun-chutney", 852, 1017)
]

for slug, x1, x2 in mains2_cols:
    crop = img1.crop((x1, 575, x2, 645))
    crop.save(f'scripts/crops/test_all/mains_{slug}.jpg')

print("All 40 crops generated in scripts/crops/test_all/")

