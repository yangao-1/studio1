const fs = require('fs');

// 1. Clean app.js
let appJs = fs.readFileSync('/workspaces/studio1/app.js', 'utf-8');

// Remove dust text
appJs = appJs.replace(/dust\.innerText = Math\.random\(\) > 0\.5 \? '1' : '0';/g, '');

// Reduce idle log frequency
appJs = appJs.replace(/if\(Math\.random\(\) < 0\.4\)/g, 'if(Math.random() < 0.05)');

// Remove +1 破解 floating text to reduce clutter completely
appJs = appJs.replace(/let idlePopup = document\.createElement\('div'\);[\s\S]*?setTimeout\(\(\) => \{ if\(idlePopup\.parentNode\) idlePopup\.remove\(\); \}, 800\);/g, '');

fs.writeFileSync('/workspaces/studio1/app.js', appJs);

// 2. Clean style.css
let styleCss = fs.readFileSync('/workspaces/studio1/style.css', 'utf-8');

// Update ambient dust to be small glowing dots instead of fonts
styleCss = styleCss.replace(/\.ambient-dust \{[\s\S]*?\}/, `.ambient-dust {
    position: absolute; 
    width: 3px; height: 3px;
    background: rgba(77, 248, 235, 0.5);
    box-shadow: 0 0 8px #00ffff;
    border-radius: 50%;
    pointer-events: none; z-index: 2;
    animation: dust-float 6s linear forwards; 
}`);

// If there's extra text shadow on dust, we replaced the whole block.
// Wait, regex might fail if not matched perfectly, let's use string replace for CSS

fs.writeFileSync('/workspaces/studio1/style.css', styleCss);
console.log("Cleaned up clutter!");
