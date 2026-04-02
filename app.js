// State Machine (任务与进化核心)
let systemState = {
    energy: 0,           // 任务完成度, 从 0 累加
    maxEnergy: 500,      // 升阶需要经验 500
    level: 1,
    isAlive: true
};

// 尝试读取本地存档 (防止直播源刷新导致断档)
const savedState = localStorage.getItem('lobsterState');
if(savedState) {
    try {
        let parsed = JSON.parse(savedState);
        systemState.energy = parsed.energy || 0;
        systemState.maxEnergy = parsed.maxEnergy || 500;
        systemState.level = parsed.level || 1;
        console.log("已恢复上次直播的龙虾数据:", systemState);
    } catch(e) { console.error("读取存档失败"); }
}

function saveState() {
    localStorage.setItem('lobsterState', JSON.stringify({
        energy: systemState.energy,
        maxEnergy: systemState.maxEnergy,
        level: systemState.level
    }));
}


// UI Elements
const ui_energyBar = document.getElementById('energy-bar');
const ui_energyText = document.getElementById('energy-text');
const ui_level = document.getElementById('lob-level');
const ui_terminal = document.getElementById('terminal-content');
const ui_warning = document.getElementById('critical-warning');
const ui_container = document.getElementById('obs-screen');
const ui_flylayer = document.getElementById('gift-flylayer');

const ui_player = document.getElementById('player-entity');
const ui_target = document.getElementById('target-icon');
const ui_target_hp = document.getElementById('target-hp-fill');
const ui_mission_title = document.getElementById('mission-title');
const ui_fx_layer = document.getElementById('fx-layer');
const ui_visual_center = document.getElementById('visual-center');
const ui_mission_bg = document.getElementById('mission-bg');
const ui_combo_meter = document.getElementById('combo-meter');
const ui_combo_count = document.getElementById('combo-count');

// 连击暴走系统
let comboCount = 0;
let comboTimer = null;
const COMBO_TIMEOUT = 3000; // 3秒不断就连击不掉

// 各等级对应的极致诱导和环境钩子设定
const EVOLUTION_TIERS = {
    1: { name: '初代突击兵', class: 'tier-1', target: '废弃星站门禁', mission: '[ 等级 D ] 强行黑入废弃据点...', effect: 'projectile' },
    2: { name: '深渊杀戮者', class: 'tier-2', target: '绝密深海宝库', mission: '[ 警告 A ] 遭到安保火力锁定?! 突破它!', effect: 'projectile' },
    3: { name: '虚空吞噬神', class: 'tier-3', target: '量子核心矩阵', mission: '[ 全球狂暴 ] 正在强行夺取宇宙遗物!!', effect: 'projectile-big' },
    4: { name: '创世赛博龙', class: 'tier-4', target: '多维造物主', mission: '[ 神战 ] 降维打击! 星系正在崩坏!!!', effect: 'projectile-big' }
};

// 发射攻击/施法特效
function shootAttack(amount, giftName, senderName = "未知指令") {
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
    helper.innerHTML = innerHtml;
    
    // 随机出现在龙虾周围
    let hLeft = 10 + Math.random() * 40; // 左侧或偏中 10~50%
    let hTop = 50 + Math.random() * 30;  // 靠下 50~80%
    helper.style.left = hLeft + '%';
    helper.style.top = hTop + '%';
    
    ui_fx_layer.appendChild(helper);

    // 帮手出现0.1秒后发射弹道
    setTimeout(() => {
        let p = document.createElement('div');
        p.className = amount > 50 ? 'projectile-big' : 'projectile';
        // 弹道初始位置与帮手相同
        p.style.left = hLeft + '%';
        p.style.top = hTop + '%';
        
        // 旋转角度对准右上角 (大约 -30度 到 -50度)
        p.style.transform = `rotate(-35deg)`;
        ui_fx_layer.appendChild(p);

        // 龙虾本体也做出震动姿态
        ui_player.classList.add('player-attack');
        setTimeout(() => ui_player.classList.remove('player-attack'), 200);

        // 强制重绘后赋予目标坐标
        void p.offsetWidth;
        p.style.left = ui_target.offsetLeft + 'px';
        p.style.top = ui_target.offsetTop + 'px';

        setTimeout(() => {
            if(p.parentNode) p.remove();
            
            // 击中闪烁
            ui_target.classList.add('hit-flash');
            setTimeout(() => ui_target.classList.remove('hit-flash'), 150);

            if(amount > 50) triggerScreenShake();
        }, 300);
    }, 100);

    // 帮手在场上停留一会后消失
    setTimeout(() => {
        helper.style.opacity = 0;
        helper.style.transform = 'translateY(-50px) scale(0.5)';
        setTimeout(() => {
            if(helper.parentNode) helper.remove();
        }, 300);
    }, 1500);
}

// 核心: 增加经验与任务进度
function changeEnergy(amount, giftName, senderName) {
    if(!systemState.isAlive) return;

    // 触发连击机制
    comboCount++;
    ui_combo_meter.classList.remove('hidden');
    ui_combo_count.innerText = comboCount;
    
    // 刷新连击计时器
    clearTimeout(comboTimer);
    comboTimer = setTimeout(() => {
        comboCount = 0;
        ui_combo_meter.classList.add('hidden');
    }, COMBO_TIMEOUT);

    let isCrit = Math.random() < 0.2 || comboCount > 5; // 20% 暴击率，或者连击数>5必暴击
    let finalAmount = amount;

    if(isCrit) {
        finalAmount = Math.floor(amount * 2.5);
        ui_combo_meter.classList.add('combo-critical');
        setTimeout(() => ui_combo_meter.classList.remove('combo-critical'), 500);
    }

    systemState.energy = Math.min(systemState.maxEnergy, Math.max(0, systemState.energy + finalAmount));
    updateUI();
    shootAttack(finalAmount, giftName, senderName); // 动图表现依然基于原始数量

    if(systemState.energy >= systemState.maxEnergy) {
        setTimeout(triggeredEvolution, 500); // 延迟一点等特效飞完
    }
}

// GUI 刷新方法
function updateUI() {
    let pct = (systemState.energy / systemState.maxEnergy) * 100;
    ui_energyBar.style.width = pct + "%";
    ui_energyText.innerText = Math.floor(pct) + "%";
    ui_target_hp.style.width = (100 - pct) + "%"; // 进度越高，目标血量越低（沙盒视觉）

    if(pct >= 90) {
        ui_energyBar.style.backgroundColor = "#ff00ff";
        ui_warning.classList.remove('hidden');
    } else {
        ui_energyBar.style.backgroundColor = "#4df8eb";
        ui_warning.classList.add('hidden');
    }
}

function updateAvatars() {
    // 处理最大层级限制
    let currentTier = systemState.level > 4 ? 4 : systemState.level;
    let config = EVOLUTION_TIERS[currentTier];

    // 更新头衔与UI标志
    ui_mission_title.innerText = config.mission;
    ui_level.innerText = currentTier + " (" + config.name + ")";
    
    // 更新环境场景 (诱人的钩子：周围环境越来越夸张)
    ui_visual_center.className = `bg-tier-${currentTier}`;
    ui_mission_bg.className = `grid-tier-${currentTier}`;
    
    // 清理旧 class，应用新装甲
    ui_player.className = 'mech-lobster';
    ui_player.classList.add(config.class);
    
    
    
    // 更新目标靶子
    let currentTargetHtml = '';
    if(currentTier === 1) currentTargetHtml = '<svg viewBox="0 0 100 100" class="enemy-svg"><rect x="25" y="25" width="50" height="50" fill="none" stroke="#ff3333" stroke-width="4" transform="rotate(45 50 50)"/><circle cx="50" cy="50" r="15" fill="#ff3333" class="anim-core"/></svg>';
    else if(currentTier === 2) currentTargetHtml = '<svg viewBox="0 0 100 100" class="enemy-svg"><polygon points="50,10 90,90 10,90" fill="none" stroke="#ff6600" stroke-width="8"/><circle cx="50" cy="65" r="12" fill="#ff6600" class="reactor-core"/></svg>';
    else if(currentTier === 3) currentTargetHtml = '<svg viewBox="0 0 100 100" class="enemy-svg"><polygon points="50,5 95,50 50,95 5,50" fill="none" stroke="#ff00ff" stroke-width="6"/><circle cx="50" cy="50" r="25" fill="none" stroke="#ff00ff" stroke-width="4" stroke-dasharray="15,5" class="spin-fast"/><circle cx="50" cy="50" r="15" fill="#ff00ff" class="anim-core"/></svg>';
    else currentTargetHtml = '<svg viewBox="0 0 100 100" class="enemy-svg anim-body"><circle cx="50" cy="50" r="48" fill="none" stroke="#ff0000" stroke-width="3" class="spin-slow" stroke-dasharray="2,6"/><circle cx="50" cy="50" r="35" fill="none" stroke="#ff0000" stroke-width="6" class="spin-reverse-slow" stroke-dasharray="20,10"/><path d="M 0 50 Q 50 0 100 50 Q 50 100 0 50" fill="none" stroke="#ff0000" stroke-width="4"/><circle cx="50" cy="50" r="18" fill="#ff0000" class="reactor-core"/></svg>';

    ui_target.innerHTML = `<div class="enemy-wrapper">${currentTargetHtml}<div class="target-name">${config.target}</div></div>`;
}

function triggeredEvolution() {
    saveState(); // 突破时自动存档
    saveState(); // 突破时自动存档
    systemState.level++;
    
    // 突破逻辑
    systemState.maxEnergy = Math.floor(systemState.maxEnergy * 2.5); // 每级所需的EXP变多
    systemState.energy = 0; // 重置进度条
    
    // 更新外观与目标
    updateAvatars();

    let tierIdx = systemState.level > 4 ? 4 : systemState.level; 
    let tierInfo = EVOLUTION_TIERS[tierIdx];
    
    // 强烈的突破特效
    ui_container.style.borderColor = "#ff00ff";
    ui_container.style.boxShadow = "0 0 100px rgba(255, 0, 255, 0.9)";
    triggerScreenShake();
    
    setTimeout(() => {
        ui_container.style.borderColor = "#102e3a";
        ui_container.style.boxShadow = "none";
    }, 2000);
    
    typeWriterLog(`[ 突破 ] === 跨阶段任务部署！当前任务变更: ${tierInfo.mission} ===`, 'term-epic');
    spawnEnergyPopup('MISSION CLEAR!', true);
    
    updateUI();
}

function triggerScreenShake() {
    ui_container.classList.add('screen-shake');
    setTimeout(() => {
        ui_container.classList.remove('screen-shake');
    }, 500);
}

// 终端控制输出 (打字机效果队列)
let msgQueue = [];
let isTyping = false;
function typeWriterLog(msg, cssClass = 'term-line') {
    msgQueue.push({ text: msg, cls: cssClass });
    if(!isTyping) {
        processQueue();
    }
}

function processQueue() {
    if(msgQueue.length === 0) {
        isTyping = false;
        return;
    }
    isTyping = true;
    let curr = msgQueue.shift();
    
    let lineDiv = document.createElement('div');
    lineDiv.className = curr.cls;
    ui_terminal.appendChild(lineDiv);
    
    // 强制滚动到底部
    ui_terminal.scrollTop = ui_terminal.scrollHeight;

    let idx = 0;
    let typeTimer = setInterval(() => {
        if(idx < curr.text.length) {
            lineDiv.innerHTML += curr.text.charAt(idx);
            idx++;
            ui_terminal.scrollTop = ui_terminal.scrollHeight; 
        } else {
            clearInterval(typeTimer);
            setTimeout(processQueue, 300); // 下一条消息前稍事停顿
        }
    }, 50); // 打字速度
}


// --- 模拟测试接口 (供侧边调试按钮调用) ---
window.simulateGift = function (giftName, mockValue, userName) {
    if(!systemState.isAlive) {
        typeWriterLog(`[ 错误 ] 实验已结束。无法接受来自 [${userName}] 的物资。`, 'term-vital');
        return;
    }
    
    let logMsg = "";
    let css = "term-line";
    let flyClass = "";

    if(mockValue <= 10) {
        // 微小礼物 (+点经验)
        changeEnergy(mockValue, giftName, userName);
        logMsg = `[ 协议破解 ] ${userName} 正在突破防火墙... 防护 -${mockValue}%`;
        spawnEnergyPopup(comboCount > 5 ? `COMBO x${comboCount}!` : `+${mockValue} DMG`, false);
    } 
    else if (mockValue <= 200) {
        // 中大型礼物 (+大点经验)
        changeEnergy(mockValue, giftName, userName);
        logMsg = `[ 高危警报 ] 指挥官 ${userName} 投入了 [${giftName}]。目标禁区产生剧烈波动！`;
        css = "term-power";
        spawnEnergyPopup(comboCount > 5 ? `CRITICAL COMBO!!` : `+${mockValue} DMG`, true);
        triggerSurge();
        triggerScreenShake(); // 加大震动
    } 
    else {
        // 大礼物强制满级突破
        changeEnergy(systemState.maxEnergy, giftName); 
        logMsg = `[ 神级降临 ] 星系粉碎！！${userName} 的 [${giftName}] 瓦解了整个世界！！`;
        css = "term-epic";
        flyClass = "epic";
        triggerScreenShake();
    }
    
    typeWriterLog(logMsg, css);
    
    // 显示横幅悬浮动画
    const flyEl = document.createElement('div');
    flyEl.className = 'fly-gift ' + flyClass;
    flyEl.innerHTML = `🌟 ${userName} 释放了 [${giftName}]`;
    ui_flylayer.appendChild(flyEl);
    
    // 清理动画残骸
    setTimeout(() => {
        if(ui_flylayer.contains(flyEl)) {
            flyEl.remove();
        }
    }, 2500);
}

// 暴击弹窗飘字特效
function spawnEnergyPopup(text, isEpic) {
    const popup = document.createElement('div');
    popup.className = isEpic ? 'energy-popup epic-popup' : 'energy-popup';
    popup.innerText = text;
    // 随机位置
    const offset = Math.random() * 80 - 40;
    popup.style.left = `calc(50% + ${offset}px)`;
    popup.style.top = '40%';
    
    ui_container.appendChild(popup);
    setTimeout(() => {
        if(ui_container.contains(popup)) popup.remove();
    }, 2000);
}

// 充能激增滤镜(中等反馈)
function triggerSurge() {
    ui_player.classList.remove('tank-surge');
    void ui_player.offsetWidth; // 触发重绘重置动画
    ui_player.classList.add('tank-surge');
}

// 全局地震滤镜(核爆反馈)
function triggerEarthquake() {
    ui_container.classList.remove('screen-shake');
    void ui_container.offsetWidth; 
    ui_container.classList.add('screen-shake');
    triggerSurge();
}

window.triggerClear = function() {
    systemState = { energy: 0, maxEnergy: 500, level: 1, isAlive: true };
    updateAvatars();
    updateUI();
    typeWriterLog("[ 系统重置 ] 战术重演初始化...", "term-vital");
}

// 初始问候语
setTimeout(() => {
    typeWriterLog(">>> 建立目标区域战术链接..."); 
    setTimeout(() => typeWriterLog(">>> 主宰#829号 已部署..."), 1500);
    setTimeout(() => typeWriterLog(">>> 等待战术支援指令以启动攻击..."), 3000);
    
    // 初始化外观
    updateAvatars();
}, 1000);
// ==========================================
// 待机/挂机 动态丰富系统 
// ==========================================
// 1. 散落的数据尘埃 (随机在全屏产生上升的0/1字符)
setInterval(() => {
    if(!systemState.isAlive) return;
    for(let i=0; i<3; i++) {
        let dust = document.createElement('div');
        dust.className = 'ambient-dust';
        
        dust.style.left = (Math.random() * 90 + 5) + '%';
        dust.style.top = '100%';
        ui_fx_layer.appendChild(dust);
        setTimeout(() => { if (dust.parentNode) dust.remove(); }, 6000);
    }
}, 1000);

// 2. 挂机默默做任务的自动演练
setInterval(() => {
    if(!systemState.isAlive) return;
    if(comboCount > 0) return; // 连击爆气期间(有人送礼时)暂停挂机动画

    // 随机输出挂机日志
    if(Math.random() < 0.05) {
        const idleLogs = [
            ">>> [自动执行] 正在后台挂机解析局部节点...",
            ">>> [自动收集] 自动捕获散落的数据碎片...",
            ">>> [侦测] 扫描防御网弱点结构...",
            ">>> [节电] 维持低功耗渗透模式...",
            ">>> [分析] 自动提取周围能量特征..."
        ];
        typeWriterLog(idleLogs[Math.floor(Math.random()*idleLogs.length)]);
    }

    // 偶尔发射幽灵般的光束自动攻击，不引起震动，表示在默默干活
    if(Math.random() < 0.6) {
        let p = document.createElement('div');
        p.className = 'projectile';
        p.style.width = '12px';
        p.style.height = '4px';
        p.style.background = 'rgba(77,248,235,0.9)';
        p.style.boxShadow = '0 0 5px #00ffff';
        p.style.left = '30%';
        p.style.top = '70%';
        p.style.transform = 'rotate(-35deg)';
        p.style.opacity = '0.7';
        ui_fx_layer.appendChild(p);

        // 强迫推帧
        void p.offsetWidth; 

        // 左顾右盼的瞄准感散布
        let targetX = ui_target.offsetLeft + (ui_target.offsetWidth/2) + (Math.random()*80 - 40);
        let targetY = ui_target.offsetTop + (ui_target.offsetHeight/2) + (Math.random()*60 - 30);

        p.style.left = targetX + 'px';
        p.style.top = targetY + 'px';

        setTimeout(() => {
            if(p.parentNode) p.remove();
            
            // 目标受到挂机攻击微微闪烁变色
            ui_target.style.filter = 'brightness(1.5) hue-rotate(90deg)';
            setTimeout(() => ui_target.style.filter = '', 150);

            // 飘一个小数据增加进度提示
            

            // 给一点点真实经验，挂机缓慢积攒，避免完全卡住
            systemState.energy = Math.min(systemState.maxEnergy, systemState.energy + 1);
            let pct = (systemState.energy / systemState.maxEnergy) * 100;
            ui_energyBar.style.width = pct + "%";
            ui_energyText.innerText = Math.floor(pct) + "%";
            ui_target_hp.style.width = (100 - pct) + "%";

            if (systemState.energy >= systemState.maxEnergy && ui_combo_meter.classList.contains('hidden')) {
                // 如果刚好满了，就突破
                setTimeout(triggeredEvolution, 500); 
            }
        }, 400); // 挂机子弹稍微慢一点
    }
}, 2500);

// ==========================================
// 真实直播弹幕/礼物数据接入 (WebSocket层)
// ==========================================
let ws = null;
const ws_text = document.getElementById('ws-status-text');
const ws_dot = document.querySelector('.status-dot');

function connectLiveStream() {
    // 这里默认连接本地开发工具或弹幕抓取软件(如BliveChat、抖音弹幕抓取器)
    // 根据你实际用的弹幕抓取工具修改端口 (目前默认 ws://127.0.0.1:8888)
    ws = new WebSocket('ws://127.0.0.1:8888'); 
    
    ws.onopen = () => {
        ws_text.innerText = "数据源 已连接 (LIVE)";
        ws_text.style.color = "#4df8eb";
        if(ws_dot) { ws_dot.classList.remove('disconnected'); ws_dot.classList.add('connected'); ws_dot.style.background = '#4df8eb'; }
        typeWriterLog("[ 网络 ] 区域指挥中心数据流已并入...", 'term-vital');
    };
    
    ws.onmessage = (event) => {
        try {
            let data = JSON.parse(event.data);
            
            // 多端兼容器解析 (支持 BarrageGrab / 抖音弹幕抓取器 等格式)
            let action = data.action || data.Type; // 1是弹幕，5是礼物
            
            // 解析发送者 (不同软件字段不同)
            let sender = data.sender || (data.Data && data.Data.User ? data.Data.User.Nickname : '匿名');
            
            // 1. 弹幕处理 (Type 1 或 danmu)
            if(action === 'danmu' || action === 1) {
                if(Math.random() > 0.5) triggerGift('energy', sender); // 不然满屏幕都是特效会卡，限制频率
            }
            
            // 2. 礼物处理 (Type 5 或 gift)
            if(action === 'gift' || action === 5) {
                let giftName = data.giftName || (data.Data && data.Data.GiftName) || '神秘物资';
                let count = data.count || (data.Data && data.Data.GiftCount) || 1;
                // 抖音以【抖币】为单位价值 (1抖币=0.1元左右)
                let price = data.price || (data.Data && data.Data.GiftDiamondCount) || 0; 
                
                typeWriterLog(`[ 支援 ] 指挥官 [${sender}] 授权了 ${giftName} x${count}`);
                
                if (price < 10) triggerGift('energy', sender);         // 免费包裹或1抖币(小心心)
                else if (price < 3000) triggerGift('upgrade', sender); // 10抖币以上~3000以内抖币，中型火力
                else triggerGift('nuke', sender);                      // 高级礼物(如嘉年华)，满屏核爆
            }
        } catch(e) {
            console.error("解析弹幕包错误", e);
        }
    };
    
    ws.onclose = () => {
        ws_text.innerText = "数据源 连接断开 (重连中...)";
        ws_text.style.color = "#ff5555";
        if(ws_dot) { ws_dot.classList.remove('connected'); ws_dot.classList.add('disconnected'); ws_dot.style.background = '#ff5555'; }
        // 断线重连
        setTimeout(connectLiveStream, 5000); 
    };
}
// 取消注释以启用真实直播连接
connectLiveStream();

