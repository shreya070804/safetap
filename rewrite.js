const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// Fix double mobile-wrapper
html = html.replace('<div class=\"mobile-wrapper\">\n\n    <div class=\"mobile-wrapper\">', '<div class=\"mobile-wrapper\">');

// 1. Move MEDS screen to BEFORE History screen
let startMeds = html.indexOf('<!-- 💊 MEDS SCREEN -->');
let endMeds = html.indexOf('<!-- 👩⚕️ CAREGIVER SCREEN -->');
let medsBlock = html.substring(startMeds, endMeds);

html = html.replace(medsBlock, ''); // Remove it from current spot

let historyTarget = html.indexOf('<!-- 📊 HISTORY SCREEN -->');
html = html.substring(0, historyTarget) + medsBlock + html.substring(historyTarget);


// 2. Add phone-wrapper close and desktop-panels open before History
historyTarget = html.indexOf('<!-- 📊 HISTORY SCREEN -->');
let injection = `
       </div> <!-- end content-area (we should close content-area early) -->
    </div> <!-- end phone-wrapper -->

    <div class="desktop-panels content-area" style="display: contents;">
        <!-- Using display:contents here so the JS still thinks they share content-area or just rename everything -->
`;

// Actually the existing wrapper is main.content-area.
let mainTarget = html.indexOf('<main class=\"content-area\">');
html = html.replace('<main class=\"content-area\">', '<div class=\"phone-content\">');

// Find </main>
html = html.replace('</main>', '</div> <!-- end desktop panels -->');

historyTarget = html.indexOf('<!-- 📊 HISTORY SCREEN -->');
html = html.substring(0, historyTarget) + '\n    </div> <!-- end phone-content -->\n    </div> <!-- end phone-wrapper -->\n\n    <div class="desktop-panels">\n' + html.substring(historyTarget);

fs.writeFileSync('index.html', html);
console.log("Rewrite done!");
