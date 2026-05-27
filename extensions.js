// ملف الإضافات الموحد - يحتوي على كافة الميزات الجديدة

// ========== نظام التصنيفات الذكي ==========
var categoriesData = {
    'الصبر': { icon: '⏳', color: '#8B7355', keywords: ['صبر', 'صابر', 'تصبر'] },
    'العدل': { icon: '⚖️', color: '#4A90E2', keywords: ['عدل', 'عادل', 'ظلم'] },
    'الحكمة': { icon: '🧠', color: '#F5A623', keywords: ['حكمة', 'حكيم', 'علم'] },
    'الشجاعة': { icon: '⚔️', color: '#D0021B', keywords: ['شجاع', 'شجاعة', 'جرأة'] },
    'الزهد': { icon: '🕌', color: '#7ED321', keywords: ['زهد', 'زاهد', 'دنيا'] },
    'الأخلاق': { icon: '❤️', color: '#FF6B6B', keywords: ['أخلاق', 'خلق', 'أدب'] },
    'القناعة': { icon: '😌', color: '#50E3C2', keywords: ['قناعة', 'راضي', 'رضا'] },
    'العلم': { icon: '📚', color: '#B8E986', keywords: ['علم', 'عالم', 'تعلم'] },
    'الدين': { icon: '✨', color: '#9013FE', keywords: ['دين', 'إيمان', 'تقوى'] },
    'الحب': { icon: '💕', color: '#FF1493', keywords: ['حب', 'محبة', 'ود'] },
    'الموت': { icon: '🕯️', color: '#696969', keywords: ['موت', 'مات', 'آخرة'] },
    'النفس': { icon: '🔮', color: '#BA55D3', keywords: ['نفس', 'نفسي', 'روح'] }
};

function categorizeQuote(quoteText) {
    var categories = [];
    var textLower = quoteText.toLowerCase();
    for (var cat in categoriesData) {
        var keywords = categoriesData[cat].keywords;
        for (var i = 0; i < keywords.length; i++) {
            if (textLower.includes(keywords[i])) {
                if (!categories.includes(cat)) categories.push(cat);
                break;
            }
        }
    }
    return categories.length > 0 ? categories : ['عام'];
}

function getDailyWisdomIndex(quotesArray) {
    var today = new Date();
    var dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
    return dayOfYear % quotesArray.length;
}

// ========== الخطوط والأنسجة ==========
var arabicFonts = [
    { name: 'أميري', family: "'Amiri', serif" },
    { name: 'القاهرة', family: "'Cairo', sans-serif" },
    { name: 'جزيرة', family: "'Jomhuria', cursive" },
    { name: 'تاجا', family: "'Tajawal', sans-serif" }
];

var texturesData = {
    'بدون': { apply: function(ctx, w, h) {} },
    'ورق': { apply: function(ctx, w, h) {
        var imageData = ctx.createImageData(w, h);
        var data = imageData.data;
        for (var i = 0; i < data.length; i += 4) {
            var noise = Math.random() * 30;
            data[i] += noise; data[i+1] += noise; data[i+2] += noise;
        }
        ctx.putImageData(imageData, 0, 0);
    }},
    'رخام': { apply: function(ctx, w, h) {
        for (var x = 0; x < w; x += 10) {
            for (var y = 0; y < h; y += 10) {
                ctx.fillStyle = 'rgba(255,255,255,' + (Math.random() * 0.1) + ')';
                ctx.fillRect(x, y, 10, 10);
            }
        }
    }},
    'قماش': { apply: function(ctx, w, h) {
        for (var x = 0; x < w; x += 3) {
            ctx.strokeStyle = 'rgba(255,255,255,0.05)';
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
        }
        for (var y = 0; y < h; y += 3) {
            ctx.strokeStyle = 'rgba(255,255,255,0.05)';
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
        }
    }}
};

function applyTexture(ctx, width, height, textureName) {
    if (texturesData[textureName] && texturesData[textureName].apply) {
        texturesData[textureName].apply(ctx, width, height);
    }
}

// ========== حساس الحركة (Gyroscope) ==========
var gyroscopeData = { alpha: 0, beta: 0, gamma: 0, enabled: false };

function initGyroscope() {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission().then(permissionState => {
            if (permissionState === 'granted') {
                window.addEventListener('deviceorientation', handleDeviceOrientation);
                gyroscopeData.enabled = true;
            }
        }).catch(console.error);
    } else if (typeof DeviceOrientationEvent !== 'undefined') {
        window.addEventListener('deviceorientation', handleDeviceOrientation);
        gyroscopeData.enabled = true;
    }
}

function handleDeviceOrientation(event) {
    gyroscopeData.alpha = event.alpha || 0;
    gyroscopeData.beta = event.beta || 0;
    gyroscopeData.gamma = event.gamma || 0;
}

function applyGyroscopeToParticles(particles) {
    if (!gyroscopeData.enabled) return;
    var betaInfluence = (gyroscopeData.beta / 180) * 2;
    var gammaInfluence = (gyroscopeData.gamma / 90) * 2;
    for (var i = 0; i < particles.length; i++) {
        particles[i].speedX += betaInfluence * 0.1;
        particles[i].speedY += gammaInfluence * 0.1;
        var maxSpeed = 2;
        if (Math.abs(particles[i].speedX) > maxSpeed) {
            particles[i].speedX = maxSpeed * (particles[i].speedX / Math.abs(particles[i].speedX));
        }
        if (Math.abs(particles[i].speedY) > maxSpeed) {
            particles[i].speedY = maxSpeed * (particles[i].speedY / Math.abs(particles[i].speedY));
        }
    }
}

// ========== إحصائيات الاستخدام ==========
var userStats = {
    quotesRead: localStorage.getItem('quotesRead') ? parseInt(localStorage.getItem('quotesRead')) : 0,
    favoritesCount: localStorage.getItem('favoritesCount') ? parseInt(localStorage.getItem('favoritesCount')) : 0,
    
    incrementQuotesRead: function() {
        this.quotesRead++;
        localStorage.setItem('quotesRead', this.quotesRead);
    },
    
    updateFavoritesCount: function(count) {
        this.favoritesCount = count;
        localStorage.setItem('favoritesCount', count);
    },
    
    getStats: function() {
        return { read: this.quotesRead, favorites: this.favoritesCount };
    }
};

// تهيئة حساس الحركة عند تحميل الصفحة
window.addEventListener('load', function() {
    initGyroscope();
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        var btn = document.createElement('button');
        btn.textContent = 'تفعيل حساس الحركة';
        btn.style.cssText = 'position: fixed; bottom: 20px; left: 20px; padding: 10px 20px; background: #d4a843; color: #0a0505; border: none; border-radius: 10px; cursor: pointer; z-index: 999; font-family: Cairo, sans-serif; font-size: 0.8em;';
        btn.addEventListener('click', function() { initGyroscope(); btn.remove(); });
        document.body.appendChild(btn);
    }
});
