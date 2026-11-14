import json
import re

with open('scripts/user_cropped_list.json', 'r', encoding='utf-8') as f:
    user_crops = json.load(f)

# user_crops is list of (cat, slug, filename, path)
crop_by_slug = {c[1]: c for c in user_crops}

with open('src/lib/initialData.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if "image_url:" in line:
        # Check if line corresponds to one of the user crops
        matched = False
        for cat, slug, filename, path in user_crops:
            # check if filename is in line or dish name matches
            if f"/{cat}/{filename}" in line or f"{slug}.webp" in line:
                matched = True
                break
        
        # If not in user crops, set image_url to null
        if not matched:
            line = re.sub(r"image_url:\s*'[^']*'", "image_url: null", line)
    new_lines.append(line)

with open('src/lib/initialData.ts', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("Updated initialData.ts with user dish images and nulls for removed ones.")

