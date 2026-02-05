const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const start = html.indexOf('<!-- بيانات');
const end = html.indexOf('-->', start);
if (start === -1 || end === -1) {
  console.error('Comment not found');
  process.exit(1);
}
let content = html.slice(start + 15, end).trim();
content = 'var libraryData = {\n    "PLC (متحكمات مبرمجة)": {\n' + content + '\n};';
fs.writeFileSync('data.js', content, 'utf8');
console.log('data.js created');
