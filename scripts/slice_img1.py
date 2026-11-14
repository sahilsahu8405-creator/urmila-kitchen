from PIL import Image

img1 = Image.open('C:/Users/91977/.gemini/antigravity/brain/be6647cd-1d44-4670-a96b-ca9079b3e180/.user_uploaded/media_1794619716550_9a9518fd.jpg')
w, h = img1.size
print(f"img1 dimensions: {w}x{h}")

# In img1:
# Top header "Starters": y ~ 0 to 45
# Starters Row 1: y ~ 45 to 195 (8 dishes)
# Starters Row 2: y ~ 200 to 350 (9 dishes)
# Header "Chaats": y ~ 355 to 400
# Chaats Row 1: y ~ 405 to 550 (9 dishes)
# Wait, let's check the height! Total height is 682!
# Let's crop strips to find exact Y boundaries of:
# - Starters Row 1
# - Starters Row 2
# - Chaats Header & Row 1
# - Mains Header & Row 1 & Row 2

strips = [
    ('starters_r1', 40, 180),
    ('starters_r2', 185, 330),
    ('chaats_r1', 400, 540),
    ('mains_r1', 580, 680)
]
for name, y1, y2 in strips:
    img1.crop((0, y1, w, min(h, y2))).save(f'scripts/crops/img1_{name}.jpg')

print("Strips saved.")

