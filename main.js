

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


// نظام البومودورو المطور - ريكوردات المذاكرة
let pomoInterval;
let pomoMinutes = 25;
let pomoSeconds = 0;
let pomoIsRunning = false;
let pomoIsBreak = false;

const pomoDisplay = document.getElementById('pomo-timer');
const pomoSlider = document.getElementById('pomo-slider');
const pomoSliderVal = document.getElementById('slider-val');
const pomoStatus = document.getElementById('pomo-status');
const pomoStartBtn = document.getElementById('pomo-start');

const romanticQuotes = [
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

// تحديث الشاشة
function updatePomoDisplay() {
    let m = pomoMinutes < 10 ? '0' + pomoMinutes : pomoMinutes;
    let s = pomoSeconds < 10 ? '0' + pomoSeconds : pomoSeconds;
    pomoDisplay.innerText = `${m}:${s}`;
}

// تغيير السلايدر
pomoSlider.addEventListener('input', (e) => {
    if (!pomoIsRunning) {
        pomoMinutes = e.target.value;
        pomoSeconds = 0;
        pomoSliderVal.innerText = pomoMinutes;
        updatePomoDisplay();
    }
});

function startPomo() {
    if (pomoIsRunning) return;
    pomoIsRunning = true;
    pomoStartBtn.innerText = "ايقاف مؤقت";
    pomoSlider.disabled = true;

    pomoInterval = setInterval(() => {
        if (pomoSeconds === 0) {
            if (pomoMinutes == 0) {
                clearInterval(pomoInterval);
                pomoIsRunning = false;
                handlePomoEnd();
                return;
            }
            pomoMinutes--;
            pomoSeconds = 59;
        } else {
            pomoSeconds--;
        }

        // كل 30 ثانية رسالة رومانسية محفزة
        // كل 10 ثواني رسالة رومانسية محفزة
if (pomoSeconds % 15 === 0) {
    const randomMsg = romanticQuotes[Math.floor(Math.random() * romanticQuotes.length)];
    
    // تأثير اختفاء بسيط (Fade out)
    pomoStatus.style.opacity = 0;
    
    setTimeout(() => {
        pomoStatus.innerText = randomMsg;
        // تأثير ظهور (Fade in)
        pomoStatus.style.opacity = 1;
    }, 500);
}

        updatePomoDisplay();
    }, 1000);
}

function handlePomoEnd() {
    if (!pomoIsBreak) {
        alert("الله ينور يا هندسة! خلصنا وقت التركيز.. خدي 5 دقائق راحة ❤️");
        pomoIsBreak = true;
        pomoMinutes = 5; // وقت الراحة
        pomoSeconds = 0;
        pomoStatus.innerText = "وقت الراحة.. غمض عينك وافصل ☕";
        pomoDisplay.style.color = "#00f260"; // لون أخضر للراحة
        startPomo();
    } else {
        alert("خلصنا الراحة.. مستعد للجولة الجاية؟ 💪");
        pomoIsBreak = false;
        pomoMinutes = pomoSlider.value;
        pomoSeconds = 0;
        pomoDisplay.style.color = "var(--gold)";
        pomoStartBtn.innerText = "ابدأ ❤️";
        pomoSlider.disabled = false;
        updatePomoDisplay();
    }
}

pomoStartBtn.onclick = () => {
    if (pomoIsRunning) {
        clearInterval(pomoInterval);
        pomoIsRunning = false;
        pomoStartBtn.innerText = "كمل";
    } else {
        startPomo();
    }
};

document.getElementById('pomo-reset').onclick = () => {
    clearInterval(pomoInterval);
    pomoIsRunning = false;
    pomoIsBreak = false;
    pomoSlider.disabled = false;
    pomoMinutes = pomoSlider.value;
    pomoSeconds = 0;
    pomoDisplay.style.color = "var(--gold)";
    pomoStartBtn.innerText = "ابدأ ❤️";
    pomoStatus.innerText = "مستعد ؟";
    updatePomoDisplay();
};