from PIL import Image
import numpy as np

img4 = Image.open('C:/Users/91977/.gemini/antigravity/brain/be6647cd-1d44-4670-a96b-ca9079b3e180/.user_uploaded/media_1794619716569_9dcef807.jpg')
w, h = img4.size

# Save 4 test crops from img4 to see exact coordinates of row 1, 2, 3, 4
# img4 has 4 rows
# Let's crop row 1 col 1, col 2, col 3, col 4
# Width is 1024, Height is 682
# Let's test grid coordinates:
# Row height ~ 682 / 4 = 170 px
# Col width ~ 1024 / 4 = 256 px

test_crops = {
    'r1c1_corn_bunch': img4.crop((3, 3, 250, 165)),
    'r1c2_cheese_corn_balls': img4.crop((255, 3, 505, 165)),
    'r1c3_garlic_bread': img4.crop((510, 3, 760, 165)),
    'r1c4_hara_bhara_kebab': img4.crop((765, 3, 1020, 165)),
}

for name, crop in test_crops.items():
    crop.save(f'scripts/crops/{name}.jpg')
print("Saved row 1 test crops")

