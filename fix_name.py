import re
with open('/workspaces/studio1/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Modify changeEnergy to pass senderName to shootAttack
old_energy = "function changeEnergy(amount, giftName) {"
new_energy = "function changeEnergy(amount, giftName, senderName) {"
js = js.replace(old_energy, new_energy)

js = js.replace("shootAttack(finalAmount, giftName);", "shootAttack(finalAmount, giftName, senderName);")

# Modify simulateGift to pass userName to changeEnergy
old_simulate = "changeEnergy(power, giftName);"
new_simulate = "changeEnergy(power, giftName, userName);"
js = js.replace(old_simulate, new_simulate)

# Check if there are other calls to changeEnergy
js = js.replace("triggerGift('energy')", "triggerGift('energy', sender)")
js = js.replace("triggerGift('upgrade')", "triggerGift('upgrade', sender)")
js = js.replace("triggerGift('nuke')", "triggerGift('nuke', sender)")

# Update triggerGift just in case
old_trigger = "function triggerGift(type) {"
new_trigger = "function triggerGift(type, senderName) {"
js = js.replace(old_trigger, new_trigger)

js = js.replace("changeEnergy(10, '补给');", "changeEnergy(10, '补给', senderName);")
js = js.replace("changeEnergy(50, '升级');", "changeEnergy(50, '升级', senderName);")
js = js.replace("changeEnergy(1000, '核爆');", "changeEnergy(1000, '核爆', senderName);")
# Also the other triggerGift things if any

with open('/workspaces/studio1/app.js', 'w', encoding='utf-8') as f:
    f.write(js)
