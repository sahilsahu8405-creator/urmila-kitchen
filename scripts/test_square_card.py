from PIL import Image

# Test padding a card to 600x600 square with cream background
card = Image.open('scripts/crops/starters/corn-bunch.jpg')
# card size is (247, 163)
cw, ch = card.size

# Target square: 600x600
bg_color = (250, 248, 244) # Urmila's warm cream
square = Image.new('RGB', (600, 600), bg_color)

# Scale card to fit 600x600 with some nice margins or full width
scale = min(580 / cw, 580 / ch)
new_w = int(cw * scale)
new_h = int(ch * scale)
card_resized = card.resize((new_w, new_h), Image.Resampling.LANCZOS)

# Paste centered
pos_x = (600 - new_w) // 2
pos_y = (600 - new_h) // 2
square.paste(card_resized, (pos_x, pos_y))
square.save('scripts/crops/test_corn_bunch_square.jpg')
print(f"Pasted card at ({pos_x}, {pos_y}), size {new_w}x{new_h}")

