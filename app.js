(function() {
    'use strict';
    
    var currentIndex = 0;
    var allData = {
        quotes: [],
        poetry: [],
        bios: []
    };
    var currentSection = 'quotes';
    var quotes = []; // المصفوفة الحالية النشطة
    var shownQuotes = [];
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
        // تجهيز البيانات من الملفات الخارجية
        if (typeof quotesData !== 'undefined') {
            allData.quotes = quotesData.map(q => ({ 
                text: q.full || q.text, 
                theme: q.theme || 'حكمة',
                original: q // الاحتفاظ بالبيانات الأصلية للصدر والعجز إذا وجدت
            }));
        }
        
        if (typeof extraQuotesData !== 'undefined') {
            allData.quotes = allData.quotes.concat(extraQuotesData.map(q => ({ text: q.text, theme: 'من الديوان' })));
        }

        if (typeof poetryData !== 'undefined') {
            allData.poetry = poetryData.map(p => ({ 
                text: p.lines.join('\n'), 
                theme: p.title || 'شعر علوي',
                lines: p.lines // حفظ الأسطر منفصلة للعرض
            }));
        }

        if (typeof biosData !== 'undefined') {
            allData.bios = biosData.map(b => ({ text: b.quote, theme: b.title || 'نبذة تعريفية' }));
        }

        // تعيين القسم الافتراضي (الاقتباسات)
        switchSection('quotes');
        
        initParticles();
        initBgGrid();
        initFormatSelector();
        
        // ربط الأحداث
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

        // أحداث الأقسام الثلاثة
        document.getElementById('sectionQuotesBtn').addEventListener('click', () => switchSection('quotes'));
        document.getElementById('sectionPoetryBtn').addEventListener('click', () => switchSection('poetry'));
        document.getElementById('sectionBiosBtn').addEventListener('click', () => switchSection('bios'));
        
        // أحداث تحذير الشعر
        document.getElementById('poetryWarningIcon').addEventListener('click', (e) => {
            e.stopPropagation();
            document.getElementById('poetryWarningModal').classList.add('active');
        });
        document.getElementById('closePoetryWarning').addEventListener('click', () => {
            document.getElementById('poetryWarningModal').classList.remove('active');
        });
        document.getElementById('confirmPoetryWarning').addEventListener('click', () => {
            document.getElementById('poetryWarningModal').classList.remove('active');
        });
        
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

    function switchSection(section) {
        currentSection = section;
        quotes = allData[section] || [];
        currentIndex = 0;
        shownQuotes = [];
        
        // تحديث شكل الأزرار
        document.querySelectorAll('.section-btn').forEach(btn => btn.classList.remove('active'));
        if (section === 'quotes') document.getElementById('sectionQuotesBtn').classList.add('active');
        if (section === 'poetry') document.getElementById('sectionPoetryBtn').classList.add('active');
        if (section === 'bios') document.getElementById('sectionBiosBtn').classList.add('active');
        
        // تحديث العناوين في الواجهة بناءً على القسم
        const titles = { 'quotes': 'أقوال الإمام علي', 'poetry': 'أشعار الإمام علي', 'bios': 'نبذات تعريفية' };
        document.querySelector('header h1').textContent = titles[section];
        
        if (quotes.length > 0) {
            shuffleQuote();
        } else {
            document.getElementById('quoteContent').textContent = 'لا توجد بيانات متاحة في هذا القسم';
        }
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
        var item = quotes[currentIndex];
        
        var titleEl = document.getElementById('contentTitle');
        var textEl = document.getElementById('quoteContent');
        var poetryEl = document.getElementById('poetryContent');
        
        // تحديث العنوان
        titleEl.textContent = item.theme;
        
        if (currentSection === 'poetry' && item.lines) {
            // عرض الشعر بتنسيق صدر وعجز
            textEl.style.display = 'none';
            poetryEl.style.display = 'flex';
            poetryEl.innerHTML = '';
            
            for (var i = 0; i < item.lines.length; i += 2) {
                var lineDiv = document.createElement('div');
                lineDiv.className = 'poetry-line';
                
                var sadr = item.lines[i] || '';
                var ajuz = item.lines[i+1] || '';
                
                lineDiv.innerHTML = '<div class="poetry-part sadr">' + sadr + '</div>' + 
                                    '<div class="poetry-part ajuz">' + ajuz + '</div>';
                poetryEl.appendChild(lineDiv);
            }
        } else if (currentSection === 'quotes' && item.original && item.original.first) {
            // عرض الاقتباسات التي تحتوي على شطرين بتنسيق صدر وعجز
            textEl.style.display = 'none';
            poetryEl.style.display = 'flex';
            poetryEl.innerHTML = '<div class="poetry-line">' + 
                                 '<div class="poetry-part sadr">' + item.original.first + '</div>' + 
                                 '<div class="poetry-part ajuz">' + item.original.second + '</div>' + 
                                 '</div>';
        } else {
            // عرض النص العادي للاقتباسات والنبذات
            poetryEl.style.display = 'none';
            textEl.style.display = 'block';
            textEl.textContent = item.text;
        }
        
        updateFontSize(item.text.length);
        updateFavoriteButton();
    }
    
    function shuffleQuote() {
        if (shownQuotes.length >= quotes.length) shownQuotes = [];
        var nextIdx;
        do {
            nextIdx = Math.floor(Math.random() * quotes.length);
        } while (shownQuotes.includes(nextIdx) && quotes.length > 1);
        
        shownQuotes.push(nextIdx);
        showQuote(nextIdx);
        showToast('تم اختيار عشوائي');
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
        if (!btn || !quotes[currentIndex]) return;
        var isFav = favorites.some(f => f.text === quotes[currentIndex].text);
        btn.innerHTML = isFav ? '❤️' : '🤍';
    }
    
    function prevQuote() { showQuote(currentIndex - 1); }
    function nextQuote() { showQuote(currentIndex + 1); }
    
    function updateFontSize(length) {
        var baseSize = 1.5;
        if (length > 100) baseSize = 1.2;
        if (length > 200) baseSize = 1.0;
        if (length > 300) baseSize = 0.9;
        document.getElementById('quoteContent').style.fontSize = (baseSize * fontSizeMultiplier) + 'em';
    }
    
    function changeFontSize() {
        var val = document.getElementById('fontSizeSelect').value;
        if (val === 'small') fontSizeMultiplier = 0.8;
        else if (val === 'medium') fontSizeMultiplier = 1;
        else if (val === 'large') fontSizeMultiplier = 1.3;
        else if (val === 'xlarge') fontSizeMultiplier = 1.6;
        updateFontSize(quotes[currentIndex].text.length);
    }
    
    function toggleDarkMode() {
        document.getElementById('mainContainer').classList.toggle('dark-mode');
        document.getElementById('darkModeTrack').classList.toggle('active');
    }
    
    function toggleMinimalMode() {
        document.getElementById('mainContainer').classList.toggle('minimal-mode');
        document.getElementById('minimalModeTrack').classList.toggle('active');
        if (document.getElementById('mainContainer').classList.contains('minimal-mode')) {
            showToast('اضغط ESC للخروج من الوضع المبسط');
        }
    }
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && document.getElementById('mainContainer').classList.contains('minimal-mode')) {
            toggleMinimalMode();
        }
    });
    
    function toggleTimer() {
        var val = parseInt(document.getElementById('timerSelect').value);
        if (timerInterval) clearInterval(timerInterval);
        if (val > 0) {
            timerInterval = setInterval(shuffleQuote, val * 1000);
            showToast('تم تفعيل المؤقت التلقائي');
        }
    }
    
    function openAllQuotes() {
        document.getElementById('allQuotesModal').classList.add('active');
        renderQuotesList(quotes);
    }
    
    function closeAllQuotes() { document.getElementById('allQuotesModal').classList.remove('active'); }
    function openAbout() { document.getElementById('aboutModal').classList.add('active'); }
    function closeAbout() { document.getElementById('aboutModal').classList.remove('active'); }
    function openSettings() { document.getElementById('settingsModal').classList.add('active'); }
    function closeSettings() { document.getElementById('settingsModal').classList.remove('active'); }
    function openSaveModal() { document.getElementById('saveModal').classList.add('active'); }
    function closeSaveModal() { document.getElementById('saveModal').classList.remove('active'); }
    
    function renderQuotesList(data) {
        var list = document.getElementById('quotesList');
        list.innerHTML = '';
        
        // استخراج التصنيفات الفريدة للقسم الحالي
        var themes = [...new Set(data.map(q => q.theme))];
        var themeFilter = document.createElement('div');
        themeFilter.className = 'theme-filters';
        themeFilter.style.display = 'flex';
        themeFilter.style.flexWrap = 'wrap';
        themeFilter.style.gap = '8px';
        themeFilter.style.marginBottom = '15px';
        
        var allBtn = document.createElement('button');
        allBtn.textContent = 'الكل';
        allBtn.className = 'btn btn-primary';
        allBtn.style.padding = '5px 10px';
        allBtn.addEventListener('click', () => filterByTheme(null));
        themeFilter.appendChild(allBtn);
        
        themes.forEach(theme => {
            var btn = document.createElement('button');
            btn.textContent = theme;
            btn.className = 'btn btn-secondary';
            btn.style.padding = '5px 10px';
            btn.addEventListener('click', () => filterByTheme(theme));
            themeFilter.appendChild(btn);
        });
        
        list.appendChild(themeFilter);
        
        var itemsContainer = document.createElement('div');
        itemsContainer.id = 'itemsContainer';
        list.appendChild(itemsContainer);
        
        function filterByTheme(theme) {
            var filtered = theme ? data.filter(q => q.theme === theme) : data;
            displayItems(filtered);
        }
        
        function displayItems(items) {
            itemsContainer.innerHTML = '';
            items.forEach((q, idx) => {
                var item = document.createElement('div');
                item.className = 'quote-item';
                item.style.padding = '15px';
                item.style.borderBottom = '1px solid rgba(212,168,67,0.1)';
                item.style.cursor = 'pointer';
                item.innerHTML = '<div style="color:#d4a843; font-size:0.8em; margin-bottom:5px;">' + q.theme + '</div>' + 
                                 '<div style="color:#f5f0e8;">' + q.text.substring(0, 100) + (q.text.length > 100 ? '...' : '') + '</div>';
                item.addEventListener('click', function() {
                    var originalIdx = data.findIndex(item => item.text === q.text);
                    showQuote(originalIdx);
                    closeAllQuotes();
                });
                itemsContainer.appendChild(item);
            });
        }
        
        displayItems(data);
    }
    
    function searchQuotes() {
        var term = document.getElementById('searchInput').value.toLowerCase();
        var filtered = quotes.filter(q => q.text.toLowerCase().includes(term) || q.theme.toLowerCase().includes(term));
        var container = document.getElementById('itemsContainer');
        if (container) {
            container.innerHTML = '';
            filtered.forEach((q) => {
                var item = document.createElement('div');
                item.className = 'quote-item';
                item.style.padding = '15px';
                item.style.borderBottom = '1px solid rgba(212,168,67,0.1)';
                item.style.cursor = 'pointer';
                item.innerHTML = '<div style="color:#d4a843; font-size:0.8em; margin-bottom:5px;">' + q.theme + '</div>' + 
                                 '<div style="color:#f5f0e8;">' + q.text.substring(0, 100) + (q.text.length > 100 ? '...' : '') + '</div>';
                item.addEventListener('click', function() {
                    var originalIdx = quotes.findIndex(item => item.text === q.text);
                    showQuote(originalIdx);
                    closeAllQuotes();
                });
                container.appendChild(item);
            });
        }
    }
    
    function shareQuote() {
        var text = '﴿ ' + quotes[currentIndex].text + ' ﴾\n\n— الإمام علي بن أبي طالب (عليه السلام)';
        if (navigator.share) {
            navigator.share({ title: 'حكمة علوية', text: text }).catch(() => {});
        } else {
            var temp = document.createElement('textarea');
            temp.value = text; document.body.appendChild(temp);
            temp.select(); document.execCommand('copy');
            document.body.removeChild(temp);
            showToast('تم نسخ الحكمة للمشاركة');
        }
    }
    
    function handleSaveAction() {
        var format = downloadFormats.find(f => f.id === selectedFormat);
        if (format && format.isVideo) saveAsVideo(); else saveAsImage();
    }
    
    function drawQuoteOnCanvas(ctx, canvas, quote, format, frame) {
        var bg = backgrounds[selectedBg];
        var padding = canvas.width * 0.08;
        
        if (format.transparent) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        } else {
            if (bg.type === 'gradient') {
                var grd = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
                bg.colors.forEach((c, i) => grd.addColorStop(i / (bg.colors.length - 1), c));
                ctx.fillStyle = grd; ctx.fillRect(0, 0, canvas.width, canvas.height);
            } else {
                ctx.fillStyle = bg.colors[0]; ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            
            if (frame !== undefined) {
                ctx.fillStyle = 'rgba(212, 168, 67, 0.3)';
                for (var i = 0; i < 50; i++) {
                    var x = (Math.sin(frame * 0.05 + i) * 0.5 + 0.5) * canvas.width;
                    var y = ((frame * 2 + i * 50) % canvas.height);
                    ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill();
                }
            }
        }
        
        var cw = canvas.width - padding * 2, ch = canvas.height - padding * 4;
        var cx = padding, cy = padding * 2;
        
        if (!format.transparent) {
            ctx.fillStyle = 'rgba(255,255,255,0.04)'; roundRect(ctx, cx, cy, cw, ch, 50); ctx.fill();
        }
        
        // رسم العنوان في الأعلى
        var titleSize = Math.floor(canvas.width * 0.03);
        ctx.fillStyle = '#d4a843'; ctx.font = 'bold ' + titleSize + 'px "Cairo", sans-serif';
        ctx.fillText(quote.theme, canvas.width / 2, cy + padding);

        ctx.fillStyle = format.transparent ? '#d4a843' : '#f5f0e8'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        
        var isPoetryMode = (currentSection === 'poetry' && quote.lines) || (currentSection === 'quotes' && quote.original && quote.original.first);
        
        if (isPoetryMode) {
            var pLines = quote.lines || [quote.original.first, quote.original.second];
            var bfs = Math.floor(canvas.width * 0.04);
            ctx.font = bfs + 'px "Amiri", serif';
            var lh = bfs * 2, th = (pLines.length / 2) * lh, sy = canvas.height / 2 - th / 2;
            
            // رسم الأقواس
            ctx.font = (bfs * 1.5) + 'px "Amiri", serif';
            ctx.fillText('﴿', canvas.width / 2, sy - lh/2);
            ctx.fillText('﴾', canvas.width / 2, sy + th + lh/2);
            
            ctx.font = bfs + 'px "Amiri", serif';
            for (var l = 0; l < pLines.length; l += 2) {
                var rowY = sy + (l / 2) * lh;
                ctx.textAlign = 'right'; ctx.fillText(pLines[l], canvas.width / 2 - 20, rowY);
                ctx.textAlign = 'left'; ctx.fillText(pLines[l+1] || '', canvas.width / 2 + 20, rowY);
            }
        } else {
            var tl = quote.text.length, bfs = Math.floor(canvas.width * (tl <= 30 ? 0.06 : tl <= 50 ? 0.05 : tl <= 80 ? 0.04 : 0.035));
            ctx.font = bfs + 'px "Amiri", serif';
            var words = quote.text.split(' '), lines = [], cl = '';
            for (var w = 0; w < words.length; w++) {
                var tl2 = cl + ' ' + words[w], m = ctx.measureText(tl2);
                if (m.width > cw - 60) { lines.push(cl); cl = words[w]; } else { cl = tl2; }
            }
            lines.push(cl);
            var lh = bfs * 1.5, th = lines.length * lh, sy = canvas.height / 2 - th / 2 + lh / 2;
            
            ctx.font = (bfs * 1.2) + 'px "Amiri", serif';
            ctx.fillText('﴿', canvas.width / 2, sy - lh);
            ctx.fillText('﴾', canvas.width / 2, sy + th);
            
            ctx.font = bfs + 'px "Amiri", serif';
            for (var l = 0; l < lines.length; l++) {
                ctx.fillText(lines[l].trim(), canvas.width / 2, sy + l * lh);
            }
        }
        
        if (!format.transparent) {
            var sigSize = Math.floor(canvas.width * 0.02);
            ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.textAlign = 'center';
            ctx.font = sigSize + 'px Arial, sans-serif';
            ctx.fillText('insta : ne_7u', canvas.width / 2, canvas.height - padding);
        }
    }
    
    function saveAsImage() {
        var quote = quotes[currentIndex]; if (!quote) return; closeSaveModal();
        var format = downloadFormats.find(f => f.id === selectedFormat) || downloadFormats[0];
        var canvas = document.getElementById('imageCanvas');
        var ctx = canvas.getContext('2d', { alpha: format.transparent });
        canvas.width = format.width; canvas.height = format.height;
        drawQuoteOnCanvas(ctx, canvas, quote, format);
        var link = document.createElement('a');
        link.download = 'أمام_علي_' + (currentIndex + 1) + '.png';
        link.href = canvas.toDataURL('image/png'); link.click();
        showToast('تم حفظ الصورة بنجاح');
    }
    
    function saveAsVideo() {
        var quote = quotes[currentIndex]; if (!quote) return; closeSaveModal();
        if (isRecording) return; isRecording = true;
        
        var format = downloadFormats.find(f => f.id === 'video_story');
        var canvas = document.getElementById('imageCanvas');
        var ctx = canvas.getContext('2d');
        canvas.width = format.width; canvas.height = format.height;
        
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
            link.href = url; link.download = 'أمام_علي_فيديو.webm';
            link.click();
            isRecording = false;
            showToast('تم تصدير الفيديو بنجاح');
        };
        
        var frame = 0;
        var maxFrames = 300; 
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
        showToast('جاري معالجة الفيديو (10 ثواني)...');
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
        var t = document.getElementById('toast'); t.textContent = msg; t.classList.add('show');
        setTimeout(function(){t.classList.remove('show');},3000);
    }
    
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
