import re

with open("/workspaces/studio1/app.js", "r", encoding="utf-8") as f:
    content = f.read()

# Replace systemState initialization to check localStorage
new_state_init = """let systemState = {
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
"""

content = re.sub(r"let systemState = \{[\s\S]*?isAlive: true\n\};", new_state_init, content, count=1)

# Add saveState() to triggerGift 
trigger_sig = "function triggerGift(type) {"
new_trigger = "function triggerGift(type) {\n    saveState(); // 每次收到礼物自动存档"
content = content.replace(trigger_sig, new_trigger)

# Add saveState() to triggeredEvolution
evo_sig = "function triggeredEvolution() {"
new_evo = "function triggeredEvolution() {\n    saveState(); // 突破时自动存档"
content = content.replace(evo_sig, new_evo)

# Add saveState() to resetGame
reset_sig = "function resetGame() {"
new_reset = "function resetGame() {\n    localStorage.removeItem('lobsterState');"
content = content.replace(reset_sig, new_reset)


# Add WebSocket Boilerplate
ws_code = """
// ==========================================
// 真实直播弹幕/礼物数据接入 (WebSocket层)
// ==========================================
let ws = null;
const ws_text = document.getElementById('ws-status-text');
const ws_dot = document.querySelector('.status-dot');

function connectLiveStream() {
    // 这里默认连接本地开发工具或弹幕抓取软件(如BliveChat、抖音弹幕抓取器)
    // 根据你实际用的弹幕抓取工具修改端口 (目前默认 ws://127.0.0.1:3000)
    ws = new WebSocket('ws://127.0.0.1:3000'); 
    
    ws.onopen = () => {
        ws_text.innerText = "数据源 已连接 (LIVE)";
        ws_text.style.color = "#4df8eb";
        if(ws_dot) { ws_dot.classList.remove('disconnected'); ws_dot.classList.add('connected'); ws_dot.style.background = '#4df8eb'; }
        typeWriterLog("[ 网络 ] 区域指挥中心数据流已并入...", 'term-vital');
    };
    
    ws.onmessage = (event) => {
        try {
            let data = JSON.parse(event.data);
            // 假设你的第三方工具传来的是 { action: 'gift', giftName: '辣条', count: 1 } 这种格式
            if(data.action === 'gift') {
                typeWriterLog(`[ 雷达 ] 检测到来自 [${data.sender || '匿名'}] 的火力支援: ${data.giftName} x${data.count}`);
                
                // 根据不同礼物对应触发不同级别的攻击 (需要根据实际直播平台的礼物质积配置)
                if(data.giftName.includes('小') || data.price < 5) triggerGift('energy');
                else if(data.price < 50) triggerGift('upgrade');
                else triggerGift('nuke');
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
// connectLiveStream();

"""
if "connectLiveStream" not in content:
    content += ws_code

with open("/workspaces/studio1/app.js", "w", encoding="utf-8") as f:
    f.write(content)
