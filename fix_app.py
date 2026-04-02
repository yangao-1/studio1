with open("/workspaces/studio1/app.js", "r", encoding="utf-8") as f:
    lines = f.readlines()

out = []
seen_saved_state = False
skip_mode = False

for line in lines:
    if line.startswith("const savedState = localStorage.getItem('lobsterState');"):
        if seen_saved_state:
            skip_mode = True # Skip this block
        seen_saved_state = True
        
    if skip_mode and line.strip() == "} catch(e) { console.error(\"读取存档失败\"); }":
        skip_mode = False
        continue # Skip the catch as well
        
    if skip_mode and line.strip() == "}":
        skip_mode = False
        continue

    if not skip_mode:
        out.append(line)

with open("/workspaces/studio1/app.js", "w", encoding="utf-8") as f:
    f.writelines(out)
