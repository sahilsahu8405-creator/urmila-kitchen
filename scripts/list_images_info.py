from PIL import Image

for idx in range(1, 8):
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
    print(f"Img {idx} ({files[idx-1]}): {img.size}")

