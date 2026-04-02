const fs = require('fs');

// 1. Edit app.js
let appJs = fs.readFileSync('/workspaces/studio1/app.js', 'utf-8');

const targetReplacement = `
    let targetSvg = '';
    if(currentTier === 1) targetSvg = '<svg viewBox="0 0 100 100" class="enemy-svg"><rect x="25" y="25" width="50" height="50" fill="none" stroke="#ff3333" stroke-width="4" transform="rotate(45 50 50)"/><circle cx="50" cy="50" r="15" fill="#ff3333" class="anim-core"/></svg>';
    else if(currentTier === 2) targetSvg = '<svg viewBox="0 0 100 100" class="enemy-svg"><polygon points="50,10 90,90 10,90" fill="none" stroke="#ff6600" stroke-width="6"/><circle cx="50" cy="65" r="10" fill="#ff6600" class="reactor-core"/></svg>';
    else if(currentTier === 3) targetSvg = '<svg viewBox="0 0 100 100" class="enemy-svg"><polygon points="50,5 95,50 50,95 5,50" fill="none" stroke="#ff00ff" stroke-width="4"/><circle cx="50" cy="50" r="20" fill="none" stroke="#ff00ff" stroke-width="4" stroke-dasharray="10,5" class="spin-fast"/><circle cx="50" cy="50" r="10" fill="#ff00ff" class="anim-core"/></svg>';
    else targetSvg = '<svg viewBox="0 0 100 100" class="enemy-svg anim-body"><circle cx="50" cy="50" r="45" fill="none" stroke="#ff0000" stroke-width="2" class="spin-slow" stroke-dasharray="2,6"/><circle cx="50" cy="50" r="30" fill="none" stroke="#ff0000" stroke-width="6" class="spin-reverse-slow" stroke-dasharray="20,10"/><path d="M 0 50 Q 50 0 100 50 Q 50 100 0 50" fill="none" stroke="#ff0000" stroke-width="4"/><circle cx="50" cy="50" r="15" fill="#ff0000" class="reactor-core"/></svg>';

    ui_target.innerHTML = \`<div class="enemy-wrapper">\${targetSvg}<div class="target-name">\${config.target}</div></div>\`;
`;

appJs = appJs.replace(/ui_target\.innerHTML = [^;]+;/, targetReplacement);
fs.writeFileSync('/workspaces/studio1/app.js', appJs);

// 2. Edit style.css
let styleCss = fs.readFileSync('/workspaces/studio1/style.css', 'utf-8');

const cssReplacement = `
.enemy-wrapper {
    display: flex; flex-direction: column; align-items: center;
}
.enemy-svg {
    width: 140px; height: 140px;
    filter: drop-shadow(0 0 20px currentColor);
    margin-bottom: 10px;
    animation: float-idle 4s ease-in-out infinite;
}
.target-name {
    color: #ff3333; font-size: 14px; font-weight: bold; letter-spacing: 2px;
    text-shadow: 0 0 5px #ff0000; background: rgba(0,0,0,0.6); padding: 2px 10px; border: 1px solid #ff3333; border-radius: 4px;
}
.cyber-target-container { display: none; }
`;

styleCss = styleCss.replace(/\.cyber-target-container \{[\s\S]*?@keyframes target-glitch \{[\s\S]*?\}/, cssReplacement);
fs.writeFileSync('/workspaces/studio1/style.css', styleCss);
console.log("Replaced red box with SVG Enemy Entities.");
