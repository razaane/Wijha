const fs = require('fs');

const file = 'frontend/src/app/settings/page.tsx';

const replacements = [
    { regex: /\bbg-white\b/g, replacement: 'bg-white dark:bg-neutral-900' },
    { regex: /\bbg-neutral-50\b/g, replacement: 'bg-neutral-50 dark:bg-neutral-900' },
    { regex: /\bbg-neutral-100\b/g, replacement: 'bg-neutral-100 dark:bg-neutral-800' },
    { regex: /\btext-neutral-900\b/g, replacement: 'text-neutral-900 dark:text-white' },
    { regex: /\btext-neutral-800\b/g, replacement: 'text-neutral-800 dark:text-neutral-200' },
    { regex: /\btext-neutral-700\b/g, replacement: 'text-neutral-700 dark:text-neutral-300' },
    { regex: /\btext-neutral-600\b/g, replacement: 'text-neutral-600 dark:text-neutral-400' },
    { regex: /\btext-neutral-500\b/g, replacement: 'text-neutral-500 dark:text-neutral-400' },
    { regex: /\bborder-neutral-300\b/g, replacement: 'border-neutral-300 dark:border-neutral-700' },
    { regex: /\bborder-neutral-200\b/g, replacement: 'border-neutral-200 dark:border-neutral-800' },
    { regex: /\bborder-neutral-100\b/g, replacement: 'border-neutral-100 dark:border-neutral-800' }
];

const fullPath = '/home/kerymy/Desktop/Wijha/' + file;
if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    replacements.forEach(({regex, replacement}) => {
        // Only replace if it doesn't already have dark: right after it
        // A simple way is to replace, then clean up double dark: if any.
        // But since we know the file is partially done, it might be safer to use a regex that avoids matches followed by dark:
    });
}
