from PIL import Image

crop = Image.open('scripts/crops/r1c1_corn_bunch.jpg')
print("Crop size:", crop.size)
# Let's inspect the bottom of the card to see where the green label starts
# The green banner has dark green pixels (R < 30, G in 50..100, B < 40)
for y in range(crop.height - 1, 0, -5):
    # sample pixel in center
    p = crop.getpixel((crop.width // 2, y))
    print(f"y={y}: RGB={p}")

