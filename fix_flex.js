const fs = require('fs');
let styleCss = fs.readFileSync('/workspaces/studio1/style.css', 'utf-8');

styleCss = styleCss.replace(/#gift-flylayer\s*\{[^}]+\}/, `#gift-flylayer {
    position: absolute; top: 120px; left: 0;
    width: 100%; pointer-events: none;
    display: flex; flex-direction: column;
    align-items: flex-start; z-index: 100;
}`);

// remove absolute positions from UI elements that are children of obs-screen flexbox
styleCss = styleCss.replace(/#energy-section\s*\{[^}]+\}/, `#energy-section {
    width: 100%; padding: 10px 20px; box-sizing: border-box;
    z-index: 40; flex-shrink: 0; margin-bottom: 5px;
    position: relative; /* Remove absolute */
}`);

styleCss = styleCss.replace(/#terminal-panel\s*\{[^}]+\}/, `#terminal-panel {
    background: rgba(0, 0, 0, 0.85); position: relative; /* Remove absolute */
    width: 100%; height: 22vh; max-height: 200px; min-height: 150px; box-sizing: border-box;
    border-top: 2px solid #33ff33; padding: 10px;
    overflow: hidden; z-index: 50; flex-shrink: 0;
}`);

fs.writeFileSync('/workspaces/studio1/style.css', styleCss);
