(function() {
    'use strict';
    
    var currentIndex = 0;
    var quotes = []; 
    var selectedFormat = 'hd';
    
    var downloadFormats = [
        { id: 'hd', name: 'صورة ملكية (4K)', width: 2160, height: 3840 },
        { id: 'story', name: 'ستوري فخم', width: 1080, height: 1920 },
        { id: 'instagram', name: 'منشور مربع', width: 1080, height: 1080 },
        { id: 'sticker', name: 'ملصق شفاف', width: 1024, height: 1024, transparent: true },
        { id: 'video', name: 'فيديو سينمائي (15 ث)', width: 1080, height: 1920, isVideo: true }
    ];
    
    function init() {
        var section = window.currentSection || 'home';
        
        // تحميل البيانات
        if (section === 'home') {
            if (typeof quotesData !== 'undefined') {
                quotes = quotesData.map(q => ({ text: q.full || q.text, theme: q.theme || 'حكمة', original: q }));
            }
            shuffleQuote();
        } else if (section === 'poetry') {
            if (typeof poetryData !== 'undefined') {
                quotes = poetryData.map(p => ({ text: p.lines.join('\n'), theme: p.title || 'شعر علوي', lines: p.lines }));
            }
            if (typeof extraQuotesData !== 'undefined') {
                var extra = extraQuotesData.map(q => {
                    var parts = q.text.split('...');
                    if (parts.length < 2) parts = q.text.split('،');
                    return { text: q.text, theme: 'من الديوان', lines: parts.length >= 2 ? [parts[0].trim(), parts[1].trim()] : [q.text, ''] };
                });
                quotes = quotes.concat(extra);
            }
            renderItemsList(quotes);
        } else if (section === 'quotes') {
            if (typeof quotesData !== 'undefined') {
                quotes = quotesData.map(q => ({ text: q.full || q.text, theme: q.theme || 'اقتباس', original: q }));
            }
            renderItemsList(quotes);
        } else if (section === 'bios') {
            if (typeof biosData !== 'undefined') {
                quotes = biosData.map(b => ({ text: b.quote, theme: b.title || 'نبذة' }));
            }
            renderItemsList(quotes);
        }

        initParticles();
        initFormatSelector();
        
        // الأحداث
        document.getElementById('backToList')?.addEventListener('click', backToList);
        document.getElementById('prevBtn')?.addEventListener('click', prevQuote);
        document.getElementById('nextBtn')?.addEventListener('click', nextQuote);
        document.getElementById('saveBtn')?.addEventListener('click', () => document.getElementById('saveModal').classList.add('active'));
        document.getElementById('closeSave')?.addEventListener('click', () => document.getElementById('saveModal').classList.remove('active'));
        document.getElementById('confirmSave')?.addEventListener('click', handleSaveAction);
        document.getElementById('copyBtn')?.addEventListener('click', copyToClipboard);
        document.getElementById('shareBtn')?.addEventListener('click', shareQuote);
        document.getElementById('pdfBtn')?.addEventListener('click', saveAsPDF);
        document.getElementById('searchInput')?.addEventListener('input', searchItems);
    }

    function renderItemsList(data) {
        var list = document.getElementById('itemsList');
        if (!list) return;
        list.innerHTML = '';
        data.forEach((item, idx) => {
            var div = document.createElement('div');
            div.className = 'list-card';
            div.innerHTML = '<div class="title">' + item.theme + '</div><div class="icon">✨</div>';
            div.onclick = () => showDetail(idx);
            list.appendChild(div);
        });
    }

    function searchItems() {
        var term = document.getElementById('searchInput').value.toLowerCase();
        var filtered = quotes.filter(q => q.text.toLowerCase().includes(term) || q.theme.toLowerCase().includes(term));
        renderItemsList(filtered);
    }

    function showDetail(index) {
        currentIndex = index;
        var item = quotes[currentIndex];
        
        document.getElementById('listContainer')?.style.setProperty('display', 'none');
        document.getElementById('viewContainer')?.style.setProperty('display', 'block');
        
        var titleEl = document.getElementById('cardCategory');
        var textEl = document.getElementById('quoteContent');
        var poetryEl = document.getElementById('poetryContent');
        
        if (titleEl) titleEl.textContent = item.theme;
        
        if (item.lines) {
            textEl.style.display = 'none';
            poetryEl.style.display = 'flex';
            poetryEl.innerHTML = '';
            for (var i = 0; i < item.lines.length; i += 2) {
                var lineDiv = document.createElement('div');
                lineDiv.className = 'poetry-line';
                lineDiv.innerHTML = '<div class="poetry-part sadr">' + (item.lines[i] || '') + '</div>' + 
                                    '<div class="poetry-part ajuz">' + (item.lines[i+1] || '') + '</div>';
                poetryEl.appendChild(lineDiv);
            }
        } else {
            poetryEl.style.display = 'none';
            textEl.style.display = 'block';
            textEl.textContent = item.text;
        }
    }

    function backToList() {
        document.getElementById('listContainer').style.display = 'block';
        document.getElementById('viewContainer').style.display = 'none';
    }

    function shuffleQuote() {
        if (quotes.length > 0) {
            currentIndex = Math.floor(Math.random() * quotes.length);
            showDetail(currentIndex);
        }
    }

    function prevQuote() { currentIndex = (currentIndex - 1 + quotes.length) % quotes.length; showDetail(currentIndex); }
    function nextQuote() { currentIndex = (currentIndex + 1) % quotes.length; showDetail(currentIndex); }
    
    function copyToClipboard() {
        var text = '﴿ ' + quotes[currentIndex].text + ' ﴾\n\n— الإمام علي (ع)\nحقوق: insta: ne_7u';
        navigator.clipboard.writeText(text).then(() => showToast('تم نسخ الحكمة'));
    }

    function shareQuote() {
        var text = '﴿ ' + quotes[currentIndex].text + ' ﴾\n\n— الإمام علي (ع)';
        if (navigator.share) navigator.share({ text: text }); else copyToClipboard();
    }

    function handleSaveAction() {
        var format = downloadFormats.find(f => f.id === selectedFormat);
        if (format.isVideo) saveAsVideo(); else saveAsImage();
    }

    function drawOnCanvas(ctx, canvas, quote, format) {
        // خلفية ملكية
        if (format.transparent) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        } else {
            var grd = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            grd.addColorStop(0, '#0a1515'); grd.addColorStop(1, '#050505');
            ctx.fillStyle = grd; ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // إطار ذهبي خفيف
            ctx.strokeStyle = 'rgba(212, 168, 67, 0.1)'; ctx.lineWidth = canvas.width * 0.02;
            ctx.strokeRect(0, 0, canvas.width, canvas.height);
        }

        ctx.textAlign = 'center';
        
        // العنوان
        ctx.fillStyle = '#d4a843';
        ctx.font = 'bold ' + (canvas.width * 0.04) + 'px "Cairo"';
        ctx.fillText(quote.theme, canvas.width/2, canvas.height * 0.15);

        // الأقواس أفقياً
        ctx.font = (canvas.width * 0.08) + 'px "Amiri"';
        ctx.fillText('﴿', canvas.width * 0.1, canvas.height / 2);
        ctx.fillText('﴾', canvas.width * 0.9, canvas.height / 2);

        // النص
        ctx.fillStyle = format.transparent ? '#d4a843' : '#f5f0e8';
        if (quote.lines) {
            var bfs = canvas.width * 0.045; ctx.font = bfs + 'px "Amiri"';
            var lh = bfs * 2; var sy = canvas.height/2 - (quote.lines.length/4)*lh;
            for (var l=0; l<quote.lines.length; l+=2) {
                ctx.textAlign = 'right'; ctx.fillText(quote.lines[l], canvas.width/2 - 20, sy + (l/2)*lh);
                ctx.textAlign = 'left'; ctx.fillText(quote.lines[l+1] || '', canvas.width/2 + 20, sy + (l/2)*lh);
            }
        } else {
            var bfs = canvas.width * 0.06; ctx.font = bfs + 'px "Amiri"';
            var words = quote.text.split(' '), lines = [], cl = '';
            words.forEach(w => {
                if (ctx.measureText(cl + ' ' + w).width > canvas.width * 0.7) { lines.push(cl); cl = w; } else cl += ' ' + w;
            });
            lines.push(cl);
            var sy = canvas.height/2 - (lines.length/2)*bfs*1.5;
            ctx.textAlign = 'center';
            lines.forEach((l, i) => ctx.fillText(l.trim(), canvas.width/2, sy + i*bfs*1.5));
        }

        // الحقوق
        if (!format.transparent) {
            ctx.fillStyle = 'rgba(212, 168, 67, 0.4)';
            ctx.font = (canvas.width * 0.03) + 'px "Cairo"';
            ctx.fillText('INSTA : NE_7U | TELEGRAM : WWGTR', canvas.width/2, canvas.height * 0.9);
        }
    }

    function saveAsImage() {
        var format = downloadFormats.find(f => f.id === selectedFormat);
        var canvas = document.getElementById('imageCanvas');
        var ctx = canvas.getContext('2d');
        canvas.width = format.width; canvas.height = format.height;
        drawOnCanvas(ctx, canvas, quotes[currentIndex], format);
        var link = document.createElement('a');
        link.download = 'wisdom_ne7u.png'; link.href = canvas.toDataURL(); link.click();
        showToast('تم الحفظ بنجاح');
    }

    function saveAsVideo() {
        showToast('جاري إنشاء الفيديو السينمائي...');
        var format = downloadFormats.find(f => f.id === 'video');
        var canvas = document.getElementById('imageCanvas');
        var ctx = canvas.getContext('2d');
        canvas.width = format.width; canvas.height = format.height;
        var audio = new Audio('audio.ogg');
        audio.currentTime = 0;
        
        var stream = canvas.captureStream(30);
        // إضافة مسار الصوت للفيديو إذا كان مدعوماً
        try {
            var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            var source = audioCtx.createMediaElementSource(audio);
            var dest = audioCtx.createMediaStreamDestination();
            source.connect(dest);
            source.connect(audioCtx.destination);
            stream.addTrack(dest.stream.getAudioTracks()[0]);
        } catch(e) { console.log('Audio mix not supported in this browser'); }

        var recorder = new MediaRecorder(stream);
        var chunks = [];
        recorder.ondataavailable = e => chunks.push(e.data);
        recorder.onstop = () => {
            var blob = new Blob(chunks, { type: 'video/webm' });
            var link = document.createElement('a');
            link.href = URL.createObjectURL(blob); link.download = 'wisdom_video.webm'; link.click();
            showToast('تم تصدير الفيديو');
        };
        recorder.start();
        audio.play();
        var frame = 0;
        function record() {
            if (frame < 450) { // 15s
                drawOnCanvas(ctx, canvas, quotes[currentIndex], format);
                // إضافة تأثير لمعان متحرك
                ctx.fillStyle = 'rgba(212, 168, 67, ' + (Math.sin(frame/10)*0.1 + 0.1) + ')';
                ctx.fillRect(0,0,canvas.width,canvas.height);
                frame++; requestAnimationFrame(record);
            } else { recorder.stop(); audio.pause(); }
        }
        record();
    }

    function saveAsPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        doc.setFillColor(10, 10, 10); doc.rect(0, 0, 210, 297, 'F');
        doc.setTextColor(212, 168, 67); doc.setFontSize(22);
        doc.text(quotes[currentIndex].theme, 105, 40, { align: 'center' });
        doc.setTextColor(245, 240, 232); doc.setFontSize(16);
        var lines = doc.splitTextToSize(quotes[currentIndex].text, 160);
        doc.text(lines, 105, 100, { align: 'center' });
        doc.setTextColor(212, 168, 67); doc.setFontSize(10);
        doc.text('INSTA : NE_7U', 105, 280, { align: 'center' });
        doc.save('wisdom_ne7u.pdf');
        showToast('تم تصدير PDF');
    }

    function initParticles() {
        var canvas = document.getElementById('particlesCanvas');
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
            select.appendChild(opt);
        });
        select.onchange = (e) => selectedFormat = e.target.value;
    }

    function showToast(msg) {
        var t = document.getElementById('toast'); if(!t) return;
        t.textContent = msg; t.classList.add('show');
        setTimeout(() => t.classList.remove('show'), 3000);
    }

    init();
})();
