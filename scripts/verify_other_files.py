from PIL import Image

files = [
    'media_1794619716550_9a9518fd.jpg',
    'media_1794619716552_29f6c492.jpg',
    'media_1794619716560_a5e31e4e.jpg',
    'media_1794619716569_9dcef807.jpg',
    'media_1794619716625_e9f6f1ec.jpg',
    'media_1794619716648_4c25f1e2.jpg',
    'media_1794619716666_84576721.jpg'
]

# Let's check the middle and bottom of files 2, 3, 5, 6, 7
for idx in [2, 3, 5, 6, 7]:
    p = f'C:/Users/91977/.gemini/antigravity/brain/be6647cd-1d44-4670-a96b-ca9079b3e180/.user_uploaded/{files[idx-1]}'
    img = Image.open(p)
    # Check bottom-most dish
    bottom = img.crop((0, img.height - 100, img.width, img.height))
    bottom.save(f'scripts/crops/bottom_{idx}.jpg')

print("Saved bottom strips for 2, 3, 5, 6, 7")

