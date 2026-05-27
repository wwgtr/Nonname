// ملف الإضافات الموحد - يحتوي على كافة الميزات الجديدة (بدون حساس الحركة)

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

// ========== الخطوط العربية ==========
var arabicFonts = [
    { name: 'أميري', family: "'Amiri', serif" },
    { name: 'القاهرة', family: "'Cairo', sans-serif" },
    { name: 'جزيرة', family: "'Jomhuria', cursive" },
    { name: 'تاجا', family: "'Tajawal', sans-serif" }
];

// ========== الأنسجة ==========
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
