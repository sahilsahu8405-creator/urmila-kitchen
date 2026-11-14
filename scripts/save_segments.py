from PIL import Image

# Let's inspect the vertical distribution of img1
img1 = Image.open('C:/Users/91977/.gemini/antigravity/brain/be6647cd-1d44-4670-a96b-ca9079b3e180/.user_uploaded/media_1794619716550_9a9518fd.jpg')
w, h = img1.size

# Let's save 5 vertical segments of img1:
step = h // 5
for i in range(5):
    y1 = i * step
    y2 = (i + 1) * step if i < 4 else h
    img1.crop((0, y1, w, y2)).save(f'scripts/crops/img1_seg_{i+1}.jpg')
print("Saved 5 vertical segments of img1")

