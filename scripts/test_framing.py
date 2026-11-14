from PIL import Image, ImageFilter, ImageEnhance
import os

img4 = Image.open('C:/Users/91977/.gemini/antigravity/brain/be6647cd-1d44-4670-a96b-ca9079b3e180/.user_uploaded/media_1794619716569_9dcef807.jpg')
img1 = Image.open('C:/Users/91977/.gemini/antigravity/brain/be6647cd-1d44-4670-a96b-ca9079b3e180/.user_uploaded/media_1794619716550_9a9518fd.jpg')

os.makedirs('scripts/crops/framing_test', exist_ok=True)

test_dishes = [
    ('corn_bunch', img4.crop((10, 10, 248, 130))),
    ('dabeli', img4.crop((10, 350, 248, 470))),
    ('pav_bhaji_fondue', img4.crop((770, 350, 1010, 470))),
    ('gold_coin_chaat', img1.crop((11, 324, 110, 390))),
    ('spanish_rice', img1.crop((9, 474, 125, 532))),
    ('pav_bhaji', img1.crop((515, 474, 635, 532))),
]

for name, food in test_dishes:
    fw, fh = food.size
    
    # -------------------------------------------------------------
    # Method 1: Macro Center-Square Crop (Food fills 100% of the square)
    # -------------------------------------------------------------
    min_d = min(fw, fh)
    cx = (fw - min_d) // 2
    cy = (fh - min_d) // 2
    sq1 = food.crop((cx, cy, cx + min_d, cy + min_d))
    sq1_up = sq1.resize((500, 500), Image.Resampling.LANCZOS)
    sq1_sharp = sq1_up.filter(ImageFilter.UnsharpMask(radius=2, percent=140, threshold=2))
    sq1_sharp = ImageEnhance.Sharpness(sq1_sharp).enhance(1.2)
    sq1_sharp.save(f'scripts/crops/framing_test/{name}_m1_macro_square.jpg', quality=95)
    
    # -------------------------------------------------------------
    # Method 2: Ambient Blur Background + Full Plate (No cut-off, fills 100% square)
    # -------------------------------------------------------------
    # Background: zoomed and heavily blurred food
    bg = food.resize((500, 500), Image.Resampling.BILINEAR)
    bg = bg.filter(ImageFilter.GaussianBlur(radius=25))
    # Dim background slightly for contrast
    bg = ImageEnhance.Brightness(bg).enhance(0.85)
    
    # Foreground: full plate, sharp and uncropped
    scale = 480 / fw
    fg_w = int(fw * scale)
    fg_h = int(fh * scale)
    fg = food.resize((fg_w, fg_h), Image.Resampling.LANCZOS)
    fg = fg.filter(ImageFilter.UnsharpMask(radius=2, percent=140, threshold=2))
    fg = ImageEnhance.Sharpness(fg).enhance(1.2)
    
    pos_x = (500 - fg_w) // 2
    pos_y = (500 - fg_h) // 2
    bg.paste(fg, (pos_x, pos_y))
    bg.save(f'scripts/crops/framing_test/{name}_m2_ambient_square.jpg', quality=95)
    
    # -------------------------------------------------------------
    # Method 3: Clean 4:3 / 16:10 Direct Crop (The pure photo itself)
    # -------------------------------------------------------------
    # Scale width to 600, keep natural aspect ratio of the food photo
    scale3 = 600 / fw
    m3_h = int(fh * scale3)
    m3 = food.resize((600, m3_h), Image.Resampling.LANCZOS)
    m3 = m3.filter(ImageFilter.UnsharpMask(radius=2, percent=140, threshold=2))
    m3 = ImageEnhance.Sharpness(m3).enhance(1.2)
    m3.save(f'scripts/crops/framing_test/{name}_m3_natural_aspect.jpg', quality=95)

print("Saved Method 1, 2, and 3 for comparison.")
