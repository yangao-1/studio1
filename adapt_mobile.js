const fs = require('fs');

let styleCss = fs.readFileSync('/workspaces/studio1/style.css', 'utf-8');

// 1. Update body and obs-screen for full viewport coverage
styleCss = styleCss.replace(/body\s*\{[^}]+\}/, `body {
    background-color: #0b0f19;
    color: #4df8eb;
    margin: 0;
    padding: 0;
    font-family: 'Share Tech Mono', monospace, Arial, sans-serif;
    display: flex;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    flex-direction: row;
}`);

styleCss = styleCss.replace(/#obs-screen\s*\{[^}]+\}/, `#obs-screen {
    width: 100%;
    height: 100%;
    max-width: 540px; /* Limit max width for tablets/desktop so it stays 9:16-ish */
    background: #000;
    position: relative;
    border: none;
    box-shadow: none;
    margin: 0 auto;
    overflow: hidden;
}`);

// 2. Make visual center height responsive
styleCss = styleCss.replace(/#visual-center\s*\{[\s\S]*?transition:[^\}]+\}/, `#visual-center {
    flex: 1; min-height: 40vh; max-height: 55vh; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    border-top: 1px solid #1e3a4e; border-bottom: 1px solid #1e3a4e; 
    margin: 0; width: 100%;
    position: relative;
    overflow: hidden;
    transition: background 2s, box-shadow 2s;
}`);

// 3. Make terminal responsive
styleCss = styleCss.replace(/#terminal-panel\s*\{[^}]+\}/, `#terminal-panel {
    position: absolute; bottom: 0; background: rgba(0, 0, 0, 0.85);
    width: 100%; height: 22vh; max-height: 200px; min-height: 150px; box-sizing: border-box;
    border-top: 2px solid #33ff33; padding: 10px;
    overflow: hidden; z-index: 50;
}`);

// 4. Adjust energy section position dynamically
styleCss = styleCss.replace(/#energy-section\s*\{[^}]+\}/, `#energy-section {
    position: absolute; bottom: calc(22vh + 15px);
    width: 100%; padding: 0 20px; box-sizing: border-box;
    z-index: 40;
}`);

// 5. Add Mobile Media Query to stack the layout (hide debug panel or move it)
styleCss += `\n
/* ===================
   手机端/小屏幕 自适应响应式布局
   =================== */
@media (max-width: 768px) {
    body {
        flex-direction: column;
    }
    #obs-screen {
        width: 100vw;
        height: 100vh;
        max-width: none;
    }
    #debug-panel {
        display: none; /* 手机观看时直接隐藏侧边栏，保证画面核心 */
    }
    #player-entity {
        width: 60vw; height: 60vw;
        max-width: 250px; max-height: 250px;
    }
    .energy-popup {
        font-size: 1.5rem;
    }
    .energy-popup.epic-popup {
        font-size: 2.5rem;
    }
    #gift-guide {
        transform: scale(0.85);
        transform-origin: top left;
    }
}
`;

fs.writeFileSync('/workspaces/studio1/style.css', styleCss);
console.log("Mobile responsive css applied!");
