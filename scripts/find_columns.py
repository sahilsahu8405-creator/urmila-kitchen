from PIL import Image
import numpy as np
import json

img1 = Image.open('C:/Users/91977/.gemini/antigravity/brain/be6647cd-1d44-4670-a96b-ca9079b3e180/.user_uploaded/media_1794619716550_9a9518fd.jpg')
arr = np.array(img1)

# Cream background check
is_bg = (arr[:, :, 0] > 230) & (arr[:, :, 1] > 225) & (arr[:, :, 2] > 215)

def find_columns_in_row(y_start, y_end, num_expected):
    # Mean of non-bg across the row vertical span
    row_bg = is_bg[y_start:y_end, :]
    non_bg_cols = 1.0 - np.mean(row_bg, axis=0)
    
    # Let's inspect where non_bg_cols drops to near 0 (the gaps between cards)
    # Cards have rounded corners or gaps
    w = len(non_bg_cols)
    # Estimate card width
    step = w / num_expected
    cards = []
    for i in range(num_expected):
        approx_x1 = int(i * step)
        approx_x2 = int((i + 1) * step)
        # Refine x1 and x2: find non-bg span within window
        window = non_bg_cols[approx_x1:approx_x2]
        # find where window > 0.05
        active = np.where(window > 0.05)[0]
        if len(active) > 0:
            x1 = approx_x1 + active[0]
            x2 = approx_x1 + active[-1]
        else:
            x1 = approx_x1
            x2 = approx_x2
        cards.append((x1, x2))
    return cards

# Test Row 3: Chaats (9 dishes)
chaats_cards = find_columns_in_row(325, 410, 9)
print("Chaats columns (9):", chaats_cards)

# Test Row 4: Mains R1 (8 dishes)
mains1_cards = find_columns_in_row(475, 560, 8)
print("Mains R1 columns (8):", mains1_cards)

# Test Row 5: Mains R2 (6 dishes)
mains2_cards = find_columns_in_row(580, 660, 6)
print("Mains R2 columns (6):", mains2_cards)

