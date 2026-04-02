const fs = require('fs');

let appJs = fs.readFileSync('/workspaces/studio1/app.js', 'utf-8');

const targetReplacement = `
    // 更新目标靶子
    let currentTargetHtml = '';
    if(currentTier === 1) currentTargetHtml = '<svg viewBox="0 0 100 100" class="enemy-svg"><rect x="25" y="25" width="50" height="50" fill="none" stroke="#ff3333" stroke-width="4" transform="rotate(45 50 50)"/><circle cx="50" cy="50" r="15" fill="#ff3333" class="anim-core"/></svg>';
    else if(currentTier === 2) currentTargetHtml = '<svg viewBox="0 0 100 100" class="enemy-svg"><polygon points="50,10 90,90 10,90" fill="none" stroke="#ff6600" stroke-width="8"/><circle cx="50" cy="65" r="12" fill="#ff6600" class="reactor-core"/></svg>';
    else if(currentTier === 3) currentTargetHtml = '<svg viewBox="0 0 100 100" class="enemy-svg"><polygon points="50,5 95,50 50,95 5,50" fill="none" stroke="#ff00ff" stroke-width="6"/><circle cx="50" cy="50" r="25" fill="none" stroke="#ff00ff" stroke-width="4" stroke-dasharray="15,5" class="spin-fast"/><circle cx="50" cy="50" r="15" fill="#ff00ff" class="anim-core"/></svg>';
    else currentTargetHtml = '<svg viewBox="0 0 100 100" class="enemy-svg anim-body"><circle cx="50" cy="50" r="48" fill="none" stroke="#ff0000" stroke-width="3" class="spin-slow" stroke-dasharray="2,6"/><circle cx="50" cy="50" r="35" fill="none" stroke="#ff0000" stroke-width="6" class="spin-reverse-slow" stroke-dasharray="20,10"/><path d="M 0 50 Q 50 0 100 50 Q 50 100 0 50" fill="none" stroke="#ff0000" stroke-width="4"/><circle cx="50" cy="50" r="18" fill="#ff0000" class="reactor-core"/></svg>';

    ui_target.innerHTML = \`<div class="enemy-wrapper">\${currentTargetHtml}<div class="target-name">\${config.target}</div></div>\`;
`;

appJs = appJs.replace(/\/\/\s*更新目标靶子[\s]*\n/g, targetReplacement);
fs.writeFileSync('/workspaces/studio1/app.js', appJs);

console.log("Fixed target rendering.");
