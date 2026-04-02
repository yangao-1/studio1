const fs = require('fs');
let styleCss = fs.readFileSync('/workspaces/studio1/style.css', 'utf-8');

// Boost Tier 1 (Base)
styleCss = styleCss.replace(/\.tier-1\s*\{[^}]+\}/, `.tier-1 {
    filter: hue-rotate(160deg) drop-shadow(0 0 15px #4df8eb) saturate(1); 
    transform: scale(1);
    transition: all 1s cubic-bezier(0.4, 0, 0.2, 1);
}`);

// Boost Tier 2 (Heavy Artillery)
styleCss = styleCss.replace(/\.tier-2\s*\{[^}]+\}/, `.tier-2 {
    filter: hue-rotate(260deg) drop-shadow(0 0 35px #00ffaa) saturate(1.5) contrast(1.2); 
    transform: scale(1.3) translateY(-10px); bottom: 10px !important;
    transition: all 1.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.tier-2 .part-cannons { 
    opacity: 1 !important; transform: translateY(-5px) scale(1.5); 
    filter: drop-shadow(0 0 10px #00ffaa); 
}`);

// Boost Tier 3 (Siege Core)
styleCss = styleCss.replace(/\.tier-3\s*\{[^}]+\}/, `.tier-3 {
    filter: hue-rotate(60deg) drop-shadow(0 0 60px #ffcc00) saturate(2) contrast(1.5); 
    transform: scale(1.8) translateY(-25px); bottom: 20px !important;
    transition: all 1.5s cubic-bezier(0.4, 0, 0.2, 1);
}
.tier-3 .part-cannons { opacity: 1 !important; transform: translateY(-10px) scale(2) !important; filter: drop-shadow(0 0 20px #ff0000); }
.tier-3 .part-shield { opacity: 1 !important; transform: scale(1.5); filter: drop-shadow(0 0 30px #ffcc00); stroke-width: 4px; }`);

// Boost Tier 4 (Cyber Dragon)
styleCss = styleCss.replace(/\.tier-4\s*\{[\s\S]*?@keyframes dragon-rage/g, `.tier-4 { 
    filter: hue-rotate(340deg) drop-shadow(0 0 80px #ff00ff) drop-shadow(0 0 150px #ff0000) saturate(3) contrast(2); 
    transform: scale(2.6) translateY(-50px); bottom: 50px !important; 
    animation: dragon-rage 0.15s infinite;
}
.tier-4 .part-cannons { opacity: 1 !important; transform: translateY(-20px) scale(3) !important; filter: drop-shadow(0 0 50px #ff00ff); }
.tier-4 .part-shield { opacity: 1 !important; transform: scale(2.5); stroke-width: 6px; stroke: #ff00ff; filter: drop-shadow(0 0 50px #ff0000); }
.tier-4 .part-wings { opacity: 1 !important; transform: scale(2.5); filter: drop-shadow(0 0 40px rgb(255,0,255)); }
.tier-4 .part-halo { opacity: 1 !important; transform: scale(3); stroke-dasharray: 5,5; animation: shield-spin 1s linear infinite; }

@keyframes dragon-rage`);

fs.writeFileSync('/workspaces/studio1/style.css', styleCss);
console.log("Lobster visual difference explicitly boosted.");
