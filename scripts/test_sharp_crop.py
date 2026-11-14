from PIL import Image, ImageFilter, ImageEnhance
import os

os.makedirs('scripts/crops/sharp_test', exist_ok=True)

# Test on Corn Bunch from img4 (Image 4)
img4 = Image.open('C:/Users/91977/.gemini/antigravity/brain/be6647cd-1d44-4670-a96b-ca9079b3e180/.user_uploaded/media_1794619716569_9dcef807.jpg')

# In img4, Corn Bunch is at (5, 5, 252, 168)
# The label is at the bottom (y from ~134 to 168)
# The food photography is from y=6 to y=133
food_crop = img4.crop((8, 8, 250, 134))
print("Food crop raw size:", food_crop.size) # ~ 242 x 126

# To make it a square without distortion or blurring:
# 1. Take a square crop of the food (e.g. center width 126 to match height, OR fill square by intelligent framing)
# If width=242 and height=126, center-square is (58, 0, 184, 126) -> 126x126 of pure close-up food!
# Or if we want the full width of the plate:
# Let's see what happens with:
# Option A: Center-square crop (focus on the food)
w, h = food_crop.size
min_dim = min(w, h)
left = (w - min_dim) // 2
square_crop = food_crop.crop((left, 0, left + min_dim, h)) # 126x126 square

# Scale up with Lanczos to 500x500
up_a = square_crop.resize((500, 500), Image.Resampling.LANCZOS)
# Apply gentle unsharp mask to restore crisp edges and eliminate any blur
sharp_a = up_a.filter(ImageFilter.UnsharpMask(radius=2, percent=130, threshold=2))
# Slightly enhance color and contrast for appetizing food look
enh_a = ImageEnhance.Contrast(sharp_a).enhance(1.08)
enh_a = ImageEnhance.Color(enh_a).enhance(1.05)
enh_a.save('scripts/crops/sharp_test/corn_bunch_closeup.jpg', quality=95)

# Option B: Keep aspect ratio of food photo, but crop only 2-3px into text pill so name is 100% gone
print("Saved Option A.")

