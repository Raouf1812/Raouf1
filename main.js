

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

async function handleDownload(id, isLocalFile) {
    showToast(); // إظهار رسالة "جاري التحميل"
    
    let item = null;
    // جلب البيانات الكاملة للملف
    for (let sub in libraryData) {
        for (let cat in libraryData[sub]) {
            const foundItem = libraryData[sub][cat].find(i => i.id == id);
            if (foundItem) { 
                item = foundItem; 
                break; 
            }
        }
        if (item) break;
    }

    if (item) {
        let downloadLink = item.link;
        let fileName = item.name || getFileName(item.link) || 'ملف';

        // التعامل مع روابط جوجل درايف
        if (item.link.includes('drive.google.com')) {
            let driveId = "";
            if (item.link.includes('id=')) driveId = item.link.split('id=')[1].split('&')[0];
            else if (item.link.includes('/d/')) driveId = item.link.split('/d/')[1].split('/')[0];
            
            if (driveId) {
                downloadLink = `https://drive.google.com/uc?export=download&id=${driveId}`;
            }
        }

        try {
            // محاولة تحميل الملف
            const response = await fetch(downloadLink, { 
                headers: {
                    'Accept': '*/*'
                }
            });
            
            if (!response.ok) {
                // إذا فشل التحميل، افتح الرابط في صفحة جديدة
                window.open(downloadLink, '_blank');
            } else {
                // تحميل الملف بنجاح
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                a.style.display = 'none';
                document.body.appendChild(a);
                a.click();
                
                // تنظيف بعد التحميل
                setTimeout(() => {
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                }, 100);
            }
            
            // تحديث عداد التحميلات في Firebase
            if (window.updateDL) {
                window.updateDL(id);
            }
        } catch (e) {
            console.log("[v0] Download error, opening in new tab:", e);
            // في حالة الخطأ، افتح الرابط في صفحة جديدة
            window.open(downloadLink, '_blank');
            
            // تحديث العداد حتى في حالة الخطأ
            if (window.updateDL) {
                window.updateDL(id);
            }
        }
    }
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