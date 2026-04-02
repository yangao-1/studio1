with open('/workspaces/studio1/app.js', 'r', encoding='utf-8') as f:
    c = f.read()

# Enable connectLiveStream() directly
c = c.replace('// connectLiveStream();', 'connectLiveStream();')

# Update actions in ws.onmessage slightly
new_parser = """try {
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
        
import re
c = re.sub(r'try \{\s+let data = JSON\.parse\(event\.data\);\s+//.*?\} catch\(e\)', new_parser, c, flags=re.DOTALL)

with open('/workspaces/studio1/app.js', 'w', encoding='utf-8') as f:
    f.write(c)

print('Patched app.js with live ws rules!')
