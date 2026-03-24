#!/usr/bin/env python3
# Script to replace color #0f172a with #003366 in App.tsx

with open('/src/app/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace all occurrences
content = content.replace('#0f172a', '#003366')
content = content.replace('#1e293b', '#002244')  # Also replace hover state

with open('/src/app/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Color replacement complete!")
print("Replaced #0f172a with #003366")
print("Replaced #1e293b with #002244")
