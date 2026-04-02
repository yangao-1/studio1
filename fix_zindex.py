import re

with open('/workspaces/studio1/style.css', 'r', encoding='utf-8') as f:
    css = f.read()

# 1. Tone down cannons and parts scaling in tier-3 and tier-4 to prevent screen blockage
css = css.replace("scale(2) !important; filter: drop-shadow(0 0 20px #ff0000); }", "scale(1.2) !important; filter: drop-shadow(0 0 20px #ff0000); }")
css = css.replace("transform: translateY(-20px) scale(3) !important;", "transform: translateY(-5px) scale(1.4) !important;")

# 2. Add z-index to UI elements so they stay strictly above the lobster
added_zindex = """
/* -------------------------------------------------------------
   UI Z-INDEX FIX: UI Stays Above Animations
------------------------------------------------------------- */
#status-header, #connection-status, #gift-guide {
    position: relative;
    z-index: 1000 !important;
}
#mission-header {
    position: relative;
    z-index: 1000 !important;
}
"""

if "UI Z-INDEX FIX" not in css:
    css += added_zindex

with open('/workspaces/studio1/style.css', 'w', encoding='utf-8') as f:
    f.write(css)
