const fs = require('fs');

try {
    // 1. معالجة الاقتباسات
    const rawQuotes = fs.readFileSync('/home/ubuntu/new_data_v2/اقتباسات.js', 'utf8');
    const quotesMatch = rawQuotes.match(/const quotes = (\[[\s\S]*?\]);/);
    if (quotesMatch) {
        fs.writeFileSync('/home/ubuntu/amam-AL/quotes_data.js', `const quotesData = ${quotesMatch[1]};`);
    }

    // 2. معالجة الشعر
    const rawPoetry = fs.readFileSync('/home/ubuntu/new_data_v2/شعر.js', 'utf8');
    const poetryMatch = rawPoetry.match(/const poems = (\[[\s\S]*?\]);/);
    if (poetryMatch) {
        fs.writeFileSync('/home/ubuntu/amam-AL/poetry_data.js', `const poetryData = ${poetryMatch[1]};`);
    }

    // 3. معالجة النبذات
    const rawBios = fs.readFileSync('/home/ubuntu/new_data_v2/نبذات.js', 'utf8');
    const biosMatch = rawBios.match(/const bios = (\[[\s\S]*?\]);/);
    if (biosMatch) {
        fs.writeFileSync('/home/ubuntu/amam-AL/bios_data.js', `const biosData = ${biosMatch[1]};`);
    }

    console.log('Data processing completed successfully.');
} catch (error) {
    console.error('Error processing data:', error);
}
