

// تصيير البيانات مباشرة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function () {
    renderCards();
});

async function openCategory(cat) {
    const categoryMenu = document.getElementById('categoryMenu');
    const filesMenu = document.getElementById('filesMenu');
    const list = document.getElementById('filesList');
    if (categoryMenu) categoryMenu.style.display = 'none';
    if (filesMenu) filesMenu.style.display = 'block';
    const items = (typeof libraryData !== 'undefined' && libraryData[currentSub]) ? (libraryData[currentSub][cat] || []) : [];
    if (items.length === 0) {
        if (list) list.innerHTML = "<p style='text-align:center; opacity:0.5; padding:20px;'>قريباً إن شاء الله...</p>";
        return;
    }
    let html = "";
    for (const item of items) {
        const isYouTube = item.link.includes('youtube.com') || item.link.includes('youtu.be');
        // استخدام الاسم المخزن أو استخراج اسم الملف
        const name = item.name || (isYouTube ? "فيديو شرح" : getFileName(item.link));
        const itemId = item.id;
        if (isYouTube) {
            const m = item.link.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|\/embed\/))([^?& ]+)/);
            const videoId = m ? m[1] : '';
            const thumbUrl = videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : 'IMG/RR.png';
            html += `<div class="memo-card" style="border-color: var(--clr-shrah); overflow: hidden; background: rgba(0,0,0,0.4);"><div style="position:relative; width:100%; height:180px;"><img src="${thumbUrl}" style="width:100%; height:100%; object-fit:cover; display:block;"><div style="position:absolute; inset:0; background:linear-gradient(to top, rgba(0,0,0,0.8), transparent); display:flex; align-items:center; justify-content:center;"><div style="width:60px; height:60px; background:var(--clr-shrah); border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow: 0 0 20px var(--clr-shrah);"><span style="font-size:30px; margin-left:5px;">▶</span></div></div></div><div style="padding: 15px; text-align: center;"><div style="font-weight:900; font-size:1.1rem; color:#fff; margin-bottom:15px;">${name}</div><a href="${item.link}" target="_blank" class="btn-action" style="background: var(--clr-shrah); color:#fff; border:none; width:100%; display:block; text-decoration:none; padding:12px; border-radius:10px; font-weight:900;">🎬 مشاهدة الآن</a></div></div>`;
        } else {
            const size = await getFileSize(item.link);
            // استخدام button بدل link للتحميل المباشر
            html += `<div class="memo-card"><div class="memo-header-area"><div class="memo-title-side"><span class="memo-name">${name}</span><span class="memo-dl-count" id="c-${itemId}">تم التحميل 0 مرة</span></div><span class="memo-size-tag">💾 ${size}</span></div><div class="memo-actions"><a href="${item.link}" class="btn-action btn-view" target="_blank">معاينة</a><button class="btn-action btn-dl" onclick="handleDownload('${itemId}')">تحميل</button></div></div>`;
        }
    }
    if (list) list.innerHTML = html;
    if (window.syncCounts) window.syncCounts();
}

function getFileName(path) {
    try {
        let lastPart = path.split('/').pop();
        // إزالة الامتدادات الشائعة وتحويل _ و - لمسافات
        let name = decodeURIComponent(decodeURIComponent(lastPart))
            .replace('.pdf', '')
            .replace('.jpg', '')
            .replace('.jpeg', '')
            .replace('.png', '')
            .replace('.doc', '')
            .replace('.docx', '')
            .replace(/_/g, ' ')
            .replace(/-/g, ' ');
        return name;
    } catch (e) { return "ملف دراسي"; }
}

function fixLink(url) {
    if (url.includes("github.com") && url.includes("/blob/")) {
        url = url.replace("github.com", "raw.githubusercontent.com").replace("/blob/", "/");
    }
    return encodeURI(url).replace(/%25/g, "%");
}

// ابحث عن دالة getFileSize واستبدلها بهذا:
async function getFileSize(url) {
    if (url.includes('drive.google.com')) {
        return "جوجل درايف 💾"; // لأن الدرايف يمنع قراءة الحجم برمجياً قبل التحميل
    }
    return "جاهز للتحميل";
}

(function () {
    const canvas = document.getElementById('bgCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let width, height;

    function initCanvas() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        particles = [];
        for (let i = 0; i < 60; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.6,
                vy: (Math.random() - 0.5) * 0.6,
                size: Math.random() * 2 + 1.5
            });
        }
    }

    function drawCanvas() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach((p, i) => {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0 || p.x > width) p.vx *= -1;
            if (p.y < 0 || p.y > height) p.vy *= -1;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(168, 202, 215, 0.8)";
            ctx.fill();
            for (let j = i + 1; j < particles.length; j++) {
                let p2 = particles[j];
                let dist = Math.hypot(p.x - p2.x, p.y - p2.y);
                if (dist < 150) {
                    ctx.beginPath();
                    let opacity = 1 - (dist / 150);
                    ctx.strokeStyle = `rgba(168, 202, 215, ${opacity * 0.4})`;
                    ctx.lineWidth = 0.8;
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            }
        });
        requestAnimationFrame(drawCanvas);
    }
    window.addEventListener('resize', initCanvas);
    initCanvas();
    drawCanvas();
})();

window.addEventListener('load', function () {
    // الانتظار قليلاً ثم تصيير البيانات
    setTimeout(function () {
        renderCards();
        
        // إخفاء شاشة الترحيب
        var el = document.getElementById('welcome-screen');
        if (el) {
            el.style.opacity = '0';
            el.style.transition = 'opacity 0.5s ease';
            setTimeout(function () {
                if (el) el.style.display = 'none';
            }, 500);
        }
    }, 100);
    
    // في حالة التأخير الطويل، إخفاء الشاشة بعد 3 ثواني
    setTimeout(function () {
        var el = document.getElementById('welcome-screen');
        if (el && el.style.display !== 'none') {
            el.style.display = 'none';
        }
    }, 3000);
});

let currentSub = "";

function renderCards() {
    if (typeof libraryData === 'undefined') return;
    const grid = document.getElementById('subjectsGrid');
    if (!grid) return;
    grid.innerHTML = "";
    for (let sub in libraryData) {
        const d = libraryData[sub];
        grid.innerHTML += '<div class="subject-card" onclick="openModal(\'' + sub.replace(/'/g, "\\'") + '\')"><h3 style="margin:0; font-size:1.3rem; color:var(--gold);">' + sub + '</h3><div class="stats-grid"><div class="stat-item shrah" style="grid-column: span 2;"><span class="stat-num">' + d.shrah.length + '</span><span class="stat-label">شرح</span></div><div class="stat-item mozakrat" style="grid-column: span 2;"><span class="stat-num">' + d.mozakrat.length + '</span><span class="stat-label">مذكرات</span></div><div class="stat-item books" style="grid-column: span 2;"><span class="stat-num">' + d.books.length + '</span><span class="stat-label">كتب</span></div><div class="stat-item exams" style="grid-column: span 3;"><span class="stat-num">' + (d.exams ? d.exams.length : 0) + '</span><span class="stat-label">امتحانات</span></div><div class="stat-item solved" style="grid-column: span 3;"><span class="stat-num">' + (d.solvedExams ? d.solvedExams.length : 0) + '</span><span class="stat-label">امتحانات محلولة</span></div></div></div>';
    }
}

function openModal(n) {
    currentSub = n;
    var t = document.getElementById('modalTitle');
    var m = document.getElementById('modal');
    if (t) t.innerText = n;
    if (m) m.style.display = 'block';
    backToMain();
}
function closeModal() {
    var m = document.getElementById('modal');
    if (m) m.style.display = 'none';
}
function backToMain() {
    var o = document.getElementById('mainOptions');
    var s = document.getElementById('subSection');
    if (o) o.style.display = 'block';
    if (s) s.style.display = 'none';
}

async function updateFileSizeUI(url, elementId) {
    try {
        const response = await fetch(fixLink(url), { method: 'HEAD' });
        const size = response.headers.get('content-length');
        const element = document.getElementById(elementId);
        if (element) {
            if (size && size > 0) element.innerText = "💾 " + (size / (1024 * 1024)).toFixed(2) + " MB";
            else element.innerText = "💾 1.5 MB";
        }
    } catch (e) {
        const element = document.getElementById(elementId);
        if (element) element.innerText = "💾 1.2 MB";
    }
}

async function showSubSection(t) {
    var o = document.getElementById('mainOptions');
    var s = document.getElementById('subSection');
    var list = document.getElementById('itemsList');
    if (o) o.style.display = 'none';
    if (s) s.style.display = 'block';
    
    const items = (typeof libraryData !== 'undefined' && libraryData[currentSub]) ? (libraryData[currentSub][t] || []) : [];
    
    if (items.length === 0) {
        if (list) list.innerHTML = "<p style='text-align:center; opacity:0.5; padding:20px;'>قريباً إن شاء الله...</p>";
        return;
    }

    let html = "";
    items.forEach(function (item, index) {
        const isYouTube = item.link.includes('youtube.com') || item.link.includes('youtu.be');
        const isDrive = item.link.includes('drive.google.com');
        
        // --- تعديل الأسماء هنا ---
        let name = item.name;
        if (!name || name === "undefined" || name === "") {
            name = isYouTube ? "فيديو شرح" : getFileName(item.link);
        }
        // -----------------------

        const itemId = item.id || ('file-' + index);
        const sizeElemId = 'size-' + itemId + '-' + index;

        // تنسيق الحجم
        const displaySize = item.size ? (item.size.includes('MB') ? item.size :" 💾 "+ item.size + ' MB') : (isDrive ? "Drive 💾" : "⏳ جاري..");

        if (isYouTube) {
            const videoId = getYouTubeID(item.link);
            let thumbUrl = item.thumb ? item.thumb : (videoId ? 'https://img.youtube.com/vi/' + videoId + '/mqdefault.jpg' : 'IMG/RR.png');
            
            html += `
                <div class="memo-card" style="border-color: var(--clr-shrah); overflow: hidden; background: rgba(0,0,0,0.4);">
                    <div style="width:100%; height:180px;">
                        <img src="${thumbUrl}" style="width:100%; height:100%; object-fit:cover; display:block;" onerror="this.src='IMG/RR.png'">
                    </div>
                    <div style="padding: 15px; text-align: center;">
                        <div style="font-weight:900; font-size:1.1rem; color:#fff; margin-bottom:15px;">${name}</div>
                        <a href="${item.link}" target="_blank" class="btn-action" style="background: var(--clr-shrah); color:#fff; border:none; width:100%; display:block; text-decoration:none; padding:12px; border-radius:10px; font-weight:900;">🎬 مشاهدة الشرح</a>
                    </div>
                </div>`;
        } else {
            let previewLink = item.link;
            let downloadLink = item.link;
            let isLocalFile = !isDrive && !item.link.includes('http');

            if (isDrive) {
                let driveId = "";
                if (item.link.includes('id=')) driveId = item.link.split('id=')[1].split('&')[0];
                else if (item.link.includes('/d/')) driveId = item.link.split('/d/')[1].split('/')[0];
                
                if (driveId) {
                    previewLink = `https://drive.google.com/file/d/${driveId}/view`;
                    downloadLink = `https://drive.google.com/uc?export=download&id=${driveId}`;
                }
            }

            html += `
                <div class="memo-card">
                    <div class="memo-header-area">
                        <div class="memo-title-side">
                            <span class="memo-name">${name}</span>
                            <span class="memo-dl-count" id="c-${itemId}">تم التحميل 0 مرة</span>
                        </div>
                        <span class="memo-size-tag" id="${sizeElemId}">${displaySize}</span>
                    </div>
                    <div class="memo-actions">
                        <a href="${previewLink}" class="btn-action btn-view" target="_blank">👁️ معاينة</a>
                        <button class="btn-action btn-dl" onclick="handleDownload('${itemId}', '${isLocalFile}')">📥 تحميل</button>
                    </div>
                </div>`;
            
            if (!item.size && !isDrive) updateFileSizeUI(item.link, sizeElemId);
        }
    });

    if (list) list.innerHTML = html;
    if (window.syncCounts) window.syncCounts();
}

async function handleDownload(id, isLocal) {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.style.bottom = '20px';
        toast.innerText = "جاري التحميل... ⏳";
    }

    // 1. تحديث العداد
    if (window.updateDL) { window.updateDL(id); }

    // 2. البحث عن بيانات الملف في القاعدة
    let fileItem = null;
    for (let sub in libraryData) {
        for (let cat in libraryData[sub]) {
            fileItem = libraryData[sub][cat].find(i => i.id == id); // مقارنة مرنة للـ id
            if (fileItem) break;
        }
        if (fileItem) break;
    }

    if (!fileItem) {
        console.error("الملف غير موجود في البيانات");
        return;
    }

    // --- الجزء الأهم: تحديد الاسم الأصلي للملف ---
    // بنسحب الجزء الأخير من الرابط (اسم الملف الفعلي)
    const urlParts = fileItem.link.split('/');
    const originalFileName = decodeURIComponent(urlParts[urlParts.length - 1]); 
    
    // الأولوية للاسم المكتوب في الموقع، لو مش موجود نستخدم الاسم الأصلي للملف
    const finalFileName = fileItem.name || originalFileName;

    try {
        // 3. التحميل عبر Fetch لضمان الاسم
        const response = await fetch(fileItem.link);
        if (!response.ok) throw new Error('فشل جلب الملف');
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = finalFileName; // هيحمل بالاسم الحقيقي (مثلاً: 2017 مايو.jpg)
        
        document.body.appendChild(a);
        a.click();
        
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        if (toast) toast.innerText = "تم التحميل بنجاح";
    } catch (err) {
        // إذا كان الملف خارجي (جوجل درايف مثلاً) ولا يسمح بالـ Fetch
        const a = document.createElement('a');
        a.href = fileItem.link;
        a.download = finalFileName;
        a.target = "_blank";
        a.click();
    }

    setTimeout(() => { if (toast) toast.style.bottom = '-100px'; }, 3000);
}

function showToast() {
    var toast = document.getElementById('toast');
    if (toast) {
        toast.style.bottom = '30px';
        setTimeout(function () { toast.style.bottom = '-100px'; }, 3000);
    }
}

function getYouTubeID(url) {
    var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    var match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

function getYTThumb(url) {
    var id = getYouTubeID(url);
    return id ? 'https://img.youtube.com/vi/' + id + '/mqdefault.jpg' : 'IMG/default-video.png';
}

var countDownDate = new Date("May 20, 2026 10:00:00").getTime();
var countInterval = setInterval(function () {
    var now = new Date().getTime();
    var distance = countDownDate - now;
    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);
    var el;
    if (el = document.getElementById("days")) el.innerHTML = days < 10 ? "0" + days : days;
    if (el = document.getElementById("hours")) el.innerHTML = hours < 10 ? "0" + hours : hours;
    if (el = document.getElementById("minutes")) el.innerHTML = minutes < 10 ? "0" + minutes : minutes;
    if (el = document.getElementById("seconds")) el.innerHTML = seconds < 10 ? "0" + seconds : seconds;
    if (distance < 0) {
        clearInterval(countInterval);
        var c = document.getElementById("countdown");
        if (c) c.innerHTML = "<h2 style='color:var(--gold); grid-column: span 4;'>بدأت الامتحانات.. بالتوفيق! 🎓</h2>";
    }
}, 1000);
window.addEventListener('load', function() {
    const welcomeScreen = document.getElementById('welcome-screen');
    if (welcomeScreen) {
        setTimeout(() => {
            welcomeScreen.style.opacity = '0';
            setTimeout(() => {
                welcomeScreen.style.display = 'none';
            }, 500);
        }, 1000); // سيختفي بعد ثانية واحدة من التحميل
    }
});



let pomoTime, pomoTimerId, isBreak = false, isRunning = false;
const audioNotify = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'); // صوت تنبيه

function updatePomoDisplay(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    document.getElementById('pomo-timer-v2').innerText = 
        `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function startPomoV2() {
    if (isRunning) {
        clearInterval(pomoTimerId);
        isRunning = false;
        document.getElementById('pomo-start-v2').innerText = "كمل";
        return;
    }

    // التعديل هنا لضمان سحب وقت الراحة أو التركيز بشكل صحيح
    if (!pomoTime || pomoTime <= 0) {
        const focusMins = parseInt(document.getElementById('focus-time').value) || 25;
        const breakMins = parseInt(document.getElementById('break-time').value) || 5;
        
        // لو إحنا في حالة راحة، يسحب وقت الراحة، غير كدة يسحب التركيز
        pomoTime = (isBreak ? breakMins : focusMins) * 60;
    }

    isRunning = true;
    document.getElementById('pomo-start-v2').innerText = "توقف";
    
    // داخل دالة startPomoV2
    pomoTimerId = setInterval(() => {
        pomoTime--;
        updatePomoDisplay(pomoTime);

        if (pomoTime <= 0) {
            clearInterval(pomoTimerId);
            clearInterval(msgIntervalId);
            isRunning = false;
            
            // السطر ده هو اللي "بيشغل" كل حاجة لما الوقت يخلص:
            handlePomoEndV2(); // <--- ضيف السطر ده هنا بالظبط
        }
    }, 1000);
}

function handlePomoEndV2() {
    // 1. تشغيل صوت التنبيه
    if (typeof audioNotify !== 'undefined') {
        audioNotify.play().catch(e => console.log("الصوت محتاج تفاعل أول مرة"));
    }

    // 2. إظهار البوب أب (تغيير الـ display)
    const modal = document.getElementById('pomo-alert-modal');
    if (modal) {
        modal.style.display = 'flex'; // <--- السطر ده اللي بيطلعه قدام عينك
    }

    // 3. تبديل الوقت (الراحة والتركيز)
    if (!isBreak) {
        isBreak = true;
        document.getElementById('pomo-alert-title').innerText = "وقت الراحة! ✨";
        const breakMins = parseInt(document.getElementById('break-time').value) || 5;
        pomoTime = breakMins * 60;
    } else {
        isBreak = false;
        document.getElementById('pomo-alert-title').innerText = "انتهت الراحة! 💪";
        const focusMins = parseInt(document.getElementById('focus-time').value) || 25;
        pomoTime = focusMins * 60;
    }
    
    updatePomoDisplay(pomoTime);
    document.getElementById('pomo-start-v2').innerText = isBreak ? "بدء الراحة" : "بدء التركيز";
}
function closePomoAlert() {
    document.getElementById('pomo-alert-modal').style.display = 'none';
    startPomoV2(); // السطر ده بيبدأ العداد فوراً
}
document.getElementById('pomo-start-v2').onclick = startPomoV2;
document.getElementById('pomo-reset-v2').onclick = () => {
    clearInterval(pomoTimerId);
    isRunning = false;
    pomoTime = null;
    isBreak = false;
    document.getElementById('pomo-start-v2').innerText = "ابدأ";
    updatePomoDisplay((parseInt(document.getElementById('focus-time').value) || 25) * 60);
};



// قائمة الرسائل التحفيزية
const messages = [
    // --- (دعوات هادية) ---
    "يا رب يسر الأمور وهون طريق المذاكرة 🤲",
    "اللهم ارزقنا البركة في الوقت والتركيز العالي.",
    "يا رب افتح علينا فتوح العارفين ووفقنا.",
    "اللهم لا سهل إلا ما جعلته سهلاً.",
    "يا رب هون تعب السهر وارزقنا طعم النجاح ✨",
    "اللهم بارك في المجهود واجعله في ميزان الحسنات.",
    "يا رب فرحة تنسينا كل تعب عشناه.",
    "اللهم اشرح الصدور ويسر كل عسير يا رب.",
    "يا رب استودعك ما حفظت فرده إلي عند حاجتي إليه.",
    "ربنا يكتب لنا الخير في كل خطوة بنمشيها.",
    "يا رب طمأنينة وهدوء نفسي وقت المذاكرة.",
    "اللهم اجعل تعبنا ده سبب في راحة مستقبلنا.",
    "يا رب يسر فهم المسائل وبارك في الوقت.",
    "ربنا يرزقنا الثبات واليقين في اللي بنعمله.",
    "اللهم ارزقنا الصبر على العلم والقدرة على الاستمرار.",
    "يا رب اجعل نهاية الطريق ده فرحة تريح قلوبنا.",
    "ربنا يوفق الجميع ويحقق لكل واحد أمله.",
    "اللهم علمنا ما ينفعنا وانفعنا بما علمتنا.",
    "يا رب ارزقنا سرعة الفهم وصفاء الذهن.",
    "ربنا معانا، إحنا بنسعى والباقي على الله 🙏",

    // --- (تحفيز هادي وواقعي) ---
    "كل صفحة بتخلص هي خطوة بسيطة لقدام.",
    "المذاكرة محتاجة نَفَس طويل وهدوء.. كملوا.",
    "بلاش نضغط على أعصابنا، ساعة تركيز أحسن من يوم تشتت.",
    "الوصول محتاج استمرارية مش سرعة.. كملوا بالراحة.",
    "خطوة بخطوة كل حاجة هتخلص بإذن الله ⏳",
    "المستقبل بيتبني بالهداوة والتركيز دلوقتي.",
    "المجهود اللي بنبذله النهاردة هو رصيد لبكرة.",
    "يا هندسة، المذاكرة أرزاق.. ربنا يرزقنا الفهم.",
    "خليكم هاديين، كل مادة وليها مفتاح.",
    "الحلم يستاهل شوية صبر وهدوء ❤️",
    "بلاش استعجال، المهم نطلع فاهمين مش بس مخلصين.",
    "مفيش حاجة بتيجي بالساهل، بس كل حاجة بتعدي.",
    "يا رب يرزقنا طولة البال على المناهج دي.",
    "نركز في اللي في إيدينا دلوقتي وبس.",
    "المذاكرة مش سباق، المذاكرة رحلة.. استمتعوا بيها.",
    "كل معلومة بتثبت دلوقتي هتفرق بكرة ✨",
    "ثقوا إن ربنا مبيضيعش تعب حد أبداً.",
    "التعب لحظة، بس طعم الإنجاز بيفضل معانا.",
    "يا هندسة، بلاش قلق.. القلق بيضيع التركيز.",
    "السعي هو المطلوب مننا، والنتيجة عند ربنا.",

    // --- (رسائل تذكير لطيفة) ---
    "ممكن نقوم نشرب ميه وناخد نفس عميق ونرجع تاني 💧",
    "القهوة والتركيز، وربنا يفتحها علينا جميعاً.",
    "بلاش تشتت، الموبايل يستنى.. مستقبلك أهم.",
    "المذاكرة أهدى لما بنفكر في الهدف بوضوح.",
    "قربنا نخلص، شوية صبر كمان والدنيا هتبقى تمام.",
    "ربنا يوفقكم في اللي جاي، المشوار خلاص قرب يخلص.",
    "الهدوء هو سر الحل الصح في الهندسة.",
    "كل مادة بتخلص هي همّ وانزاح.. استمروا.",
    "المهم نستمر، حتى لو الخطوات بطيئة.",
    "يا رب يرزقنا الفرحة اللي بنتمناها في الآخر 🎓",

    // --- (تكملة الـ 200 رسالة بنفس الروح الهادية وغير المبالغ فيها) ---
    "يا رب يسر لنا كل عسير.",
    "الاستمرار أهم من الكمية، المهم منوقفش.",
    "ربنا يوفقنا جميعاً لما يحبه ويرضاه.",
    "خطوة بخطوة الحلم بيقرب.",
    "المذاكرة عبادة، ربنا يتقبل سعينا.",
    "بلاش نفكر في النتيجة، نركز في السعي دلوقتي.",
    "يا رب يرزقنا التركيز ويبعد عنا المشتتات.",
    "كل حرف بنقرأه هو خطوة في طريق العلم.",
    "بالتوفيق يا هندسة، ربنا ييسر لك كل صعب.",
    "الهدوء النفسي هو مفتاح الفهم السريع.",
    "ربنا يبارك في وقتنا ومجهودنا.",
    "نكمل عشان خاطر نفسنا بلاش ضغط زايد.",
    "المستقبل محتاج صبر، وإحنا بنتعلم الصبر دلوقتي.",
    "يا رب ارزقنا فرحة النجاح الهادي والجميل.",
    "كل حاجة وليها وقتها، ووقت المذاكرة محتاج تركيز.",
    "ربنا يوفقنا ويفتح قلوبنا للعلم.",
    "بلاش نقارن نفسنا بحد، كل واحد وطريقه.",
    "التركيز في التفاصيل الصغيرة بيفرق كتير.",
    "يا رب هون تعبنا واجعله في ميزان حسناتنا.",
    "نكمل بهدوء، ربنا معانا دايماً.",
    "المذاكرة محتاجة راحة كل فترة، متنسوش تفصلوا ☕",
    "يا رب ارزقنا الذاكرة القوية والفهم الواسع.",
    "كل مجهود بنعمله دلوقتي ربنا هيجازينا عليه.",
    "بالتوفيق للجميع، ربنا يحقق أمانيكم.",
    "الوصول للقمة محتاج تعب، بس تعب مقبول.",
    "يا رب يسر لنا فهم المسائل المعقدة.",
    "ربنا يرزقنا الثبات وقت الامتحانات.",
    "بلاش خوف، ربنا معانا ومستحيل يخذلنا.",
    "كل يوم هو فرصة جديدة عشان نكون أحسن.",
    "يا رب ارزقنا النجاح اللي يريح بالنا.",
    "المذاكرة الهادية بتثبت أكتر في الدماغ.",
    "بالتوفيق يا أبطال، ربنا معاكم.",
    "يا رب اجعل طريقنا سهلاً ميسراً.",
    "الاستعانة بالله هي أول خطوة في أي حل.",
    "نكمل عشان بكرة يكون أحلى بإذن الله.",
    "يا رب يبارك في عقولنا وينور بصيرتنا.",
    "المهم المحاولة، والنتيجة بتبهر المجتهدين.",
    "ربنا يوفقنا ويجعل التوفيق حليفنا.",
    "يا رب ارزقنا هدوء النفس وسكينة القلب.",
    "بالراحة على أعصابنا، كل حاجة هتخلص في وقتها.",
    "يا رب يسر لنا المذاكرة وحببنا فيها.",
    "كل معلومة بنفهمها هي سلاح لينا في المستقبل.",
    "بالتوفيق يا هندسة، ربنا معاك في كل صفحة.",
    "التركيز هو اللي بيختصر الوقت.",
    "يا رب ارزقنا فرحة تخرجنا واحنا راضيين.",
    "بلاش نمل، مابقيش كتير على النهاية.",
    "ربنا يوفق الجميع ويسعد قلوبهم بالنجاح.",
    "يا رب اجعل العلم نور لينا في الدنيا والآخرة.",
    "المذاكرة محتاجة عزيمة هادية ومستمرة.",
    "بالتوفيق، ربنا يفتحها عليكم جميعاً.",
    "يا رب ارزقنا قوة الحفظ وسرعة البديهة.",
    "نكمل المشوار بالراحة وبدون استعجال.",
    "كل خطوة بنمشيها هي رفعة لينا عند ربنا.",
    "يا رب يسر لنا كل مادة بنستصعبها.",
    "بالتوفيق يا بشمهندسين، ربنا يحقق أحلامكم.",
    "الهدوء وقت الضغط هو اللي بيطلع أحسن نتائج.",
    "يا رب ارزقنا الصبر على تعب المذاكرة.",
    "نكمل السعي، والباقي على رب العالمين.",
    "يا رب اجعل طريقنا في الهندسة ممهداً وسهلاً.",
    "بالتوفيق، ربنا يبارك في وقتكم وجهدكم.",
    "يا رب ارزقنا فهم النبيين وحفظ المرسلين.",
    "المذاكرة بتركيز ساعة أحسن من يوم تشتت.",
    "يا رب يسر الأمور واشرح الصدور دايماً.",
    "نكمل عشان نفسنا تستحق النجاح ده.",
    "يا رب ارزقنا النجاح والتوفيق في كل حياتنا.",
    "بالتوفيق يا هندسة، ربنا يحميك ويوفقك.",
    "كل مجهود بيتعمل دلوقتي له قيمة كبيرة بكرة.",
    "يا رب ارزقنا الهدوء النفسي وقت المذاكرة.",
    "بلاش نفكر في اللي فات، نركز في اللي جاي.",
    "يا رب يوفقنا جميعاً لما فيه الخير لنا.",
    "نكمل، مابقيش غير خطوات بسيطة على الوصول.",
    "يا رب ارزقنا فرحة تسعد قلوبنا يوم النتيجة.",
    "بالتوفيق يا أبطال، ربنا يسدد خطاكم.",
    "يا رب اجعل العلم في قلوبنا نوراً وهدى.",
    "المذاكرة الهادية هي اللي بتعمل الفرق.",
    "يا رب يسر لنا كل أمر عسير يا كريم.",
    "بالتوفيق، ربنا يكتب لكم النجاح الدائم.",
    "يا رب ارزقنا الثبات عند السؤال واليقين عند الإجابة.",
    "نكمل المشوار بكل هدوء وثقة في الله.",
    "يا رب يبارك في عقولنا ويهدينا للصواب.",
    "بالتوفيق يا هندسة، ربنا يفتح عليك.",
    "كل ساعة مذاكرة هي استثمار في مستقبلك.",
    "يا رب ارزقنا الهدوء والسكينة والتركيز.",
    "نكمل عشان بكرة نفتخر إننا مستسلمناش.",
    "يا رب اجعل النجاح حليفنا في كل خطوة.",
    "بالتوفيق للجميع، ربنا ييسر أموركم.",
    "يا رب ارزقنا فهم المسائل وحب العلم.",
    "المذاكرة محتاجة بال رايق وهدوء أعصاب.",
    "يا رب هون علينا التعب وارزقنا النجاح.",
    "بالتوفيق، ربنا يحفظكم ويبارك في مجهودكم.",
    "يا رب ارزقنا فرحة النجاح بتفوق وهدوء.",
    "نكمل، مابقيش كتير على تحقيق الحلم.",
    "يا رب اجعل العلم وسيلة لرفعتنا في الدنيا والآخرة.",
    "بالتوفيق يا هندسة، ربنا معاك دايماً.",
    "يا رب ارزقنا الذاكرة القوية والتركيز العالي.",
    "المذاكرة محتاجة نية صادقة وتوكل على الله.",
    "يا رب يسر لنا كل مادة بتواجهنا فيها صعوبة.",
    "بالتوفيق للجميع، ربنا يوفقكم لما يحبه.",
    "يا رب ارزقنا الصبر على العلم والاجتهاد.",
    "نكمل عشان تعبنا يستاهل نهاية سعيدة.",
    "يا رب اجعل طريقنا للنجاح سهلاً وميسراً.",
    "بالتوفيق، ربنا يبارك في شبابكم وعلمكم.",
    "يا رب ارزقنا فهم التفاصيل الدقيقة في الهندسة.",
    "المذاكرة الهادية هي سر التفوق الحقيقي.",
    "يا رب يسر لنا الأمور وبارك لنا في الوقت.",
    "بالتوفيق يا أبطال، ربنا معاكم في كل لحظة.",
    "يا رب ارزقنا فرحة تليق بتعبنا واجتهادنا.",
    "نكمل المشوار، الوصول خلاص بقى قريب.",
    "يا رب اجعلنا من النافعين بعلمهم للناس.",
    "بالتوفيق للجميع، ربنا يكتب لكم الخير.",
    "يا رب ارزقنا الهدوء النفسي والسكينة والوقار.",
    "المذاكرة محتاجة تركيز وعزيمة هادية.",
    "يا رب يسر لنا كل مادة بنذاكرها النهاردة.",
    "بالتوفيق يا هندسة، ربنا يفتح لك أبواب النجاح.",
    "يا رب ارزقنا التوفيق والسداد في كل حياتنا.",
    "نكمل السعي، والنتيجة الجميلة جاية بإذن الله.",
    "يا رب بارك في مجهودنا واجعله في ميزان حسناتنا.",
    "بالتوفيق، ربنا يحقق لكم كل اللي بتتمنوه.",
    "يا رب ارزقنا فهم العلم النافع والعمل به.",
    "المذاكرة محتاجة استمرارية وبلاش يأس.",
    "يا رب يسر لنا كل عسير وبارك لنا في اليسير.",
    "بالتوفيق للجميع، ربنا يوفقكم دايماً وأبداً.",
    "يا رب ارزقنا فرحة النجاح الهادية والجميلة.",
    "نكمل المشوار، بكرة أحلى بإذن الله.",
    "يا رب اجعل النجاح طريقنا والتفوق حليفنا.",
    "بالتوفيق يا أبطال، ربنا يحفظكم ويوفقكم.",
    "يا رب ارزقنا هدوء النفس وقت الامتحان.",
    "المذاكرة بذكاء أحسن من المذاكرة بجهد ضايع.",
    "يا رب يسر لنا فهم كل مادة بنذاكرها.",
    "بالتوفيق يا هندسة، ربنا معاك في كل خطوة.",
    "يا رب ارزقنا الصبر والتركيز والنجاح الباهر.",
    "نكمل، طريق العلم محتاج نَفَس طويل وصبر.",
    "يا رب اجعل تعبنا ده نور لينا في مستقبلنا.",
    "بالتوفيق للجميع، ربنا يحقق آمالكم وأحلامكم.",
    "يا رب ارزقنا الهدوء والسكينة والتركيز العالي.",
    "المذاكرة محتاجة هدوء مش عصبية.. استمروا.",
    "يا رب يسر لنا كل أمر بنستصعبه في المنهج.",
    "بالتوفيق، ربنا يبارك في وقتكم وجهدكم دايماً.",
    "يا رب ارزقنا فرحة تدمع لها العين من كتر السعادة.",
    "نكمل، إحنا بنعمل اللي علينا والباقي على الكريم.",
    "يا رب اجعل العلم طريقنا للقمة والنجاح.",
    "بالتوفيق للجميع، ربنا معاكم في كل صفحة.",
    "يا رب ارزقنا الفهم الواسع والذاكرة الحديدية.",
    "المذاكرة الهادية بتخلي الواحد ينجز أكتر.",
    "يا رب يسر لنا طريق الهندسة واجعله سهلاً.",
    "بالتوفيق يا هندسة، ربنا ينور طريقك دايماً."
];


function updatePomoDisplay(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    document.getElementById('pomo-timer-v2').innerText = 
        `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// دالة تغيير الرسائل
function changeMessage() {
    const msgElement = document.getElementById('pomo-msg-v2');
    if (!msgElement) return;
    msgElement.style.opacity = 0;
    setTimeout(() => {
        msgElement.innerText = messages[Math.floor(Math.random() * messages.length)];
        msgElement.style.opacity = 1;
    }, 500);
}

function startPomoV2() {
    if (isRunning) {
        // حالة التوقف المؤقت
        clearInterval(pomoTimerId);
        clearInterval(msgIntervalId); // إيقاف الرسائل أيضاً
        isRunning = false;
        document.getElementById('pomo-start-v2').innerText = "كمل";
        return;
    }

    if (!pomoTime) {
        const focusMins = parseInt(document.getElementById('focus-time').value) || 25;
        pomoTime = focusMins * 60;
    }

    isRunning = true;
    document.getElementById('pomo-start-v2').innerText = "توقف";
    
    // تشغيل الرسائل فوراً ثم كل 15 ثانية
    changeMessage();
    msgIntervalId = setInterval(changeMessage, 15000);

    pomoTimerId = setInterval(() => {
        pomoTime--;
        updatePomoDisplay(pomoTime);
        if (pomoTime <= 0) {
            clearInterval(pomoTimerId);
            clearInterval(msgIntervalId);
            handlePomoEndV2();
        }
    }, 1000);
}

// دالة الإعادة (Reset) لصفر كل شيء
document.getElementById('pomo-reset-v2').onclick = () => {
    clearInterval(pomoTimerId);
    clearInterval(msgIntervalId);
    isRunning = false;
    pomoTime = null;
    isBreak = false;
    document.getElementById('pomo-start-v2').innerText = "ابدأ المذاكره";
    document.getElementById('pomo-msg-v2').innerText = "جاهز  يا هندسة؟ ";
    updatePomoDisplay((parseInt(document.getElementById('focus-time').value) || 25) * 60);
};

document.getElementById('pomo-start-v2').onclick = startPomoV2;

// دالة لتغيير الوقت بالأزرار (+ و -)
function changeVal(id, step) {
    if (isRunning) return; 
    const input = document.getElementById(id);
    let newVal = parseInt(input.value) + step;
    if (newVal < 1) newVal = 1;
    input.value = newVal;
    
    // سطر التعديل: تصفير الوقت المخزن ليتم تحديثه في العداد عند الضغط على "ابدأ"
    pomoTime = null; 
    
    // تحديث العرض المرئي فوراً
    const focusMins = parseInt(document.getElementById('focus-time').value);
    if (!isBreak) updatePomoDisplay(focusMins * 60);
}

// تعديل بسيط في دالة البداية startPomoV2 لتأخذ القيم الجديدة
function startPomoV2() {
    if (isRunning) {
        clearInterval(pomoTimerId);
        clearInterval(msgIntervalId);
        isRunning = false;
        document.getElementById('pomo-start-v2').innerText = "كمل ";
        return;
    }

    if (!pomoTime) {
        const focusMins = parseInt(document.getElementById('focus-time').value) || 25;
        pomoTime = focusMins * 60;
    }

    isRunning = true;
    document.getElementById('pomo-start-v2').innerText = "وقّف شوية";
    
    changeMessage();
    msgIntervalId = setInterval(changeMessage, 15000);

    pomoTimerId = setInterval(() => {
        pomoTime--;
        updatePomoDisplay(pomoTime);

        if (pomoTime <= 0) {
            clearInterval(pomoTimerId);
            clearInterval(msgIntervalId);
            isRunning = false;
            
            // السطر اللي كان ناقص هو استدعاء الدالة دي:
            handlePomoEndV2(); 
        }
    }, 1000);
}