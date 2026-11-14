from PIL import Image

# Let's inspect the titles in image 2, 3, 5, 6, 7
for idx in [2, 3, 5, 6, 7]:
    files = [
        'media_1794619716550_9a9518fd.jpg',
        'media_1794619716552_29f6c492.jpg',
        'media_1794619716560_a5e31e4e.jpg',
        'media_1794619716569_9dcef807.jpg',
        'media_1794619716625_e9f6f1ec.jpg',
        'media_1794619716648_4c25f1e2.jpg',
        'media_1794619716666_84576721.jpg'
    ]
    p = f'C:/Users/91977/.gemini/antigravity/brain/be6647cd-1d44-4670-a96b-ca9079b3e180/.user_uploaded/{files[idx-1]}'
    img = Image.open(p)
    # Check top 80 pixels
    top = img.crop((0, 0, img.width, 80))
    top.save(f'scripts/crops/top_{idx}.jpg')
print("Top banners saved for inspection.")

