import fs from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const repoRoot = process.cwd();

const files = execFileSync('git', ['ls-files'], { encoding: 'utf8' })
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .filter(filePath => {
        if (filePath.startsWith('dist/')) return false;
        if (filePath.startsWith('node_modules/')) return false;
        return (
            filePath.endsWith('.ts') ||
            filePath.endsWith('.tsx') ||
            filePath.endsWith('.js') ||
            filePath.endsWith('.jsx') ||
            filePath.endsWith('.css') ||
            filePath.endsWith('.html')
        );
    });

const replacements = [
    // 1. Specific High-Priority Multi-token pairs
    [/bg-white dark:bg-zinc-900/g, 'bg-surface'],
    [/bg-gray-50 dark:bg-zinc-900/g, 'bg-surfaceTint'],
    [/bg-gray-100 dark:bg-zinc-800/g, 'bg-surfaceElevated'],
    [/bg-white dark:bg-zinc-800/g, 'bg-surface'],
    [/bg-gray-50 dark:bg-zinc-800/g, 'bg-surfaceElevated'],
    [/bg-white dark:bg-white\/5/g, 'bg-surfaceGlass'],
    [/bg-white dark:bg-black/g, 'bg-bg'],
    [/bg-gray-50 dark:bg-black/g, 'bg-bg'],
    [/border-gray-200 dark:border-white\/10/g, 'border-borderSubtle'],
    [/border-gray-100 dark:border-white\/5/g, 'border-borderSoft'],
    [/text-gray-900 dark:text-white/g, 'text-textPrimary'],
    [/text-gray-600 dark:text-gray-300/g, 'text-textSecondary'],
    [/text-gray-500 dark:text-gray-400/g, 'text-textMuted'],

    // 2. Clear out all 'dark:' variants 
    [/dark:[a-z0-9\/:-]+/g, ''],

    // 3. Robust legacy color replacements
    [/\b(bg|text|border|from|via|to|ring|focus:ring|hover:bg|hover:text|hover:border)-indigo-\d+/g, '$1-accent'],
    [/\b(bg|text|border|from|via|to|ring|focus:ring|hover:bg|hover:text|hover:border)-green-\d+/g, '$1-success'],

    [/\bbg-gray-(50|100)\b/g, 'bg-surfaceTint'],
    [/\bbg-gray-(200|300)\b/g, 'bg-surfaceElevated'],
    [/\bbg-white\b/g, 'bg-surface'],

    [/\btext-gray-(900|800)\b/g, 'text-textPrimary'],
    [/\btext-gray-(600|700)\b/g, 'text-textSecondary'],
    [/\btext-gray-(400|500|300)\b/g, 'text-textMuted'],

    [/\bborder-gray-(100|200|300)\b/g, 'border-borderSubtle'],

    // Catch-all for Slate/Neutral/Zinc
    [/\bbg-(slate|neutral|zinc)-(50|100)\b/g, 'bg-surfaceTint'],
    [/\bbg-(slate|neutral|zinc)-(200|300|800|900)\b/g, 'bg-surfaceElevated'],
    [/\btext-(slate|neutral|zinc)-(900|800)\b/g, 'text-textPrimary'],
    [/\btext-(slate|neutral|zinc)-(600|700)\b/g, 'text-textSecondary'],
    [/\btext-(slate|neutral|zinc)-(400|500|300)\b/g, 'text-textMuted'],
    [/\bborder-(slate|neutral|zinc)-\d+/g, 'border-borderSubtle'],

    // 4. Forbidden patterns from check:tokens
    [/shadow-\[[^\]]+\]/g, 'shadow-sm'], // Arbitrary shadows
    [/\bbg-(bg|surface|surfaceElevated|surfaceTint)\/\d+\b/g, 'bg-surfaceSoft'], // Opacity on tokens

    // 5. Cleanup redundant/duplicate tokens
    [/bg-surface bg-surface/g, 'bg-surface'],
    [/text-textPrimary text-textPrimary/g, 'text-textPrimary'],
    [/border-borderSubtle border-borderSubtle/g, 'border-borderSubtle'],
    [/bg-bg bg-bg/g, 'bg-bg'],
    [/text-accent text-accent/g, 'text-accent'],
    [/Secondary Secondary/g, 'Secondary'],
    [/text-textSecondary Secondary/g, 'text-textSecondary'],
];

for (const filePath of files) {
    const absPath = path.join(repoRoot, filePath);
    let contents = '';
    try {
        contents = await fs.readFile(absPath, 'utf8');
    } catch (error) {
        continue;
    }

    let newContents = contents;
    for (const [pattern, replacement] of replacements) {
        newContents = newContents.replace(pattern, replacement);
    }

    if (newContents !== contents) {
        await fs.writeFile(absPath, newContents, 'utf8');
        console.log(`Cleaned: ${filePath}`);
    }
}
