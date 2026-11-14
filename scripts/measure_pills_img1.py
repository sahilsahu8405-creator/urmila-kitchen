from PIL import Image

img1 = Image.open('C:/Users/91977/.gemini/antigravity/brain/be6647cd-1d44-4670-a96b-ca9079b3e180/.user_uploaded/media_1794619716550_9a9518fd.jpg')

# 1. Chaats: check col 0 (x ~ 60) for y from 370 to 415
print("=== CHAATS (Gold coin chaat) ===")
for y in range(370, 415, 2):
    p = img1.getpixel((60, y))
    print(f"y={y}: RGB={p}")

# 2. Mains Row 1: check col 0 (x ~ 60) for y from 520 to 565
print("\n=== MAINS R1 (Spanish rice) ===")
for y in range(520, 565, 2):
    p = img1.getpixel((60, y))
    print(f"y={y}: RGB={p}")

# 3. Mains Row 2: check col 0 (x ~ 80) for y from 625 to 665
print("\n=== MAINS R2 (Pan fried noodles) ===")
for y in range(625, 665, 2):
    p = img1.getpixel((80, y))
    print(f"y={y}: RGB={p}")

