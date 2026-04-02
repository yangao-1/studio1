import re

with open('/workspaces/studio1/app.js', 'r', encoding='utf-8') as f:
    c = f.read()

# Fix the duplicate catch blocks caused by bad regex
fixed = re.sub(r'\} catch\(e\) \{\s*console\.error\("解析弹幕包错误", e\);\s*\}( \{\s*console\.error\("解析弹幕包错误", e\);\s*\})+', r'} catch(e) {\n            console.error("解析弹幕包错误", e);\n        }', c)

with open('/workspaces/studio1/app.js', 'w', encoding='utf-8') as f:
    f.write(fixed)

