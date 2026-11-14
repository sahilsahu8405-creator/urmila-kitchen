from PIL import Image
import numpy as np

img1 = Image.open('C:/Users/91977/.gemini/antigravity/brain/be6647cd-1d44-4670-a96b-ca9079b3e180/.user_uploaded/media_1794619716550_9a9518fd.jpg')
arr = np.array(img1)

# The background is cream/off-white (R > 230, G > 220, B > 200)
# Dishes have high color/saturation/contrast
# Let's compute average brightness or non-cream pixels per row
is_bg = (arr[:, :, 0] > 230) & (arr[:, :, 1] > 225) & (arr[:, :, 2] > 215)
non_bg_fraction = 1.0 - np.mean(is_bg, axis=1)

# Find rows where non_bg_fraction has peaks (dishes) vs troughs (gaps between rows)
for y in range(0, img1.height, 10):
    val = non_bg_fraction[y:y+10].mean()
    bar = '#' * int(val * 40)
    print(f"y={y:3d}-{y+10:3d}: {val:.2f} {bar}")

