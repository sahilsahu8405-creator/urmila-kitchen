from PIL import Image

img1 = Image.open('C:/Users/91977/.gemini/antigravity/brain/be6647cd-1d44-4670-a96b-ca9079b3e180/.user_uploaded/media_1794619716550_9a9518fd.jpg')
w, h = img1.size

# Let's save slices of 50px each to quickly inspect all rows
import os
os.makedirs('scripts/crops/slices', exist_ok=True)
for i in range(0, h, 40):
    img1.crop((0, i, w, min(h, i + 45))).save(f'scripts/crops/slices/y_{i:03d}.jpg')

print(f"Saved {h//40 + 1} slices.")

