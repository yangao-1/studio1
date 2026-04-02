#!/bin/bash
cat app.js | sed -n '1,41p' > temp_app.js
cat << 'INNER_EOF' >> temp_app.js
// 发射攻击/施法特效 - 改造：增加导弹弹幕、爆炸特效、目标掉血飘字
function shootAttack(amount, giftName) {
    let effectClass = EVOLUTION_TIERS[systemState.level]?.effect || 'projectile';
    
    // 弹幕射击数量（根据伤害决定打击感）
    let barrageCount = 1;
    if(amount > 10) barrageCount = 3;
    if(amount > 50) barrageCount = 5;
    if(amount > 200) barrageCount = 1; // 超大核弹只有1发

    for(let i=0; i<barrageCount; i++) {
        setTimeout(() => {
            let hLeft = 15 + Math.random() * 30; // 左侧附近 15~45%
            let hTop = 60 + Math.random() * 20;  // 下方 60~80%
            
            // 选定火力模型
            let p = document.createElement('div');
            p.className = 'projectile';
            if (amount > 10) p.className = 'projectile missile-barrage';
            if (amount > 50) p.className = 'projectile-big';
            if (amount > 200) p.className = 'projectile nuke-beam';
            
            p.style.left = hLeft + '%';
            p.style.top = hTop + '%';
            p.style.transform = `rotate(-35deg)`;
            ui_fx_layer.appendChild(p);

            // 本体震动动画 (如果是第一发)
            if(i === 0) {
                ui_player.classList.add('player-attack');
                setTimeout(() => ui_player.classList.remove('player-attack'), 200);
            }

            // 强制重绘后赋予目标坐标 (让它飞过去)
            void p.offsetWidth;
            
            // 给一点随机散布，让导弹打在目标的不同部位
            let scatterX = Math.random() * 60 - 30; 
            let scatterY = Math.random() * 40 - 20;
            
            let targetX = ui_target.offsetLeft + (ui_target.offsetWidth/2) + scatterX;
            let targetY = ui_target.offsetTop + (ui_target.offsetHeight/2) + scatterY;

            p.style.left = targetX + 'px';
            p.style.top = targetY + 'px';

            // 到达目标后的爆炸逻辑 (取决于飞行时间)
            let flyTime = (amount > 200) ? 300 : 400; 
            setTimeout(() => {
                if(p.parentNode) p.remove();
                
                // 1. 生成爆炸光环
                let explosion = document.createElement('div');
                explosion.className = (amount > 50) ? 'explosion-ring mega-blast' : 'explosion-ring';
                explosion.style.left = targetX + 'px';
                explosion.style.top = targetY + 'px';
                ui_fx_layer.appendChild(explosion);
                setTimeout(() => { if(explosion.parentNode) explosion.remove(); }, 600);

                // 2. 目标受伤颤抖特效
                ui_target.classList.add('hit-shake');
                setTimeout(() => ui_target.classList.remove('hit-shake'), 200);

                // 3. 屏幕剧烈震动
                if(amount > 50 && i === 0) triggerScreenShake();
                
                // 4. 生成掉血数字 (直接从目标身上飘出)
                if(i === 0 || amount > 10) { // 避免全是文字
                    let dmgPopup = document.createElement('div');
                    let dmgType = 'dmg-normal';
                    let text = `-${amount}`;
                    if(amount > 50) { dmgType = 'dmg-crit'; text = `CRIT -${amount}!`; }
                    if(amount > 200) { dmgType = 'dmg-nuke'; text = `EXTERMINATE!!`; }
                    
                    dmgPopup.className = `dmg-popup-target ${dmgType}`;
                    dmgPopup.innerText = text;
                    dmgPopup.style.left = (targetX - 20 + Math.random()*20) + 'px';
                    dmgPopup.style.top = targetY + 'px';
                    ui_fx_layer.appendChild(dmgPopup);
                    setTimeout(() => { if(dmgPopup.parentNode) dmgPopup.remove(); }, 1500);
                }

            }, flyTime);
        }, i * (amount > 50 ? 50 : 100)); // 多发射击间隔
    }
}
INNER_EOF
cat app.js | sed -n '104,$p' >> temp_app.js
mv temp_app.js app.js
chmod +x replace_shoot.sh
./replace_shoot.sh
