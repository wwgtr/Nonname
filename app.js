(function() {
    'use strict';
    
    var currentIndex = 0;
    var data = [];
    var selectedFormat = 'story_insta';
    
    var downloadFormats = [
        { id: 'hd', name: 'صورة ملكية (4K)', width: 2160, height: 3840 },
        { id: 'story_insta', name: 'انستقرام ستوري', width: 1080, height: 1920 },
        { id: 'post_insta', name: 'انستقرام منشور', width: 1080, height: 1350 },
        { id: 'post_square', name: 'منشور مربع (1:1)', width: 1080, height: 1080 },
        { id: 'telegram_channel', name: 'قناة تلجرام', width: 1280, height: 720 },
        { id: 'sticker', name: 'ملصق شفاف', width: 1024, height: 1024, transparent: true },
        { id: 'video_story', name: 'فيديو ستوري (15 ث)', width: 1080, height: 1920, isVideo: true }
    ];
    
    function init() {
        var section = window.currentSection || 'quotes';
        
        // تحميل البيانات بناءً على القسم
        if (section === 'quotes') {
            data = typeof quotesData !== 'undefined' ? quotesData : [];
        } else if (section === 'poetry') {
            data = typeof poetryData !== 'undefined' ? poetryData : [];
        } else if (section === 'bios') {
            data = typeof biosData !== 'undefined' ? biosData : [];
        }

        initParticles();
        initFormatSelector();
        renderItemsList(data);
        
        // عرض أول عنصر افتراضياً إذا كان هناك بيانات
        if (data.length > 0) {
            showDetail(0);
        }

        // الأحداث
        document.getElementById('backToList')?.addEventListener('click', backToList);
        document.getElementById('prevBtn')?.addEventListener('click', prevItem);
        document.getElementById('nextBtn')?.addEventListener('click', nextItem);
        document.getElementById('saveBtn')?.addEventListener('click', () => document.getElementById('saveModal').style.display = 'flex');
        document.getElementById('closeSave')?.addEventListener('click', () => document.getElementById('saveModal').style.display = 'none');
        document.getElementById('confirmSave')?.addEventListener('click', handleSaveAction);
        document.getElementById('copyBtn')?.addEventListener('click', copyToClipboard);
        document.getElementById('randomBtn')?.addEventListener('click', showRandom);
        document.getElementById('pdfBtn')?.addEventListener('click', saveAsPDF);
        document.getElementById('searchInput')?.addEventListener('input', searchItems);
    }

    function renderItemsList(items) {
        var list = document.getElementById('itemsList');
        if (!list) return;
        list.innerHTML = '';
        items.forEach((item, idx) => {
            var div = document.createElement('div');
            div.className = 'list-item';
            var title = item.title || item.theme || 'بدون عنوان';
            div.innerHTML = `<span>${title}</span><small style="opacity:0.5;">عرض ←</small>`;
            div.onclick = () => showDetail(data.indexOf(item));
            list.appendChild(div);
        });
    }

    function searchItems() {
        var term = document.getElementById('searchInput').value.toLowerCase();
        var filtered = data.filter(item => 
            (item.title || item.theme || '').toLowerCase().includes(term) || 
            (item.full || item.quote || '').toLowerCase().includes(term)
        );
        renderItemsList(filtered);
    }

    function showDetail(index) {
        currentIndex = index;
        var item = data[currentIndex];
        if (!item) return;

        document.getElementById('listContainer').style.display = 'none';
        document.getElementById('viewContainer').style.display = 'block';
        
        var titleEl = document.getElementById('cardCategory');
        var quoteEl = document.getElementById('quoteContent');
        var poetryEl = document.getElementById('poetryContent');
        
        if (titleEl) titleEl.textContent = item.title || item.theme || 'حكمة';
        
        if (window.currentSection === 'poetry' && item.lines) {
            quoteEl.style.display = 'none';
            poetryEl.style.display = 'flex';
            poetryEl.innerHTML = '';
            var container = document.createElement('div');
            container.className = 'poetry-container';
            for (var i = 0; i < item.lines.length; i += 2) {
                var lineDiv = document.createElement('div');
                lineDiv.className = 'poem-line';
                lineDiv.innerHTML = `<div class="sadr">${item.lines[i] || ''}</div><div class="separator">...</div><div class="ajuz">${item.lines[i+1] || ''}</div>`;
                container.appendChild(lineDiv);
            }
            poetryEl.appendChild(container);
        } else {
            poetryEl.style.display = 'none';
            quoteEl.style.display = 'block';
            quoteEl.textContent = item.full || item.quote || '';
        }
    }

    function backToList() {
        document.getElementById('listContainer').style.display = 'block';
        document.getElementById('viewContainer').style.display = 'none';
        window.scrollTo({top: 0, behavior: 'smooth'});
    }

    function showRandom() {
        if (data.length > 0) {
            currentIndex = Math.floor(Math.random() * data.length);
            showDetail(currentIndex);
        }
    }

    function prevItem() { currentIndex = (currentIndex - 1 + data.length) % data.length; showDetail(currentIndex); }
    function nextItem() { currentIndex = (currentIndex + 1) % data.length; showDetail(currentIndex); }
    
    function copyToClipboard() {
        var item = data[currentIndex];
        var text = '﴿ ' + (item.full || item.quote || item.lines.join(' ')) + ' ﴾\n\n— الإمام علي (ع)\nINSTA: NE_7U | TELEGRAM: WWGTR';
        navigator.clipboard.writeText(text).then(() => showToast('تم النسخ بنجاح ✅'));
    }

    function handleSaveAction() {
        var format = downloadFormats.find(f => f.id === selectedFormat);
        document.getElementById('saveModal').style.display = 'none';
        showToast('جاري التجهيز... ⏳');
        if (format.isVideo) saveAsVideo(); else saveAsImage();
    }

    function drawOnCanvas(ctx, canvas, item, format) {
        if (format.transparent) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = '#050505';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = 'rgba(212, 168, 67, 0.1)';
            ctx.lineWidth = canvas.width * 0.02;
            ctx.strokeRect(0, 0, canvas.width, canvas.height);
        }

        ctx.textAlign = 'center';
        ctx.fillStyle = '#d4a843';
        ctx.font = 'bold ' + (canvas.width * 0.04) + 'px Cairo';
        ctx.fillText(item.title || item.theme || 'حكمة علوية', canvas.width/2, canvas.height * 0.12);

        // الأقواس أفقياً
        ctx.font = (canvas.width * 0.08) + 'px Amiri';
        ctx.fillText('﴿', canvas.width * 0.1, canvas.height / 2);
        ctx.fillText('﴾', canvas.width * 0.9, canvas.height / 2);

        ctx.fillStyle = format.transparent ? '#d4a843' : '#f5f0e8';
        if (window.currentSection === 'poetry' && item.lines) {
            var fontSize = canvas.width * 0.04;
            ctx.font = fontSize + 'px Amiri';
            var lh = fontSize * 2;
            var sy = canvas.height/2 - (item.lines.length/4)*lh;
            for (var i = 0; i < item.lines.length; i += 2) {
                ctx.textAlign = 'right'; ctx.fillText(item.lines[i], canvas.width/2 - 20, sy + (i/2)*lh);
                ctx.textAlign = 'left'; ctx.fillText(item.lines[i+1] || '', canvas.width/2 + 20, sy + (i/2)*lh);
            }
        } else {
            var fontSize = canvas.width * 0.06;
            ctx.font = fontSize + 'px Amiri';
            wrapText(ctx, item.full || item.quote || '', canvas.width/2, canvas.height/2, canvas.width * 0.7, fontSize * 1.5);
        }

        if (!format.transparent) {
            ctx.fillStyle = 'rgba(212, 168, 67, 0.5)';
            ctx.font = 'bold ' + (canvas.width * 0.03) + 'px Cairo';
            ctx.fillText('INSTA: NE_7U | TELEGRAM: WWGTR', canvas.width/2, canvas.height * 0.92);
        }
    }

    function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
        var words = text.split(' '), lines = [], line = '';
        words.forEach(w => {
            if (ctx.measureText(line + w).width > maxWidth) { lines.push(line); line = w + ' '; }
            else line += w + ' ';
        });
        lines.push(line);
        var startY = y - (lines.length/2)*lineHeight;
        lines.forEach((l, i) => ctx.fillText(l.trim(), x, startY + i*lineHeight));
    }

    function saveAsImage() {
        var format = downloadFormats.find(f => f.id === selectedFormat);
        var canvas = document.getElementById('imageCanvas');
        var ctx = canvas.getContext('2d');
        canvas.width = format.width; canvas.height = format.height;
        drawOnCanvas(ctx, canvas, data[currentIndex], format);
        var link = document.createElement('a');
        link.download = `amam-al-${Date.now()}.png`;
        link.href = canvas.toDataURL();
        link.click();
    }

    function saveAsVideo() {
        var format = downloadFormats.find(f => f.id === 'video_story');
        var canvas = document.getElementById('imageCanvas');
        var ctx = canvas.getContext('2d');
        canvas.width = format.width; canvas.height = format.height;
        var audio = new Audio('audio.ogg');
        audio.play();
        
        var stream = canvas.captureStream(30);
        var recorder = new MediaRecorder(stream);
        var chunks = [];
        recorder.ondataavailable = e => chunks.push(e.data);
        recorder.onstop = () => {
            var blob = new Blob(chunks, { type: 'video/webm' });
            var link = document.createElement('a');
            link.href = URL.createObjectURL(blob); link.download = 'wisdom_video.webm'; link.click();
        };
        recorder.start();
        var frame = 0;
        function record() {
            if (frame < 450) { // 15s @ 30fps
                drawOnCanvas(ctx, canvas, data[currentIndex], format);
                ctx.fillStyle = 'rgba(212, 168, 67, ' + (Math.sin(frame/10)*0.05 + 0.05) + ')';
                ctx.fillRect(0,0,canvas.width,canvas.height);
                frame++; requestAnimationFrame(record);
            } else { recorder.stop(); audio.pause(); }
        }
        record();
    }

    function saveAsPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        var item = data[currentIndex];
        doc.setFillColor(10, 10, 10); doc.rect(0, 0, 210, 297, 'F');
        doc.setTextColor(212, 168, 67); doc.setFontSize(22);
        doc.text(item.title || item.theme || 'حكمة علوية', 105, 40, { align: 'center' });
        doc.setTextColor(245, 240, 232); doc.setFontSize(16);
        var text = item.full || item.quote || item.lines.join(' ');
        var lines = doc.splitTextToSize(text, 160);
        doc.text(lines, 105, 100, { align: 'center' });
        doc.setTextColor(212, 168, 67); doc.setFontSize(10);
        doc.text('INSTA: NE_7U | TELEGRAM: WWGTR', 105, 280, { align: 'center' });
        doc.save(`wisdom-${Date.now()}.pdf`);
    }

    function initParticles() {
        var canvas = document.getElementById('particlesCanvas');
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
        resize(); window.onresize = resize;
        var ps = [];
        for(var i=0; i<80; i++) ps.push({x:Math.random()*canvas.width, y:Math.random()*canvas.height, s:Math.random()*1.5, sy:-Math.random()*0.3-0.1, o:Math.random()});
        function anim() {
            ctx.clearRect(0,0,canvas.width,canvas.height);
            ps.forEach(p => {
                p.y += p.sy; if(p.y < -10) p.y = canvas.height+10;
                ctx.fillStyle = 'rgba(212,168,67,'+p.o+')'; ctx.beginPath(); ctx.arc(p.x,p.y,p.s,0,Math.PI*2); ctx.fill();
            });
            requestAnimationFrame(anim);
        }
        anim();
    }

    function initFormatSelector() {
        var select = document.getElementById('formatSelect');
        if (!select) return;
        downloadFormats.forEach(f => {
            var opt = document.createElement('option'); opt.value = f.id; opt.textContent = f.name;
            if (f.id === selectedFormat) opt.selected = true;
            select.appendChild(opt);
        });
        select.onchange = (e) => selectedFormat = e.target.value;
    }

    function showToast(msg) {
        var t = document.getElementById('toast'); if(!t) return;
        t.textContent = msg; t.style.display = 'block';
        setTimeout(() => t.style.display = 'none', 3000);
    }

    init();
})();
