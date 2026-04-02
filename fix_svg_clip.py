with open('/workspaces/studio1/style.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Add overflow: visible to the cyber-mech SVG so that parts scaling beyond the viewBox don't get clipped into a square
fix_css = """
/* Fix SVG clipping */
#player-entity svg.cyber-mech {
    overflow: visible !important;
}

/* Fix transform origins so scaling happens from center (the lobster's center is roughly 100, 100) */
.tier-part {
    transform-origin: 100px 100px;
}
"""

if "/* Fix SVG clipping */" not in css:
    with open('/workspaces/studio1/style.css', 'a', encoding='utf-8') as f:
        f.write(fix_css)

print("SVG clipping fix applied to CSS.")
