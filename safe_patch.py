import re
with open('/workspaces/studio1/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# 1. replace simulateGift safely
new_simulate = """window.simulateGift = function (giftName, mockValue, userName = "星际游侠", isDanmu = false) {
    let power = isDanmu ? Math.floor(Math.random() * 2 + 1) : Math.floor(Math.random() * mockValue) + mockValue;
    changeEnergy(power, giftName);
    shootAttack(power, giftName, userName);
}"""
js = re.sub(r'window\.simulateGift = function \([\s\S]*?shootAttack\(power, giftName\);\n\}', new_simulate, js)

# 2. replace shootAttack safely
old_shoot = r"function shootAttack\(amount, giftName\) \{([\s\S]*?)helper\.innerText = Array\.isArray\(helperStr\) \? helperStr\.join\(''\) : helperStr;"
new_shoot = """function shootAttack(amount, giftName, senderName = "未知指令") {
    let effectClass = EVOLUTION_TIERS[systemState.level]?.effect || 'projectile';
    
    let helperStr = '⚔️'; 
    if(amount <= 10) helperStr = ['✨', '🔥', '⚡'][Math.floor(Math.random()*3)];
    if(amount > 10 && amount <= 200) helperStr = ['🚀', '🛸', '🛰️'][Math.floor(Math.random()*3)];
    if(amount > 200) helperStr = ['💥', '☄️', '💫'][Math.floor(Math.random()*3)];

    let helper = document.createElement('div');
    helper.className = 'helper-entity';
    
    // ------ 核心修改：生成带有姓名的标牌 ------
    let innerHtml = `
        <div class="sender-label">${senderName}</div>
        <div class="helper-icon">${Array.isArray(helperStr) ? helperStr.join('') : helperStr}</div>
    `;
    helper.innerHTML = innerHtml;"""
js = re.sub(old_shoot, new_shoot, js)

# 3. Add hit spark logic
old_hit = r"ui_target\.classList\.add\('hit-flash'\);\n\s*setTimeout\(\(\) => ui_target\.classList\.remove\('hit-flash'\), 150\);"
new_hit = """ui_target.classList.add('hit-flash');
            setTimeout(() => ui_target.classList.remove('hit-flash'), 150);
            
            // 生成溅射火花特效
            let sparkCount = amount > 50 ? 6 : 3;
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
                let colors = ['#00ffff', '#ff00ff', '#ffcc00', '#ffffff'];
                spark.style.background = colors[Math.floor(Math.random()*colors.length)];
                setTimeout(() => spark.classList.add('spark-fly'), 10);
                setTimeout(() => { if(spark.parentNode) spark.remove() }, 400);
            }"""
js = js.replace(old_hit, new_hit)

# 4. Replace WS onmessage block safely using exact replace around event.data
old_ws_block = """try {
            let data = JSON.parse(event.data);
            
            // 多端兼容器解析 (支持 BarrageGrab / 抖音弹幕抓取器 等格式)
            let action = data.action || data.Type; // 1是弹幕，5是礼物
            
            // 解析发送者 (不同软件字段不同)
            let sender = data.sender || (data.Data && data.Data.User ? data.Data.User.Nickname : '匿名');
            
            // 1. 弹幕处理 (Type 1 或 danmu)
            if(action === 'danmu' || action === 1) {
                if(Math.random() > 0.5) triggerGift('energy'); // 不然满屏幕都是特效会卡，限制频率
            }
            
            // 2. 礼物处理 (Type 5 或 gift)
            if(action === 'gift' || action === 5) {
                let giftName = data.giftName || (data.Data && data.Data.GiftName) || '神秘物资';
                let count = data.count || (data.Data && data.Data.GiftCount) || 1;
                // 抖音以【抖币】为单位价值 (1抖币=0.1元左右)
                let price = data.price || (data.Data && data.Data.GiftDiamondCount) || 0; 
                
                typeWriterLog(`[ 支援 ] 指挥官 [${sender}] 授权了 ${giftName} x${count}`);
                
                if (price < 10) triggerGift('energy');         // 免费包裹或1抖币(小心心)
                else if (price < 3000) triggerGift('upgrade'); // 10抖币以上~3000以内抖币，中型火力
                else triggerGift('nuke');                      // 高级礼物(如嘉年华)，满屏核爆
            }
        } catch(e) {
            console.error("解析弹幕包错误", e);
        } {
            console.error("解析弹幕包错误", e);
        } {
            console.error("解析弹幕包错误", e);
        }"""

new_ws_block = """try {
            let data = JSON.parse(event.data);
            let action = data.action || data.Type;
            let sender = data.sender || (data.Data && data.Data.User ? data.Data.User.Nickname : '匿名指挥官');
            
            if(action === 'danmu' || action === 1) {
                if(Math.random() > 0.5) window.simulateGift('弹幕火力', 2, sender, true);
            }
            
            if(action === 'gift' || action === 5) {
                let giftName = data.giftName || (data.Data && data.Data.GiftName) || '神秘物资';
                let count = data.count || (data.Data && data.Data.GiftCount) || 1;
                let price = data.price || (data.Data && data.Data.GiftDiamondCount) || 0; 
                
                typeWriterLog(`[ 支援 ] [${sender}] 发送了 ${giftName} x${count}`);
                
                if (price < 10) window.simulateGift(giftName, 10, sender); 
                else if (price < 3000) window.simulateGift(giftName, 50 * count, sender); 
                else window.simulateGift(giftName, 500 * count, sender); 
            }
        } catch(e) { console.error("解析错误", e); }"""

js = js.replace(old_ws_block, new_ws_block)

with open('/workspaces/studio1/app.js', 'w', encoding='utf-8') as f:
    f.write(js)
