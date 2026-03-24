#!/usr/bin/env python3
import re

# Read the file
with open('/src/app/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace #0f172a with #003366
content = content.replace('#0f172a', '#003366')

# Replace #1e293b with #003366
content = content.replace('#1e293b', '#003366')

# Write back
with open('/src/app/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Colors replaced successfully!")
