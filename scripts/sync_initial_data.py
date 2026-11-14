import json
import re

with open('scripts/image_sync_report.json', 'r', encoding='utf-8') as f:
    report = json.load(f)

with open('src/lib/initialData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

count = 0
for r in report:
    name = r['name']
    local_path = r['local_path']
    pattern = rf"(name:\s*'{re.escape(name)}'[^}}]*?image_url:\s*)(null|'[^']*')"
    match = re.search(pattern, content)
    if match:
        content = content[:match.start()] + f"{match.group(1)}'{local_path}'" + content[match.end():]
        count += 1
    else:
        # try relaxed matching for curly quotes
        n2 = name.replace("’", "'")
        pattern2 = rf"(name:\s*['\"]{re.escape(n2)}['\"][^}}]*?image_url:\s*)(null|'[^']*')"
        match2 = re.search(pattern2, content)
        if match2:
            content = content[:match2.start()] + f"{match2.group(1)}'{local_path}'" + content[match2.end():]
            count += 1

with open('src/lib/initialData.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Updated {count} / {len(report)} items in initialData.ts")
