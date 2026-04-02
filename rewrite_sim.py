import re
with open('/workspaces/studio1/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Replace all changeEnergy calls to ensure they get userName
js = js.replace("changeEnergy(mockValue, giftName);", "changeEnergy(mockValue, giftName, userName);")
js = js.replace("changeEnergy(Math.floor(mockValue*1.5), giftName);", "changeEnergy(Math.floor(mockValue*1.5), giftName, userName);")
js = js.replace("changeEnergy(Math.floor(mockValue*3), giftName);", "changeEnergy(Math.floor(mockValue*3), giftName, userName);")

# Wait, let's just make simulateGift simpler to avoid missing any branch
# Actually, let me check where triggerGift is used.
js = js.replace("changeEnergy(10, '补给');", "changeEnergy(10, '补给', senderName);")
js = js.replace("changeEnergy(50, '升级');", "changeEnergy(50, '升级', senderName);")
js = js.replace("changeEnergy(1000, '核爆');", "changeEnergy(1000, '核爆', senderName);")


with open('/workspaces/studio1/app.js', 'w', encoding='utf-8') as f:
    f.write(js)
