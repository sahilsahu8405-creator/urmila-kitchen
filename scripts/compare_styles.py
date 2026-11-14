from PIL import Image, ImageFilter, ImageEnhance, ImageOps
import os

img4 = Image.open('C:/Users/91977/.gemini/antigravity/brain/be6647cd-1d44-4670-a96b-ca9079b3e180/.user_uploaded/media_1794619716569_9dcef807.jpg')
img1 = Image.open('C:/Users/91977/.gemini/antigravity/brain/be6647cd-1d44-4670-a96b-ca9079b3e180/.user_uploaded/media_1794619716550_9a9518fd.jpg')

os.makedirs('scripts/crops/compare_styles', exist_ok=True)

# Test 1: Corn bunch from img4 (245 x 127)
corn = img4.crop((8, 8, 250, 132))

# Test 2: Dabeli from img4 (245 x 127)
dabeli = img4.crop((8, 348, 250, 472))

# Test 3: Gold coin chaat from img1 (104 x 70)
gold_coin = img1.crop((9, 322, 112, 392))

# Test 4: Spanish rice from img1 (120 x 62)
spanish_rice = img1.crop((7, 472, 127, 534))

samples = [('corn_bunch', corn), ('dabeli', dabeli), ('gold_coin', gold_coin), ('spanish_rice', spanish_rice)]

for name, food in samples:
    fw, fh = food.size
    
    # --- Style 1: Direct full food image (keeping original photo aspect ratio ~16:10) ---
    # Scaled to width 600 with Lanczos + high quality sharpening
    target_w = 600
    target_h = int(fh * (600 / fw))
    direct = food.resize((target_w, target_h), Image.Resampling.LANCZOS)
    direct = direct.filter(ImageFilter.UnsharpMask(radius=2, percent=140, threshold=2))
    direct = ImageEnhance.Sharpness(direct).enhance(1.2)
    direct = ImageEnhance.Contrast(direct).enhance(1.05)
    direct.save(f'scripts/crops/compare_styles/{name}_full_aspect.jpg', quality=95)
    
    # --- Style 2: Center-square crop (macro close-up) ---
    min_d = min(fw, fh)
    cx = (fw - min_d) // 2
    cy = (fh - min_d) // 2
    sq_crop = food.crop((cx, cy, cx + min_d, cy + min_d))
    sq_up = sq_crop.resize((500, 500), Image.Resampling.LANCZOS)
    sq_up = sq_up.filter(ImageFilter.UnsharpMask(radius=2, percent=140, threshold=2))
    sq_up = ImageEnhance.Sharpness(sq_up).enhance(1.2)
    sq_up = ImageEnhance.Contrast(sq_up).enhance(1.05)
    sq_up.save(f'scripts/crops/compare_styles/{name}_center_square.jpg', quality=95)

print("Saved Style 1 (full food photo) and Style 2 (center square) for 4 dishes.")
