from PIL import Image
import os

img4 = Image.open('C:/Users/91977/.gemini/antigravity/brain/be6647cd-1d44-4670-a96b-ca9079b3e180/.user_uploaded/media_1794619716569_9dcef807.jpg')
w, h = img4.size

# Let's see the rows in img4:
# Total height = 682
# 4 rows:
# Row 0: y approx 5 to 168
# Row 1: y approx 175 to 338
# Row 2: y approx 345 to 508
# Row 3: y approx 515 to 678

# Columns:
# Rows 0-2 have 4 columns:
# c0: 5 to 252
# c1: 258 to 505
# c2: 512 to 759
# c3: 765 to 1015

# Row 3 has 5 columns:
# 1024 / 5 = 204.8
# c0: 5 to 205
# c1: 208 to 408
# c2: 412 to 612
# c3: 615 to 815
# c4: 818 to 1018

starters_img4 = [
    # Row 0
    ("corn-bunch", 5, 5, 252, 168),
    ("cheese-corn-balls", 258, 5, 505, 168),
    ("garlic-bread", 512, 5, 759, 168),
    ("hara-bhara-kebab", 765, 5, 1015, 168),
    
    # Row 1
    ("hara-bhara-paneer-roll", 5, 175, 252, 338),
    ("tart-with-corn-filling", 258, 175, 505, 338),
    ("bruschetta", 512, 175, 759, 338),
    ("nachos-with-salsa-cheese-dip", 765, 175, 1015, 338),
    
    # Row 2
    ("dabeli", 5, 345, 252, 508),
    ("vada-pav", 258, 345, 505, 508),
    ("dabeli-bruschetta", 512, 345, 759, 508),
    ("pav-bhaji-fondue", 765, 345, 1015, 508),
    
    # Row 3 (5 items)
    ("thecha-masala-pav", 5, 515, 205, 678),
    ("mexican-chilli-burger", 208, 515, 408, 678),
    ("paneer-chilli-burger", 412, 515, 612, 678),
    ("dahi-ke-kabab", 615, 515, 815, 678),
    ("thatte-idli", 818, 515, 1018, 678)
]

os.makedirs('scripts/crops/starters', exist_ok=True)
for slug, x1, y1, x2, y2 in starters_img4:
    crop = img4.crop((x1, y1, x2, y2))
    crop.save(f'scripts/crops/starters/{slug}.jpg')

print("All 17 starters cropped from img4.")

