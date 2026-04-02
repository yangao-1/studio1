import re

# 1. Update app.js
with open('/workspaces/studio1/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Fix simulating a gift to take sender name and handle type
new_simulate = """window.simulateGift = function (giftName, mockValue, userName = "星际游侠", isDanmu = false) {
    let power = isDanmu ? Math.floor(Math.random() * 2 + 1) : Math.floor(Math.random() * mockValue) + mockValue;
    
    // 触发能量变化
    changeEnergy(power, giftName);
    
    // 发送带有名字的特效
    shootAttack(power, giftName, userName);
}"""
js = re.sub(r'window\.simulateGift = function \([\s\S]*?shootAttack\(power, giftName\);\n\}', new_simulate, js)

# Fix shootAttack signature and element construction
old_shoot = r"function shootAttack\(amount, giftName\) \{([\s\S]*?)helper\.innerText = Array\.isArray\(helperStr\) \? helperStr\.join\(''\) : helperStr;"
new_shoot = """function shootAttack(amount, giftName, senderName = "未知指令") {
    let effectClass = EVOLUTION_TIERS[systemState.level]?.effect || 'projectile';
    
    // 动态生成帮手 (根据礼物大小)
    let helperStr = '⚔️'; 
    if(amount <= 10) helperStr = ['✨', '🔥', '⚡'][Math.floor(Math.random()*3)];
    if(amount > 10 && amount <= 200) helperStr = ['🚀', '🛸', '🛰️'][Math.floor(Math.random()*3)];
    if(amount > 200) helperStr = ['💥', '☄️', '💫'][Math.floor(Math.random()*3)];

    let helper = document.createElement('div');
    helper.className = 'helper-entity';
    
    // ------ 优化点：加入观众真实姓名标牌 ------
    let innerHtml = `
        <div class="sender-label">${senderName}</div>
        <div class="helper-icon">${Array.isArray(helperStr) ? helperStr.join('') : helperStr}</div>
    `;
    helper.innerHTML = innerHtml;"""
js = re.sub(old_shoot, new_shoot, js)

# Add hit particle generation
old_hit = r"ui_target\.classList\.add\('hit-flash'\);\n\s*setTimeout\(\(\) => ui_target\.classList\.remove\('hit-flash'\), 150\);"

new_hit = """ui_target.classList.add('hit-flash');
            setTimeout(() => ui_target.classList.remove('hit-flash'), 150);
            
            // ------ 优化点：在目标位置产生击中火花 ------
            let sparkCount = amount > 50 ? 5 : 2;
            for(let i=0; i<sparkCount; i++) {
                let spark = document.createElement('div');
                spark.className = 'hit-spark';
                spark.style.left = (ui_target.offsetLeft + ui_target.offsetWidth/2) + 'px';
                spark.style.top = (ui_target.offsetTop + ui_target.offsetHeight/2) + 'px';
                let angle = Math.random() * Math.PI * 2;
                let vel = 30 + Math.random() * 50;
                spark.style.setProperty('--vx', Math.cos(angle)*vel + 'px');
                spark.style.setProperty('--vy', Math.sin(angle)*vel + 'px');
                ui_fx_layer.appendChild(spark);
                
                // 让火花随机颜色
                let colors = ['#00ffff', '#ff00ff', '#ffcc00', '#ffffff'];
                spark.style.background = colors[Math.floor(Math.random()*colors.length)];
                
                // 动画开始
                setTimeout(() => spark.classList.add('spark-fly'), 10);
                setTimeout(() => { if(spark.parentNode) spark.remove() }, 400);
            }"""
js = js.replace(old_hit, new_hit)

# Replace WS onmessage
old_ws = r"try \{[\s\S]*?\} catch\(e\) \{\s*console\.error\(\"解析弹幕包错误\", e\);\s*\}"

new_ws = """try {
            let data = JSON.parse(event.data);
            let action = data.action || data.Type;
            let sender = data.sender || (data.Data && data.Data.User ? data.Data.User.Nickname : '匿名指挥官');
            
            if(action === 'danmu' || action === 1) {
                // 弹幕触发小威力
                if(Math.random() > 0.5) window.simulateGift('弹幕火力', 2, sender, true);
            }
            
            if(action === 'gift' || action === 5) {
                let giftName = data.giftName || (data.Data && data.Data.GiftName) || '神秘物资';
                let count = data.count || (data.Data && data.Data.GiftCount) || 1;
                let price = data.price || (data.Data && data.Data.GiftDiamondCount) || 0; 
                
                typeWriterLog(`[ 支援 ] [${sender}] 授权了 ${giftName} x${count}`);
                
                // ------ 修复：根据价值直接调用 simulateGift 并附带名字 ------
                if (price < 10) window.simulateGift(giftName, 10, sender); 
                else if (price < 3000) window.simulateGift(giftName, 50 * count, sender); 
                else window.simulateGift(giftName, 500 * count, sender); 
            }
        } catch(e) {
            console.error("解析弹幕包错误", e);
        }"""
js = re.sub(old_ws, new_ws, js)

with open('/workspaces/studio1/app.js', 'w', encoding='utf-8') as f:
    f.write(js)

# 2. Update style.css
with open('/workspaces/studio1/style.css', 'r', encoding='utf-8') as f:
    css = f.read()

added_css = """
/* ============================================================
   优化视觉效果：真实姓名标识 & 激光弹道 & 溅射火花 
   ============================================================ */

/* 观众姓名跟随飞船/标识 */
.sender-label {
    position: absolute;
    top: -24px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 11px;
    color: #fff;
    background: rgba(0, 150, 255, 0.4);
    border: 1px solid #00ffff;
    border-radius: 4px;
    padding: 1px 6px;
    white-space: nowrap;
    text-shadow: 0 0 5px #00ffff;
    box-shadow: 0 0 8px rgba(0, 255, 255, 0.6);
    pointer-events: none;
    font-weight: bold;
    z-index: 100;
}

/* 把原本普通的子弹换成更科幻的弹道 (覆盖原来的 .projectile) */
.projectile {
    width: 30px; height: 3px;
    background: linear-gradient(90deg, transparent, #00ffff, #ffffff);
    border-radius: 5px;
    box-shadow: 0 0 10px #00ffff, 0 0 20px #00ffff;
    transition: left 0.25s linear, top 0.25s linear;
}
.projectile-big {
    width: 80px; height: 8px;
    background: linear-gradient(90deg, transparent, #ff00ff, #ffffff);
    border-radius: 20px;
    box-shadow: 0 0 20px #ff00ff, 0 0 40px #ff00ff;
    transition: left 0.25s ease-in, top 0.25s ease-in;
}

/* 打击到靶子部位的物理火花溅射 */
.hit-spark {
    position: absolute;
    width: 6px; height: 6px;
    background: #ffcc00;
    border-radius: 50%;
    box-shadow: 0 0 10px currentColor;
    pointer-events: none;
    z-index: 99;
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
    transition: transform 0.4s cubic-bezier(0.1, 0.8, 0.3, 1), opacity 0.4s ease-out;
}
.hit-spark.spark-fly {
    transform: translate(calc(-50% + var(--vx)), calc(-50% + var(--vy))) scale(0.1);
    opacity: 0;
}
"""

if ".sender-label" not in css:
    with open('/workspaces/studio1/style.css', 'a', encoding='utf-8') as f:
        f.write(added_css)

print("Visuals and Real-time Names optimizations applied!")
