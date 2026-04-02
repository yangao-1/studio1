import re
with open('/workspaces/studio1/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# fix simulateGift body calling changeEnergy and shootAttack
old_energy_call = "changeEnergy(power, giftName, userName, userName);"
js = js.replace(old_energy_call, "changeEnergy(power, giftName, userName);")
js = js.replace("changeEnergy(power, giftName, userName);", "changeEnergy(power, giftName, userName);")
old_shoot_call = "shootAttack(power, giftName, userName, userName);"
js = js.replace(old_shoot_call, "shootAttack(power, giftName, userName);")

js = js.replace("changeEnergy(power, giftName);", "changeEnergy(power, giftName, userName);")
js = js.replace("shootAttack(power, giftName);", "shootAttack(power, giftName, userName);")

with open('/workspaces/studio1/app.js', 'w', encoding='utf-8') as f:
    f.write(js)
