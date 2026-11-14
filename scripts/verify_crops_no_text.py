from PIL import Image, ImageFilter, ImageEnhance
import os

img4 = Image.open('C:/Users/91977/.gemini/antigravity/brain/be6647cd-1d44-4670-a96b-ca9079b3e180/.user_uploaded/media_1794619716569_9dcef807.jpg')
img1 = Image.open('C:/Users/91977/.gemini/antigravity/brain/be6647cd-1d44-4670-a96b-ca9079b3e180/.user_uploaded/media_1794619716550_9a9518fd.jpg')

os.makedirs('scripts/crops/verify_no_text', exist_ok=True)

# Test a few samples across categories
samples = [
    ("corn-bunch", img4.crop((8, 6, 250, 132))),
    ("vada-pav", img4.crop((260, 346, 503, 472))),
    ("thatte-idli", img4.crop((820, 516, 1015, 642))),
    ("gold-coin-chaat", img1.crop((9, 322, 111, 391))),
    ("tamatar-chaat", img1.crop((570, 322, 680, 391))),
    ("spanish-rice", img1.crop((8, 472, 126, 533))),
    ("pav-bhaji", img1.crop((514, 472, 636, 533))),
    ("pan-fried-noodles", img1.crop((7, 575, 167, 642))),
    ("muglai-paratha", img1.crop((853, 575, 1016, 642)))
]

for name, im in samples:
    # Scale width to 600, maintain aspect ratio
    w, h = im.size
    scale = 600 / w
    new_h = int(h * scale)
    up = im.resize((600, new_h), Image.Resampling.LANCZOS)
    # Apply crisp unsharp mask and contrast
    sharp = up.filter(ImageFilter.UnsharpMask(radius=2, percent=145, threshold=2))
    sharp = ImageEnhance.Sharpness(sharp).enhance(1.25)
    sharp = ImageEnhance.Contrast(sharp).enhance(1.05)
    sharp.save(f'scripts/crops/verify_no_text/{name}.jpg', quality=95)
    print(f"{name}: original {w}x{h} -> scaled 600x{new_h}")

print("Saved samples for verification.")

