with open('src/lib/initialData.ts', encoding='utf-8') as f:
    text = f.read()
import re
valid = re.findall(r'image_url:\s*'/images/menu/[^']+'', text)
nulls = re.findall(r'image_url:\s*null', text)
print('Valid images:', len(valid))
print('Null images:', len(nulls))
