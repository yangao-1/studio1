with open('/workspaces/studio1/app.js', 'r', encoding='utf-8') as f:
    c = f.read()

# Update ws port to default BarrageGrab port 8888 (can be changed)
c = c.replace("ws://127.0.0.1:3000", "ws://127.0.0.1:8888")

# Update actions in ws.onmessage slightly to support Douyin Desktop grabbers ( BarrageGrab format )
old_parser = """try {
            let data = JSON.parse(event.data);
            
            // 如果是收到弹幕，触发普通基础火力 (加 1-5 点能量)
            if(data.action === 'danmu') {
                if(Math.random() > 0.5) triggerGift('energy'); // 不然满屏幕都是特效会卡，限制频率
            }
            
            // 收到真实礼物，根据价位触发中型/大型火力
            if(data.action === 'gift') {
                typeWriterLog(`[ 支援 ] 指挥官 [${data.sender || '匿名'}] 授权了 ${data.giftName} x${data.count}`);
                
                // data.price 是从 B站的电池（RMB）价转换过来的
                let price = data.price || 0;
                
                if (price < 100) triggerGift('energy'); // 小几毛钱的，或者免费礼物
                else if (price < 5000) triggerGift('upgrade'); // 一块到五十块的，中型特效
                else triggerGift('nuke'); // 五十块以上的打赏，满屏核爆
            }
        } catch(e) {
            console.error("解析弹幕包错误", e);
        }"""

new_parser = """try {
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
        }"""

c = c.replace(old_parser, new_parser)

with open('/workspaces/studio1/app.js', 'w', encoding='utf-8') as f:
    f.write(c)

print('Patched app.js for Douyin BarrageGrab!')
