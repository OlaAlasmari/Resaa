#!/bin/bash
# تحديث الألوان في ملف App.tsx

python3 << 'EOF'
import re

# قراءة الملف
with open('/src/app/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# إجراء الاستبدالات
content = content.replace('#0f172a', '#003366')
content = content.replace('#1e293b', '#002244')

# حفظ النتيجة
with open('/src/app/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ تم تحديث الألوان بنجاح!")
EOF
