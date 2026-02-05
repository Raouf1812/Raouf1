const fs = require('fs');
const path = require('path');

// قراءة ملف index.html
const htmlPath = path.join(__dirname, 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

// البحث عن بيانات التعليقات
const start = html.indexOf('<!-- بيانات');
const end = html.indexOf('-->', start);

if (start === -1 || end === -1) {
  console.error('❌ لم نجد التعليق "<!-- بيانات" في الملف!');
  process.exit(1);
}

// استخراج المحتوى
let content = html.slice(start + 15, end).trim();

// التحقق من أن المحتوى غير فارغ
if (!content || content.length < 10) {
  console.error('❌ محتوى البيانات فارغ أو غير صحيح!');
  process.exit(1);
}

// بناء البيانات النهائية
const finalContent = 'var libraryData = {\n    "PLC (متحكمات مبرمجة)": {\n' + 
                     content + 
                     '\n};\n\n// تحديث: تم حل مشاكل التحميل من المسارات المحلية\n// وإضافة تتبع عدد مرات التحميل تلقائياً';

// حفظ الملف
fs.writeFileSync(path.join(__dirname, 'data.js'), finalContent, 'utf8');
console.log('✅ تم إنشاء data.js بنجاح!');
console.log('ℹ️  عدد الأحرف:', finalContent.length);
