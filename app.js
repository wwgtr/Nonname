(function() {
    'use strict';
    
    var currentIndex = 0;
    var quotes = []; 
    var shownQuotes = [];
    var favorites = JSON.parse(localStorage.getItem('amam_favorites') || '[]');
    var fontSizeMultiplier = 1;
    var selectedBg = 0;
    var selectedFormat = 'hd';
    var timerInterval = null;
    var isRecording = false;
    
    var backgrounds = [
        { name: 'ذهبي كلاسيك', colors: ['#0a0505','#1a0a05','#0a0510','#000000'], type: 'gradient' },
        { name: 'أزرق ليلي', colors: ['#050a15','#0a1530','#051020','#000510'], type: 'gradient' },
        { name: 'أخضر زمردي', colors: ['#050a08','#0a1a10','#051008','#000a05'], type: 'gradient' },
        { name: 'بنفسجي ملكي', colors: ['#0a0515','#150a25','#0a0510','#05000a'], type: 'gradient' },
        { name: 'أحمر غامق', colors: ['#150505','#250a0a','#100505','#0a0000'], type: 'gradient' },
        { name: 'ذهبي وردي', colors: ['#1a0a10','#2a1518','#150a0e','#0a0508'], type: 'gradient' },
        { name: 'شطرنج ذهبي', colors: ['#0a0505','#1a0a05'], type: 'checkerboard' },
        { name: 'خطوط عمودية', colors: ['#050a15','#0a1530'], type: 'stripes' },
        { name: 'نقاط ذهبية', colors: ['#0a0505','#d4a843'], type: 'dots' },
        { name: 'شبكة ذهبية', colors: ['#0a0505','#d4a843'], type: 'grid' }
    ];
    
    var downloadFormats = [
        { id: 'hd', name: 'صورة عالية الدقة', width: 2160, height: 3840 },
        { id: 'story', name: 'ستوري', width: 1080, height: 1920 },
        { id: 'instagram', name: 'منشور انستقرام', width: 1080, height: 1080 },
        { id: 'sticker', name: 'ملصق شفاف', width: 1024, height: 1024, transparent: true },
        { id: 'video_story', name: 'فيديو ستوري (10 ثواني)', width: 1080, height: 1920, isVideo: true }
    ];
    
    function init() {
        var section = window.currentSection || 'quotes';
        
        if (section === 'quotes') {
            if (typeof quotesData !== 'undefined') {
                quotes = quotesData.map(q => ({ text: q.full || q.text, theme: q.theme || 'حكمة', original: q }));
            }
            if (typeof extraQuotesData !== 'undefined') {
                quotes = quotes.concat(extraQuotesData.map(q => ({ text: q.text, theme: 'من الديوان' })));
            }
        } else if (section === 'poetry') {
            if (typeof poetryData !== 'undefined') {
                quotes = poetryData.map(p => ({ text: p.lines.join('\n'), theme: p.title || 'شعر علوي', lines: p.lines }));
            }
        } else if (section === 'bios') {
            if (typeof biosData !== 'undefined') {
                quotes = biosData.map(b => ({ text: b.quote, theme: b.title || 'نبذة تعريفية' }));
            }
        }

        if (quotes.length > 0) shuffleQuote();
        
        initParticles();
        initBgGrid();
        initFormatSelector();
        
        // الأحداث المشتركة
        document.getElementById('shuffleBtn')?.addEventListener('click', shuffleQuote);
        document.getElementById('prevBtn')?.addEventListener('click', prevQuote);
        document.getElementById('nextBtn')?.addEventListener('click', nextQuote);
        document.getElementById('saveBtn')?.addEventListener('click', openSaveModal);
        document.getElementById('shareBtn')?.addEventListener('click', shareQuote);
        document.getElementById('allQuotesBtn')?.addEventListener('click', openAllQuotes);
        document.getElementById('settingsBtn')?.addEventListener('click', openSettings);
        document.getElementById('closeAllQuotes')?.addEventListener('click', closeAllQuotes);
        document.getElementById('closeSettings')?.addEventListener('click', closeSettings);
        document.getElementById('closeSave')?.addEventListener('click', closeSaveModal);
        document.getElementById('confirmSave')?.addEventListener('click', handleSaveAction);
        document.getElementById('searchInput')?.addEventListener('input', searchQuotes);
        document.getElementById('fontSizeSelect')?.addEventListener('change', changeFontSize);
        document.getElementById('darkModeToggle')?.addEventListener('click', toggleDarkMode);
        document.getElementById('minimalModeToggle')?.addEventListener('click', toggleMinimalMode);

        // أحداث الشعر
        if (section === 'poetry') {
            document.getElementById('poetryWarningIcon')?.addEventListener('click', () => document.getElementById('poetryWarningModal').classList.add('active'));
            document.getElementById('closePoetryWarning')?.addEventListener('click', () => document.getElementById('poetryWarningModal').classList.remove('active'));
            document.getElementById('confirmPoetryWarning')?.addEventListener('click', () => document.getElementById('poetryWarningModal').classList.remove('active'));
        }
        
        window.addEventListener('click', (e) => { if (e.target.classList.contains('modal')) e.target.classList.remove('active'); });
    }

    function showQuote(index) {
        if (quotes.length === 0) return;
        currentIndex = (index + quotes.length) % quotes.length;
        var item = quotes[currentIndex];
        
        var titleEl = document.getElementById('contentTitle');
        var textEl = document.getElementById('quoteContent');
        var poetryEl = document.getElementById('poetryContent');
        
        if (titleEl) titleEl.textContent = item.theme;
        
        if (window.currentSection === 'poetry' && item.lines) {
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
        } else if (window.currentSection === 'quotes' && item.original && item.original.first) {
            textEl.style.display = 'none';
            poetryEl.style.display = 'flex';
            poetryEl.innerHTML = '<div class="poetry-line">' + 
                                 '<div class="poetry-part sadr">' + item.original.first + '</div>' + 
                                 '<div class="poetry-part ajuz">' + item.original.second + '</div>' + 
                                 '</div>';
        } else {
            if (poetryEl) poetryEl.style.display = 'none';
            textEl.style.display = 'block';
            textEl.textContent = item.text;
        }
        
        updateFontSize(item.text.length);
    }
    
    function shuffleQuote() {
        if (shownQuotes.length >= quotes.length) shownQuotes = [];
        var nextIdx;
        do { nextIdx = Math.floor(Math.random() * quotes.length); } while (shownQuotes.includes(nextIdx) && quotes.length > 1);
        shownQuotes.push(nextIdx);
        showQuote(nextIdx);
    }
    
    function prevQuote() { showQuote(currentIndex - 1); }
    function nextQuote() { showQuote(currentIndex + 1); }
    
    function updateFontSize(length) {
        var baseSize = 1.5;
        if (length > 100) baseSize = 1.2;
        if (length > 200) baseSize = 1.0;
        var el = document.getElementById('quoteContent') || document.getElementById('poetryContent');
        if (el) el.style.fontSize = (baseSize * fontSizeMultiplier) + 'em';
    }
    
    function changeFontSize() {
        var val = document.getElementById('fontSizeSelect').value;
        fontSizeMultiplier = (val === 'small') ? 0.8 : (val === 'large') ? 1.3 : 1;
        updateFontSize(quotes[currentIndex].text.length);
    }
    
    function toggleDarkMode() {
        document.getElementById('mainContainer').classList.toggle('dark-mode');
        document.getElementById('darkModeTrack').classList.toggle('active');
    }
    
    function toggleMinimalMode() {
        document.getElementById('mainContainer').classList.toggle('minimal-mode');
        document.getElementById('minimalModeTrack').classList.toggle('active');
    }
    
    function openAllQuotes() {
        document.getElementById('allQuotesModal').classList.add('active');
        renderQuotesList(quotes);
    }
    
    function closeAllQuotes() { document.getElementById('allQuotesModal').classList.remove('active'); }
    function openSettings() { document.getElementById('settingsModal').classList.add('active'); }
    function closeSettings() { document.getElementById('settingsModal').classList.remove('active'); }
    function openSaveModal() { document.getElementById('saveModal').classList.add('active'); }
    function closeSaveModal() { document.getElementById('saveModal').classList.remove('active'); }
    
    function renderQuotesList(data) {
        var list = document.getElementById('quotesList');
        list.innerHTML = '';
        data.forEach((q, idx) => {
            var item = document.createElement('div');
            item.className = 'quote-item';
            item.innerHTML = '<div class="q-text">' + q.text.substring(0, 60) + '...</div><div class="q-number">' + q.theme + '</div>';
            item.onclick = () => { showQuote(idx); closeAllQuotes(); };
            list.appendChild(item);
        });
    }
    
    function searchQuotes() {
        var term = document.getElementById('searchInput').value.toLowerCase();
        var filtered = quotes.filter(q => q.text.toLowerCase().includes(term) || q.theme.toLowerCase().includes(term));
        renderQuotesList(filtered);
    }
    
    function shareQuote() {
        var text = '﴿ ' + quotes[currentIndex].text + ' ﴾\n\n— الإمام علي (ع)';
        if (navigator.share) navigator.share({ text: text });
        else {
            navigator.clipboard.writeText(text);
            showToast('تم نسخ النص');
        }
    }
    
    function handleSaveAction() {
        var format = downloadFormats.find(f => f.id === selectedFormat);
        if (format && format.isVideo) saveAsVideo(); else saveAsImage();
    }
    
    function drawQuoteOnCanvas(ctx, canvas, quote, format, frame) {
        var bg = backgrounds[selectedBg];
        var padding = canvas.width * 0.08;
        
        if (format.transparent) ctx.clearRect(0, 0, canvas.width, canvas.height);
        else {
            if (bg.type === 'gradient') {
                var grd = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
                bg.colors.forEach((c, i) => grd.addColorStop(i / (bg.colors.length - 1), c));
                ctx.fillStyle = grd;
            } else ctx.fillStyle = bg.colors[0];
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        ctx.fillStyle = '#d4a843'; ctx.textAlign = 'center';
        ctx.font = 'bold ' + (canvas.width * 0.04) + 'px "Cairo"';
        ctx.fillText(quote.theme, canvas.width/2, padding*2);

        var isPoetry = (window.currentSection === 'poetry' && quote.lines) || (quote.original && quote.original.first);
        ctx.fillStyle = format.transparent ? '#d4a843' : '#f5f0e8';
        
        if (isPoetry) {
            var pLines = quote.lines || [quote.original.first, quote.original.second];
            var bfs = Math.floor(canvas.width * 0.045);
            ctx.font = bfs + 'px "Amiri"';
            var lh = bfs * 2;
            var sy = canvas.height/2 - (pLines.length/4)*lh;
            for (var l=0; l<pLines.length; l+=2) {
                ctx.textAlign = 'right'; ctx.fillText(pLines[l], canvas.width/2 - 20, sy + (l/2)*lh);
                ctx.textAlign = 'left'; ctx.fillText(pLines[l+1] || '', canvas.width/2 + 20, sy + (l/2)*lh);
            }
        } else {
            var bfs = Math.floor(canvas.width * 0.05);
            ctx.font = bfs + 'px "Amiri"';
            var words = quote.text.split(' '), lines = [], cl = '';
            words.forEach(w => {
                var m = ctx.measureText(cl + ' ' + w);
                if (m.width > canvas.width - padding*2) { lines.push(cl); cl = w; } else cl += ' ' + w;
            });
            lines.push(cl);
            var sy = canvas.height/2 - (lines.length/2)*bfs*1.5;
            lines.forEach((l, i) => ctx.fillText(l.trim(), canvas.width/2, sy + i*bfs*1.5));
        }
        
        if (!format.transparent) {
            ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = (canvas.width*0.025)+'px Arial';
            ctx.textAlign = 'center'; ctx.fillText('insta : ne_7u', canvas.width/2, canvas.height-padding);
        }
    }
    
    function saveAsImage() {
        var format = downloadFormats.find(f => f.id === selectedFormat) || downloadFormats[0];
        var canvas = document.getElementById('imageCanvas');
        var ctx = canvas.getContext('2d');
        canvas.width = format.width; canvas.height = format.height;
        drawQuoteOnCanvas(ctx, canvas, quotes[currentIndex], format);
        var link = document.createElement('a');
        link.download = 'amam_ali.png'; link.href = canvas.toDataURL(); link.click();
        showToast('تم حفظ الصورة');
    }

    function saveAsVideo() {
        showToast('جاري تحضير الفيديو (10 ثوان)...');
        var format = downloadFormats.find(f => f.id === 'video_story');
        var canvas = document.getElementById('imageCanvas');
        var ctx = canvas.getContext('2d');
        canvas.width = format.width; canvas.height = format.height;
        
        var audio = new Audio('audio.ogg');
        var stream = canvas.captureStream(30);
        var recorder = new MediaRecorder(stream);
        var chunks = [];
        recorder.ondataavailable = e => chunks.push(e.data);
        recorder.onstop = () => {
            var blob = new Blob(chunks, { type: 'video/webm' });
            var link = document.createElement('a');
            link.href = URL.createObjectURL(blob); link.download = 'amam_ali_video.webm'; link.click();
            showToast('تم تصدير الفيديو');
        };
        
        recorder.start(); audio.play();
        var frame = 0;
        function record() {
            if (frame < 300) {
                drawQuoteOnCanvas(ctx, canvas, quotes[currentIndex], format, frame);
                frame++; requestAnimationFrame(record);
            } else { recorder.stop(); audio.pause(); }
        }
        record();
    }

    function initParticles() {
        var canvas = document.getElementById('particlesCanvas');
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
        resize(); window.onresize = resize;
        var ps = [];
        for(var i=0; i<60; i++) ps.push({x:Math.random()*canvas.width, y:Math.random()*canvas.height, s:Math.random()*2, sy:-Math.random()*0.5-0.2});
        function anim() {
            ctx.clearRect(0,0,canvas.width,canvas.height);
            ps.forEach(p => {
                p.y += p.sy; if(p.y < -10) p.y = canvas.height+10;
                ctx.fillStyle = 'rgba(212,168,67,0.4)'; ctx.beginPath(); ctx.arc(p.x,p.y,p.s,0,Math.PI*2); ctx.fill();
            });
            requestAnimationFrame(anim);
        }
        anim();
    }

    function initBgGrid() {
        var grid = document.getElementById('bgGrid');
        if (!grid) return;
        backgrounds.forEach((bg, i) => {
            var div = document.createElement('div');
            div.className = 'bg-grid-item' + (i===0?' selected':'');
            div.innerHTML = '<div class="preview" style="background:'+(bg.type==='gradient'?'linear-gradient(135deg,'+bg.colors.join(',')+')':bg.colors[0])+'"></div><div class="name">'+bg.name+'</div>';
            div.onclick = () => {
                document.querySelectorAll('.bg-grid-item').forEach(el => el.classList.remove('selected'));
                div.classList.add('selected'); selectedBg = i;
            };
            grid.appendChild(div);
        });
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

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
