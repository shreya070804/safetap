const fs = require('fs');
const filePath = 'c:/Users/Shreya/OneDrive/Desktop/SafeTap/src/App.jsx';
let content = fs.readFileSync(filePath, 'utf8');

const lines = content.split(/\r?\n/);
console.log('Total lines:', lines.length);

// Searching around line 1708 (0-indexed 1707)
for (let i = 1700; i < 1720; i++) {
    console.log(`${i+1}: [${lines[i]}]`);
}

// Surgical removal of lines 1708, 1709, 1710 if they match the pattern
// 1707 is div, 1708 is )}, 1709 is div, 1710 is )}
// We only want ONE div and ONE )} after the tertiary grid.
// But wait, line 1513 is {currentView === 'dashboard' && (
// And 1514 is <div ...>
// So we DO need ) } and </div>.
// Our view showed four lines.

// Let's just remove lines index 1708 and 1709 (1-indexed 1709 and 1710)
// if they are just placeholders.

// Wait, looking at the previous view:
// 1707: grid div close
// 1708: dashboard condition close?
// 1709: dashboard content div close?
// 1710: extra condition close?

// The correct sequence SHOULD be:
// 1707: </div> (Grid)
// 1708: </div> (Animate-in div)
// 1709: )}    (currentView check)

lines.splice(1707, 3); // Remove 3 lines starting from 1708 (index 1707)
lines.splice(1707, 0, '                </div>', '              )}');

fs.writeFileSync(filePath, lines.join('\n'));
console.log('Patched file.');
