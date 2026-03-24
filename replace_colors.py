#!/usr/bin/env python3
# Script لاستبدال الألوان القديمة بالألوان الجديدة

with open('/src/app/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# استبدال الألوان
content = content.replace('#0f172a', '#003366')
content = content.replace('#1e293b', '#002244')

with open('/src/app/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print(f"تم الاستبدال بنجاح!")
print(f"تم استبدال جميع اللون #0f172a بـ #003366")
print(f"تم استبدال جميع اللون #1e293b بـ #002244")
