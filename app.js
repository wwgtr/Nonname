(function() {
    'use strict';
    
    var currentIndex = 0;
    var quotes = [];
    var shownQuotes = []; // لتتبع الأقوال التي ظهرت ومنع التكرار
    var favorites = JSON.parse(localStorage.getItem('amam_favorites') || '[]');
    var fontSizeMultiplier = 1;
    var selectedBg = 0;
    var selectedFormat = 'hd';
    var timerInterval = null;
    var isRecording = false;
    
    // 30 خلفية متنوعة
    var backgrounds = [
        { name: 'ذهبي كلاسيك', colors: ['#0a0505','#1a0a05','#0a0510','#000000'], type: 'gradient' },
        { name: 'أزرق ليلي', colors: ['#050a15','#0a1530','#051020','#000510'], type: 'gradient' },
        { name: 'أخضر زمردي', colors: ['#050a08','#0a1a10','#051008','#000a05'], type: 'gradient' },
        { name: 'بنفسجي ملكي', colors: ['#0a0515','#150a25','#0a0510','#05000a'], type: 'gradient' },
        { name: 'أحمر غامق', colors: ['#150505','#250a0a','#100505','#0a0000'], type: 'gradient' },
        { name: 'وردي ناعم', colors: ['#1a0a15','#2a1520','#150a10','#0a0508'], type: 'gradient' },
        { name: 'لافندر', colors: ['#1a0a20','#2a1530','#150a18','#0a050e'], type: 'gradient' },
        { name: 'بيج فاتح', colors: ['#1a1510','#2a2018','#15100a','#0a0805'], type: 'gradient' },
        { name: 'سماوي', colors: ['#0a1520','#102030','#081018','#050a10'], type: 'gradient' },
        { name: 'كحلي أنيق', colors: ['#050a15','#0a1025','#050810','#00050a'], type: 'gradient' },
        { name: 'خزامي', colors: ['#150a20','#201030','#100818','#080510'], type: 'gradient' },
        { name: 'عسلي', colors: ['#1a1005','#2a1a0a','#150a05','#0a0500'], type: 'gradient' },
        { name: 'نعناعي', colors: ['#051a10','#0a2a1a','#051508','#000a05'], type: 'gradient' },
        { name: 'مرجاني', colors: ['#1a0a0a','#2a1510','#150808','#0a0505'], type: 'gradient' },
        { name: 'نيلي', colors: ['#050515','#0a0a25','#050518','#000010'], type: 'gradient' },
        { name: 'ذهبي وردي', colors: ['#1a0a10','#2a1518','#150a0e','#0a0508'], type: 'gradient' },
        { name: 'فضي', colors: ['#0a0a0a','#1a1a1a','#101010','#050505'], type: 'gradient' },
        { name: 'كستنائي', colors: ['#150505','#250a08','#100505','#080000'], type: 'gradient' },
        { name: 'تركواز', colors: ['#051515','#0a2020','#081515','#051010'], type: 'gradient' },
        { name: 'بني', colors: ['#150a05','#201008','#100805','#080500'], type: 'gradient' },
        { name: 'شطرنج ذهبي', colors: ['#0a0505','#1a0a05'], type: 'checkerboard' },
        { name: 'خطوط عمودية', colors: ['#050a15','#0a1530'], type: 'stripes' },
        { name: 'نقاط ذهبية', colors: ['#0a0505','#d4a843'], type: 'dots' },
        { name: 'مثلثات هندسية', colors: ['#150505','#250a0a'], type: 'triangles' },
        { name: 'دوائر متحدة المركز', colors: ['#050a08','#0a1a10'], type: 'circles' },
        { name: 'موجات سماوية', colors: ['#0a1520','#102030'], type: 'waves' },
        { name: 'شبكة ذهبية', colors: ['#0a0505','#d4a843'], type: 'grid' },
        { name: 'تدرج سماوي', colors: ['#001a4d','#0052cc','#00bfff'], type: 'gradient' },
        { name: 'تدرج غروب', colors: ['#4d0000','#cc6600','#ffcc00'], type: 'gradient' },
        { name: 'تدرج غابة', colors: ['#001a00','#003300','#00cc00'], type: 'gradient' }
    ];
    
    var downloadFormats = [
        { id: 'hd', name: 'صورة عالية الدقة', width: 2160, height: 3840 },
        { id: 'story', name: 'ستوري', width: 1080, height: 1920 },
        { id: 'instagram', name: 'منشور انستقرام', width: 1080, height: 1080 },
        { id: 'instagram_story', name: 'ستوري انستقرام', width: 1080, height: 1920 },
        { id: 'telegram', name: 'منشور تلجرام', width: 1280, height: 720 },
        { id: 'facebook', name: 'صورة فيسبوك', width: 1200, height: 628 },
        { id: 'sticker', name: 'ملصق شفاف', width: 1024, height: 1024, transparent: true },
        { id: 'video_story', name: 'فيديو ستوري (10 ثواني)', width: 1080, height: 1920, isVideo: true }
    ];
    
    function init() {
        if (typeof quotesData !== 'undefined' && quotesData.length > 0) {
            quotes = quotesData;
            shuffleQuote(); // البداية بقول عشوائي
        } else {
            document.getElementById('quoteContent').textContent = 'لا توجد أقوال متاحة';
        }
        
        initParticles();
        initBgGrid();
        initFormatSelector();
        
        document.getElementById('shuffleBtn').addEventListener('click', shuffleQuote);
        document.getElementById('prevBtn').addEventListener('click', prevQuote);
        document.getElementById('nextBtn').addEventListener('click', nextQuote);
        document.getElementById('saveBtn').addEventListener('click', openSaveModal);
        document.getElementById('shareBtn').addEventListener('click', shareQuote);
        document.getElementById('allQuotesBtn').addEventListener('click', openAllQuotes);
        document.getElementById('aboutBtn').addEventListener('click', openAbout);
        document.getElementById('settingsBtn').addEventListener('click', openSettings);
        document.getElementById('closeAllQuotes').addEventListener('click', closeAllQuotes);
        document.getElementById('closeAbout').addEventListener('click', closeAbout);
        document.getElementById('closeSettings').addEventListener('click', closeSettings);
        document.getElementById('closeSave').addEventListener('click', closeSaveModal);
        document.getElementById('confirmSave').addEventListener('click', handleSaveAction);
        document.getElementById('searchInput').addEventListener('input', searchQuotes);
        document.getElementById('fontSizeSelect').addEventListener('change', changeFontSize);
        document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);
        document.getElementById('minimalModeToggle').addEventListener('click', toggleMinimalMode);
        document.getElementById('timerSelect').addEventListener('change', toggleTimer);
        
        // إضافة زر المفضلة
        var favBtn = document.createElement('button');
        favBtn.id = 'favBtn';
        favBtn.className = 'btn btn-secondary';
        favBtn.innerHTML = '❤️';
        favBtn.style.minWidth = '50px';
        favBtn.addEventListener('click', toggleFavorite);
        document.querySelector('.controls').appendChild(favBtn);
        updateFavoriteButton();
        
        window.addEventListener('click', function(e) {
            if (e.target.classList.contains('modal')) e.target.classList.remove('active');
        });
        
        document.addEventListener('keydown', function(e) {
            if (e.key === 'ArrowRight') prevQuote();
            if (e.key === 'ArrowLeft') nextQuote();
            if (e.key === ' ') { e.preventDefault(); shuffleQuote(); }
        });
        
        var touchStartX = 0, touchEndX = 0;
        document.addEventListener('touchstart', function(e) { touchStartX = e.changedTouches[0].screenX; }, {passive: true});
        document.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            var diff = touchStartX - touchEndX;
            if (Math.abs(diff) > 50) { if (diff > 0) nextQuote(); else prevQuote(); }
        }, {passive: true});
    }
    
    function initFormatSelector() {
        var select = document.getElementById('formatSelect');
        if (!select) return;
        select.innerHTML = '';
        for (var i = 0; i < downloadFormats.length; i++) {
            var option = document.createElement('option');
            option.value = downloadFormats[i].id;
            option.textContent = downloadFormats[i].name;
            select.appendChild(option);
        }
        select.addEventListener('change', function() {
            selectedFormat = this.value;
        });
    }
    
    function initBgGrid() {
        var grid = document.getElementById('bgGrid');
        grid.innerHTML = '';
        for (var i = 0; i < backgrounds.length; i++) {
            (function(idx) {
                var div = document.createElement('div');
                div.className = 'bg-grid-item' + (idx === selectedBg ? ' selected' : '');
                var previewHtml = '<div class="preview" style="';
                if (backgrounds[idx].type === 'gradient') previewHtml += 'background: linear-gradient(135deg, ' + backgrounds[idx].colors.join(',') + ');';
                else if (backgrounds[idx].type === 'checkerboard') previewHtml += 'background-image: linear-gradient(45deg, ' + backgrounds[idx].colors[0] + ' 25%, transparent 25%, transparent 75%, ' + backgrounds[idx].colors[0] + ' 75%, ' + backgrounds[idx].colors[0] + '), linear-gradient(45deg, ' + backgrounds[idx].colors[0] + ' 25%, transparent 25%, transparent 75%, ' + backgrounds[idx].colors[0] + ' 75%, ' + backgrounds[idx].colors[0] + '); background-size: 20px 20px; background-position: 0 0, 10px 10px; background-color: ' + backgrounds[idx].colors[1] + ';';
                else if (backgrounds[idx].type === 'stripes') previewHtml += 'background: repeating-linear-gradient(90deg, ' + backgrounds[idx].colors[0] + ', ' + backgrounds[idx].colors[0] + ' 10px, ' + backgrounds[idx].colors[1] + ' 10px, ' + backgrounds[idx].colors[1] + ' 20px);';
                else if (backgrounds[idx].type === 'dots') previewHtml += 'background-image: radial-gradient(circle, ' + backgrounds[idx].colors[1] + ' 30%, transparent 30%); background-size: 20px 20px; background-color: ' + backgrounds[idx].colors[0] + ';';
                else if (backgrounds[idx].type === 'grid') previewHtml += 'background-image: linear-gradient(' + backgrounds[idx].colors[1] + ' 1px, transparent 1px), linear-gradient(90deg, ' + backgrounds[idx].colors[1] + ' 1px, transparent 1px); background-size: 20px 20px; background-color: ' + backgrounds[idx].colors[0] + ';';
                else previewHtml += 'background: linear-gradient(135deg, ' + backgrounds[idx].colors.join(',') + ');';
                previewHtml += '"></div><div class="name">' + backgrounds[idx].name + '</div>';
                div.innerHTML = previewHtml;
                div.addEventListener('click', function() {
                    document.querySelectorAll('.bg-grid-item').forEach(function(el) { el.classList.remove('selected'); });
                    div.classList.add('selected');
                    selectedBg = idx;
                });
                grid.appendChild(div);
            })(i);
        }
    }
    
    var particles = [];
    function initParticles() {
        var canvas = document.getElementById('particlesCanvas');
        var ctx = canvas.getContext('2d');
        var mouseX = 0, mouseY = 0;
        function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
        resize();
        window.addEventListener('resize', resize);
        for (var i = 0; i < 80; i++) {
            particles.push({
                x: Math.random() * canvas.width, y: Math.random() * canvas.height,
                size: Math.random() * 4 + 1, speedX: (Math.random() - 0.5) * 1.5,
                speedY: (Math.random() - 0.5) * 1.5 - 0.5, opacity: Math.random() * 0.8 + 0.2,
                color: getParticleColor(), life: Math.random() * 100 + 50, maxLife: Math.random() * 100 + 50
            });
        }
        function getParticleColor() {
            var colors = [{r:255,g:200,b:50},{r:255,g:150,b:30},{r:255,g:100,b:20},{r:255,g:50,b:10},{r:200,g:100,b:20},{r:255,g:220,b:100},{r:255,g:180,b:60}];
            return colors[Math.floor(Math.random() * colors.length)];
        }
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (var i = 0; i < particles.length; i++) {
                var p = particles[i];
                p.x += p.speedX; p.y += p.speedY; p.life--;
                var dx = mouseX - p.x, dy = mouseY - p.y, dist = Math.sqrt(dx*dx+dy*dy);
                if (dist < 200) { p.speedX -= dx/dist*0.02; p.speedY -= dy/dist*0.02; }
                if (p.life <= 0 || p.x < -50 || p.x > canvas.width+50 || p.y < -50 || p.y > canvas.height+50) {
                    p.x = Math.random()*canvas.width; p.y = canvas.height+20;
                    p.speedX = (Math.random()-0.5)*1.5; p.speedY = -(Math.random()*2+0.5);
                    p.life = p.maxLife; p.color = getParticleColor(); p.size = Math.random()*4+1;
                }
                var alpha = p.opacity * (p.life/p.maxLife);
                var glow = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.size*4);
                glow.addColorStop(0,'rgba('+p.color.r+','+p.color.g+','+p.color.b+','+(alpha*0.3)+')');
                glow.addColorStop(1,'rgba('+p.color.r+','+p.color.g+','+p.color.b+',0)');
                ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(p.x,p.y,p.size*4,0,Math.PI*2); ctx.fill();
                ctx.fillStyle = 'rgba('+p.color.r+','+p.color.g+','+p.color.b+','+alpha+')';
                ctx.shadowColor = 'rgba('+p.color.r+','+p.color.g+','+p.color.b+','+(alpha*0.5)+')';
                ctx.shadowBlur = 15; ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,Math.PI*2); ctx.fill(); ctx.shadowBlur = 0;
            }
            requestAnimationFrame(animate);
        }
        document.addEventListener('mousemove', function(e) { mouseX=e.clientX; mouseY=e.clientY; });
        animate();
    }
    
    function showQuote(index) {
        if (quotes.length === 0) return;
        currentIndex = (index + quotes.length) % quotes.length;
        var quote = quotes[currentIndex];
        var el = document.getElementById('quoteContent');
        
        // تأثير تحريك النص (Typewriter)
        el.textContent = '';
        var i = 0;
        function typeWriter() {
            if (i < quote.text.length) {
                el.textContent += quote.text.charAt(i);
                i++;
                setTimeout(typeWriter, 30);
            }
        }
        typeWriter();
        
        updateFontSize(quote.text.length);
        updateFavoriteButton();
    }
    
    function shuffleQuote() {
        if (shownQuotes.length >= quotes.length) shownQuotes = []; // إعادة التصفير إذا انتهت الأقوال
        var nextIdx;
        do {
            nextIdx = Math.floor(Math.random() * quotes.length);
        } while (shownQuotes.includes(nextIdx) && quotes.length > 1);
        
        shownQuotes.push(nextIdx);
        showQuote(nextIdx);
        showToast('تم اختيار قول عشوائي (غير مكرر)');
    }
    
    function toggleFavorite() {
        var quote = quotes[currentIndex];
        var idx = favorites.findIndex(f => f.text === quote.text);
        if (idx === -1) {
            favorites.push(quote);
            showToast('تمت الإضافة للمفضلة ❤️');
        } else {
            favorites.splice(idx, 1);
            showToast('تمت الإزالة من المفضلة');
        }
        localStorage.setItem('amam_favorites', JSON.stringify(favorites));
        updateFavoriteButton();
    }
    
    function updateFavoriteButton() {
        var btn = document.getElementById('favBtn');
        if (!btn) return;
        var quote = quotes[currentIndex];
        var isFav = favorites.some(f => f.text === quote.text);
        btn.innerHTML = isFav ? '❤️' : '🤍';
    }
    
    function updateFontSize(textLength) {
        var el = document.getElementById('quoteContent');
        var baseSize;
        if (textLength <= 30) baseSize = 2.0;
        else if (textLength <= 50) baseSize = 1.6;
        else if (textLength <= 80) baseSize = 1.3;
        else if (textLength <= 120) baseSize = 1.1;
        else baseSize = 0.95;
        el.style.fontSize = (baseSize * fontSizeMultiplier) + 'em';
    }
    
    function changeFontSize() {
        var val = document.getElementById('fontSizeSelect').value;
        if (val === 'small') fontSizeMultiplier = 0.8;
        else if (val === 'medium') fontSizeMultiplier = 1;
        else if (val === 'large') fontSizeMultiplier = 1.3;
        else if (val === 'xlarge') fontSizeMultiplier = 1.6;
        var quote = quotes[currentIndex];
        if (quote) updateFontSize(quote.text.length);
        showToast('تم تغيير حجم الخط');
    }
    
    function toggleDarkMode() {
        var container = document.getElementById('mainContainer');
        var track = document.getElementById('darkModeTrack');
        container.classList.toggle('dark-mode');
        track.classList.toggle('active');
        showToast(container.classList.contains('dark-mode') ? 'تم تفعيل الوضع الداكن' : 'تم إلغاء الوضع الداكن');
    }
    
    function toggleMinimalMode() {
        var container = document.getElementById('mainContainer');
        var track = document.getElementById('minimalModeTrack');
        container.classList.toggle('minimal-mode');
        track.classList.toggle('active');
        showToast(container.classList.contains('minimal-mode') ? 'تم إخفاء العناصر' : 'تم إظهار العناصر');
    }
    
    function toggleTimer() {
        var val = parseInt(document.getElementById('timerSelect').value);
        if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
        if (val > 0) {
            timerInterval = setInterval(function() { shuffleQuote(); }, val * 1000);
            showToast('تم تفعيل المؤقت التلقائي كل ' + val + ' ثواني');
        } else {
            showToast('تم إيقاف المؤقت التلقائي');
        }
    }
    
    function prevQuote() { showQuote(currentIndex-1); }
    function nextQuote() { showQuote(currentIndex+1); }
    function openAllQuotes() { document.getElementById('allQuotesModal').classList.add('active'); displayAllQuotes(quotes); }
    function closeAllQuotes() { document.getElementById('allQuotesModal').classList.remove('active'); }
    function openAbout() { document.getElementById('aboutModal').classList.add('active'); }
    function closeAbout() { document.getElementById('aboutModal').classList.remove('active'); }
    function openSettings() { document.getElementById('settingsModal').classList.add('active'); }
    function closeSettings() { document.getElementById('settingsModal').classList.remove('active'); }
    function openSaveModal() { document.getElementById('saveModal').classList.add('active'); }
    function closeSaveModal() { document.getElementById('saveModal').classList.remove('active'); }
    
    function displayAllQuotes(arr) {
        var list = document.getElementById('quotesList');
        list.innerHTML = '';
        // إضافة قسم المفضلة في البداية
        if (favorites.length > 0) {
            var favHeader = document.createElement('h3');
            favHeader.textContent = 'المفضلة ❤️';
            favHeader.style.color = '#d4a843'; favHeader.style.margin = '15px 0';
            list.appendChild(favHeader);
            favorites.forEach((q, i) => {
                var item = document.createElement('div');
                item.className = 'quote-item';
                item.innerHTML = '<div class="q-text">'+q.text+'</div>';
                item.addEventListener('click',function(){ showQuote(quotes.findIndex(orig => orig.text === q.text)); closeAllQuotes(); });
                list.appendChild(item);
            });
            var allHeader = document.createElement('h3');
            allHeader.textContent = 'جميع الأقوال';
            allHeader.style.color = '#d4a843'; allHeader.style.margin = '15px 0';
            list.appendChild(allHeader);
        }
        
        for (var i=0;i<arr.length;i++) {
            (function(idx){
                var item = document.createElement('div');
                item.className = 'quote-item';
                item.innerHTML = '<div class="q-text">'+arr[idx].text+'</div><div class="q-number">#'+(idx+1)+'</div>';
                item.addEventListener('click',function(){ showQuote(idx); closeAllQuotes(); });
                list.appendChild(item);
            })(i);
        }
    }
    
    function searchQuotes() {
        var term = this.value.toLowerCase();
        var termClean = term.replace(/[ًٌٍَُِّْ]/g, '');
        var filtered = [];
        for (var i=0;i<quotes.length;i++) {
            var textClean = quotes[i].text.replace(/[ًٌٍَُِّْ]/g, '');
            if (textClean.toLowerCase().includes(termClean) || quotes[i].text.toLowerCase().includes(term)) {
                filtered.push(quotes[i]);
            }
        }
        displayAllQuotes(filtered);
    }
    
    function shareQuote() {
        var quote = quotes[currentIndex];
        if (!quote) return;
        var text = ' قال الإمام علي (عليه السلام):\n\n' + quote.text + '\n\n— موقع أقوال الإمام علي';
        if (navigator.share) {
            navigator.share({ title: 'أقوال الإمام علي', text: text, url: window.location.href })
                .then(() => showToast('تم المشاركة بنجاح'))
                .catch(() => showToast('تم إلغاء المشاركة'));
        } else {
            var textarea = document.createElement('textarea');
            textarea.value = text + '\n' + window.location.href;
            document.body.appendChild(textarea); textarea.select();
            document.execCommand('copy'); document.body.removeChild(textarea);
            showToast('تم نسخ النص للمشاركة');
        }
    }
    
    function handleSaveAction() {
        var format = downloadFormats.find(f => f.id === selectedFormat);
        if (format && format.isVideo) {
            saveAsVideo();
        } else {
            saveAsImage();
        }
    }
    
    function drawBackground(ctx, width, height, bgIndex) {
        var bg = backgrounds[bgIndex];
        if (bg.type === 'gradient') {
            var grad = ctx.createLinearGradient(0,0,width,height);
            grad.addColorStop(0, bg.colors[0]); grad.addColorStop(0.3, bg.colors[1]);
            grad.addColorStop(0.7, bg.colors[2] || bg.colors[1]); grad.addColorStop(1, bg.colors[3] || bg.colors[1]);
            ctx.fillStyle = grad; ctx.fillRect(0,0,width,height);
        } else if (bg.type === 'checkerboard') {
            var squareSize = Math.floor(width / 10);
            for (var i = 0; i < Math.ceil(width / squareSize); i++) {
                for (var j = 0; j < Math.ceil(height / squareSize); j++) {
                    ctx.fillStyle = (i + j) % 2 === 0 ? bg.colors[0] : bg.colors[1];
                    ctx.fillRect(i * squareSize, j * squareSize, squareSize, squareSize);
                }
            }
        } else if (bg.type === 'stripes') {
            var stripeWidth = Math.floor(width / 20);
            for (var i = 0; i < Math.ceil(width / stripeWidth); i++) {
                ctx.fillStyle = i % 2 === 0 ? bg.colors[0] : bg.colors[1];
                ctx.fillRect(i * stripeWidth, 0, stripeWidth, height);
            }
        } else if (bg.type === 'dots') {
            ctx.fillStyle = bg.colors[0]; ctx.fillRect(0, 0, width, height);
            var dotSize = Math.floor(width / 30); var spacing = dotSize * 2;
            ctx.fillStyle = bg.colors[1];
            for (var x = 0; x < width; x += spacing) {
                for (var y = 0; y < height; y += spacing) {
                    ctx.beginPath(); ctx.arc(x + spacing/2, y + spacing/2, dotSize/2, 0, Math.PI*2); ctx.fill();
                }
            }
        } else if (bg.type === 'grid') {
            ctx.fillStyle = bg.colors[0]; ctx.fillRect(0, 0, width, height);
            var gridSize = Math.floor(width / 15); ctx.strokeStyle = bg.colors[1]; ctx.lineWidth = 1;
            for (var i = 0; i <= width; i += gridSize) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke(); }
            for (var j = 0; j <= height; j += gridSize) { ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(width, j); ctx.stroke(); }
        } else if (bg.type === 'waves') {
            var grad = ctx.createLinearGradient(0, 0, 0, height);
            grad.addColorStop(0, bg.colors[0]); grad.addColorStop(0.5, bg.colors[1]); grad.addColorStop(1, bg.colors[2] || bg.colors[1]);
            ctx.fillStyle = grad; ctx.fillRect(0, 0, width, height);
            ctx.strokeStyle = 'rgba(212,168,67,0.1)'; ctx.lineWidth = 2;
            for (var waveOffset = 0; waveOffset < height; waveOffset += 40) {
                ctx.beginPath();
                for (var x = 0; x < width; x += 5) {
                    var y = waveOffset + Math.sin(x * 0.01) * 20;
                    if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
                }
                ctx.stroke();
            }
        }
    }
    
    function drawQuoteOnCanvas(ctx, canvas, quote, format, frame = 0) {
        if (format.transparent) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        } else {
            drawBackground(ctx, canvas.width, canvas.height, selectedBg);
            // رسم الشرار المتحرك للفيديو
            if (format.isVideo) {
                for (var i=0; i<30; i++) {
                    var p = {
                        x: (Math.sin(frame * 0.02 + i) * 0.5 + 0.5) * canvas.width,
                        y: ((frame * 2 + i * 100) % canvas.height),
                        size: (Math.sin(frame * 0.05 + i) + 2) * 2
                    };
                    ctx.fillStyle = 'rgba(255,200,50,0.4)';
                    ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); ctx.fill();
                }
            } else {
                for (var i=0;i<8;i++) {
                    var x=Math.random()*canvas.width, y=Math.random()*canvas.height, r=100+Math.random()*300;
                    var cg=ctx.createRadialGradient(x,y,0,x,y,r);
                    cg.addColorStop(0,'rgba(212,168,67,0.03)'); cg.addColorStop(1,'rgba(212,168,67,0)');
                    ctx.fillStyle=cg; ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
                }
            }
        }
        
        if (!format.transparent) {
            ctx.strokeStyle='rgba(212,168,67,0.1)'; ctx.lineWidth=3; ctx.strokeRect(100,100,canvas.width-200,canvas.height-200);
        }
        
        var padding = Math.floor(canvas.width * 0.08);
        var titleSize = Math.floor(canvas.width * 0.04);
        if (!format.transparent) {
            ctx.fillStyle='rgba(212,168,67,0.5)'; ctx.textAlign='center'; ctx.font=titleSize+'px "Amiri", serif';
            ctx.fillText('قال الإمام علي (عليه السلام)', canvas.width/2, padding + titleSize);
        }
        
        var cx=padding, cy=padding*3, cw=canvas.width-padding*2, ch=canvas.height-padding*6;
        if (!format.transparent) {
            ctx.fillStyle='rgba(255,255,255,0.04)'; roundRect(ctx,cx,cy,cw,ch,50); ctx.fill();
        }
        
        ctx.fillStyle=format.transparent ? '#d4a843' : '#f5f0e8'; ctx.textAlign='center'; ctx.textBaseline='middle';
        var tl=quote.text.length, bfs = Math.floor(canvas.width * (tl<=30?0.06:tl<=50?0.05:tl<=80?0.04:0.035));
        ctx.font=bfs+'px "Amiri", serif';
        
        var words=quote.text.split(' '), lines=[], cl='';
        for (var w=0;w<words.length;w++) {
            var tl2=cl+' '+words[w], m=ctx.measureText(tl2);
            if (m.width>(cw-padding)&&cl!==''){lines.push(cl);cl=words[w];}else{cl=tl2;}
        }
        lines.push(cl);
        
        var lh=bfs*1.8, sy=cy+ch/2-(lines.length-1)*lh/2;
        for (var l=0;l<lines.length;l++) {
            ctx.fillText(lines[l].trim(), canvas.width/2, sy+l*lh);
        }
        
        if (!format.transparent) {
            var sigSize = Math.floor(canvas.width * 0.02);
            ctx.fillStyle='rgba(255,255,255,0.2)'; 
            ctx.font=sigSize+'px Arial, sans-serif';
            ctx.fillText('insta : ne_7u', canvas.width/2, canvas.height-padding);
        }
    }
    
    function saveAsImage() {
        var quote = quotes[currentIndex]; if (!quote) return; closeSaveModal();
        var format = downloadFormats.find(f => f.id === selectedFormat) || downloadFormats[0];
        var canvas = document.getElementById('imageCanvas');
        var ctx = canvas.getContext('2d', { alpha: format.transparent });
        canvas.width = format.width; canvas.height = format.height;
        drawQuoteOnCanvas(ctx, canvas, quote, format);
        var link=document.createElement('a');
        link.download='قول_الإمام_علي_'+(currentIndex+1)+'.png';
        link.href=canvas.toDataURL('image/png'); link.click();
        showToast('تم حفظ الصورة بنجاح');
    }
    
    function saveAsVideo() {
        var quote = quotes[currentIndex]; if (!quote) return; closeSaveModal();
        if (isRecording) return; isRecording = true;
        
        var format = downloadFormats.find(f => f.id === 'video_story');
        var canvas = document.getElementById('imageCanvas');
        var ctx = canvas.getContext('2d');
        canvas.width = format.width; canvas.height = format.height;
        
        // إعداد الصوت
        var audio = new Audio('audio.ogg');
        var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        var source = audioCtx.createMediaElementSource(audio);
        var dest = audioCtx.createMediaStreamDestination();
        source.connect(dest);
        source.connect(audioCtx.destination);
        
        var canvasStream = canvas.captureStream(30);
        var combinedStream = new MediaStream([
            ...canvasStream.getVideoTracks(),
            ...dest.stream.getAudioTracks()
        ]);
        
        var recorder = new MediaRecorder(combinedStream, { mimeType: 'video/webm;codecs=vp9' });
        var chunks = [];
        
        recorder.ondataavailable = e => chunks.push(e.data);
        recorder.onstop = () => {
            var blob = new Blob(chunks, { type: 'video/webm' });
            var url = URL.createObjectURL(blob);
            var link = document.createElement('a');
            link.href = url; link.download = 'قول_الإمام_علي_فيديو.webm';
            link.click();
            isRecording = false;
            showToast('تم تصدير الفيديو بنجاح');
        };
        
        var frame = 0;
        var maxFrames = 300; // 10 ثواني بمعدل 30 إطار
        function recordFrame() {
            if (frame < maxFrames) {
                drawQuoteOnCanvas(ctx, canvas, quote, format, frame);
                frame++;
                requestAnimationFrame(recordFrame);
            } else {
                recorder.stop();
                audio.pause();
                audio.currentTime = 0;
            }
        }
        
        recorder.start();
        audio.play();
        recordFrame();
        showToast('جاري معالجة الفيديو مع الصوت (10 ثواني)...');
    }
    
    function roundRect(ctx,x,y,w,h,r) {
        if(w<2*r)r=w/2; if(h<2*r)r=h/2;
        ctx.beginPath(); ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y);
        ctx.quadraticCurveTo(x+w,y,x+w,y+r); ctx.lineTo(x+w,y+h-r);
        ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h); ctx.lineTo(x+r,y+h);
        ctx.quadraticCurveTo(x,y+h,x,y+h-r); ctx.lineTo(x,y+r);
        ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath();
    }
    
    function showToast(msg) {
        var t=document.getElementById('toast'); t.textContent=msg; t.classList.add('show');
        setTimeout(function(){t.classList.remove('show');},3000);
    }
    
    if (document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();

// دمج أشعار الديوان مع الأقوال الأصلية
if (typeof extraQuotesData !== 'undefined' && Array.isArray(extraQuotesData)) {
    quotes = quotes.concat(extraQuotesData);
    console.log('✓ تم دمج أشعار الديوان (' + extraQuotesData.length + ' قول جديد)');
}

