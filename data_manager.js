// ملف إدارة البيانات الجديد للأقسام الثلاثة
// سيتم تحميل هذا الملف في index.html بدلاً من quotes.js القديم

const AppData = {
    sections: {
        QUOTES: 'quotes',
        POETRY: 'poetry',
        BIOS: 'bios'
    },
    currentSection: 'quotes',
    data: {
        quotes: [],
        poetry: [],
        bios: []
    }
};

// ملاحظة: سيتم تعبئة AppData.data من الملفات المنفصلة (quotes_data.js, poetry_data.js, bios_data.js)
