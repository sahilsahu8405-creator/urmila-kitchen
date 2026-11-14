from PIL import Image

img1 = Image.open('C:/Users/91977/.gemini/antigravity/brain/be6647cd-1d44-4670-a96b-ca9079b3e180/.user_uploaded/media_1794619716550_9a9518fd.jpg')
w, h = img1.size

# Chaats is located in the middle:
# Let's find where the green header "Chaats" is located.
# Let's save slices around y = 280 to 440
for y in range(260, 420, 20):
    img1.crop((0, y, w, y+25)).save(f'scripts/crops/scan_y_{y}.jpg')

print("Scan slices saved.")

