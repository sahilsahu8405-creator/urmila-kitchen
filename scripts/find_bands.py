from PIL import Image

img1 = Image.open('C:/Users/91977/.gemini/antigravity/brain/be6647cd-1d44-4670-a96b-ca9079b3e180/.user_uploaded/media_1794619716550_9a9518fd.jpg')
w, h = img1.size

# In img1, the headers have dark green color in the middle
# Let's check center pixel RGB across all Y:
header_ys = []
for y in range(0, h, 2):
    p = img1.getpixel((w // 2, y))
    # dark green header: R < 35, G in 50..100, B < 40
    if p[0] < 35 and 45 <= p[1] <= 100 and p[2] < 45:
        header_ys.append((y, p))

# Cluster the Ys into distinct header bands
bands = []
current_band = []
for y, p in header_ys:
    if not current_band:
        current_band.append(y)
    elif y - current_band[-1] <= 4:
        current_band.append(y)
    else:
        if len(current_band) > 5:
            bands.append((min(current_band), max(current_band)))
        current_band = [y]
if len(current_band) > 5:
    bands.append((min(current_band), max(current_band)))

print("Detected green header bands:", bands)

