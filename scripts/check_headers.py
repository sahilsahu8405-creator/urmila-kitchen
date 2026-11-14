from PIL import Image
import os

files = [
    ('img1', 'C:/Users/91977/.gemini/antigravity/brain/be6647cd-1d44-4670-a96b-ca9079b3e180/.user_uploaded/media_1794619716550_9a9518fd.jpg'),
    ('img2', 'C:/Users/91977/.gemini/antigravity/brain/be6647cd-1d44-4670-a96b-ca9079b3e180/.user_uploaded/media_1794619716552_29f6c492.jpg'),
    ('img3', 'C:/Users/91977/.gemini/antigravity/brain/be6647cd-1d44-4670-a96b-ca9079b3e180/.user_uploaded/media_1794619716560_a5e31e4e.jpg'),
    ('img4', 'C:/Users/91977/.gemini/antigravity/brain/be6647cd-1d44-4670-a96b-ca9079b3e180/.user_uploaded/media_1794619716569_9dcef807.jpg'),
    ('img5', 'C:/Users/91977/.gemini/antigravity/brain/be6647cd-1d44-4670-a96b-ca9079b3e180/.user_uploaded/media_1794619716625_e9f6f1ec.jpg'),
    ('img6', 'C:/Users/91977/.gemini/antigravity/brain/be6647cd-1d44-4670-a96b-ca9079b3e180/.user_uploaded/media_1794619716648_4c25f1e2.jpg'),
    ('img7', 'C:/Users/91977/.gemini/antigravity/brain/be6647cd-1d44-4670-a96b-ca9079b3e180/.user_uploaded/media_1794619716666_84576721.jpg')
]

# Let's save header strips of each image to inspect
os.makedirs('scripts/crops', exist_ok=True)
for name, path in files:
    img = Image.open(path)
    # top header (first 100 pixels)
    header = img.crop((0, 0, img.width, 100))
    header.save(f'scripts/crops/{name}_header.jpg')
print("Headers saved to scripts/crops")

