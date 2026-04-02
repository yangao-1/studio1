#!/bin/bash
cat app.js | sed -n '1,175p' > temp_evo.js
cat << 'INNER_EOF' >> temp_evo.js
function triggeredEvolution() {
    systemState.level++;
    
    // 突破逻辑
    systemState.maxEnergy = Math.floor(systemState.maxEnergy * 2.5); // 每级所需的EXP变多
    systemState.energy = 0; // 重置进度条
    
    let tierIdx = systemState.level > 4 ? 4 : systemState.level; 
    let tierInfo = EVOLUTION_TIERS[tierIdx];

    // 全屏突破震撼UI
    let clearOverlay = document.createElement('div');
    clearOverlay.style.cssText = "position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(255,0,255,0.2); z-index:999; display:flex; flex-direction:column; justify-content:center; align-items:center; backdrop-filter:blur(5px); transition:opacity 0.5s;";
    
    let clearTitle = document.createElement('h1');
    clearTitle.innerText = "MISSION CLEAR!!";
    clearTitle.style.cssText = "font-size:4rem; color:#ff00ff; text-shadow:0 0 30px #ffffff; transform:scale(3); opacity:0; transition:all 0.4s cubic-bezier(.17,.89,.32,1.28); margin:0;";
    
    let newInfo = document.createElement('h2');
    newInfo.innerText = ">>> NEXT STAGE: " + tierInfo.name + " <<<";
    newInfo.style.cssText = "font-size:1.5rem; color:#00ffff; text-shadow:0 0 15px #00ffff; margin-top:20px; transform:translateY(50px); opacity:0; transition:all 0.5s ease-out 0.2s;";

    clearOverlay.appendChild(clearTitle);
    clearOverlay.appendChild(newInfo);
    ui_container.appendChild(clearOverlay);

    // 强烈的突破特效与震动
    ui_container.style.borderColor = "#ff00ff";
    ui_container.style.boxShadow = "0 0 150px rgba(255, 0, 255, 0.9)";
    triggerScreenShake();
    
    // 动画延时执行
    setTimeout(() => {
        clearTitle.style.transform = "scale(1)";
        clearTitle.style.opacity = "1";
        newInfo.style.transform = "translateY(0)";
        newInfo.style.opacity = "1";
        
        // 震撼背景闪烁
        ui_container.classList.add('hit-shake');
        setTimeout(() => ui_container.classList.remove('hit-shake'), 400);

        // 其实背后同时在更新龙虾外观
        updateAvatars();
        updateUI();
    }, 50);

    setTimeout(() => {
        ui_container.style.borderColor = "#102e3a";
        ui_container.style.boxShadow = "none";
        
        // 渐隐淡出
        clearOverlay.style.opacity = "0";
        setTimeout(() => {
            if(clearOverlay.parentNode) clearOverlay.remove();
        }, 500);
    }, 2500);
    
    typeWriterLog(`[ 突破 ] === 跨阶段任务部署！当前任务变更: ${tierInfo.mission} ===`, 'term-epic');
}
INNER_EOF
cat app.js | sed -n '204,$p' >> temp_evo.js
mv temp_evo.js app.js
chmod +x replace_evo.sh
./replace_evo.sh
