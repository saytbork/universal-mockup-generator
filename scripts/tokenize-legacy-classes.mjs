import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const repoRoot = process.cwd();

const files = execFileSync('git', ['ls-files'], { encoding: 'utf8' })
  .split('\n')
  .map(line => line.trim())
  .filter(Boolean)
  .filter(filePath => {
    if (filePath === 'globals.css') return false;
    if (filePath.startsWith('dist/')) return false;
    if (filePath.startsWith('node_modules/')) return false;
    if (filePath.endsWith('.png') || filePath.endsWith('.jpg') || filePath.endsWith('.jpeg') || filePath.endsWith('.webp')) return false;
    return (
      filePath.endsWith('.ts') ||
      filePath.endsWith('.tsx') ||
      filePath.endsWith('.js') ||
      filePath.endsWith('.jsx') ||
      filePath.endsWith('.css') ||
      filePath.endsWith('.html') ||
      filePath.endsWith('.md')
    );
  });

const replacements = [
  // Backgrounds (dark legacy -> bg tokens)
  [/\bbg-gray-950\b/g, 'bg-bg'],
  [/\bbg-gray-900\b/g, 'bg-bg'],
  [/\bbg-black\b/g, 'bg-bg'],
  [/\bbg-gray-700\b/g, 'bg-surfaceTint'],
  [/\bbg-gray-600\b/g, 'bg-surfaceTint'],
  [/\bbg-gray-100\b/g, 'bg-surfaceTint'],
  [/\bbg-gray-50\b/g, 'bg-surfaceTint'],
  [/\bbg-gray-900\/(60|50|40|30|20)\b/g, 'bg-surfaceTint'],
  [/\bbg-gray-800\/(60|50|40|30|20)\b/g, 'bg-surfaceTint'],
  [/\bbg-gray-700\/20\b/g, 'bg-surfaceTint'],
  [/\bbg-black\/(60|50|40|30|20)\b/g, 'bg-surfaceTint'],
  [/\bbg-white\/5\b/g, 'bg-surfaceTint'],
  [/\bbg-gray-800\b/g, 'bg-surface'],
  [/\bbg-white\b/g, 'bg-surface'],

  // Text grays
  [/\btext-gray-900\b/g, 'text-textPrimary'],
  [/\btext-gray-200\b/g, 'text-textPrimary'],
  [/\btext-gray-100\b/g, 'text-textPrimary'],
  [/\btext-gray-300\b/g, 'text-textSecondary'],
  [/\btext-gray-400\b/g, 'text-textSecondary'],
  [/\btext-gray-500\b/g, 'text-textMuted'],
  [/\btext-gray-600\b/g, 'text-textMuted'],
  [/\btext-gray-700\b/g, 'text-textSecondary'],

  // Borders
  [/\bborder-gray-200\b/g, 'border-border'],
  [/\bborder-gray-300\b/g, 'border-borderStrong'],
  [/\bborder-gray-400\b/g, 'border-borderStrong'],
  [/\bborder-gray-600\b/g, 'border-border'],
  [/\bborder-gray-700\b/g, 'border-border'],
  [/\bborder-white\/(5|10|15|20)\b/g, 'border-border'],
  [/\bborder-white\/30\b/g, 'border-borderStrong'],
  [/\bborder-border\/70\b/g, 'border-border'],

  // Rings
  [/\bring-white\/20\b/g, 'ring-border'],
  [/\bring-black\/5\b/g, 'ring-border'],

  // Accent legacy indigo
  [/\btext-indigo-(100|200|300|400|500|600)\b/g, 'text-accent'],
  [/\bbg-indigo-600\b/g, 'bg-accent'],
  [/\bbg-indigo-500\b/g, 'bg-accent'],
  [/\bbg-indigo-500\/10\b/g, 'bg-accentSoft'],
  [/\bborder-indigo-(400|500)\b/g, 'border-accent'],
  [/\bfocus:ring-indigo-500\b/g, 'focus:ring-accent'],
  [/\bfocus:border-indigo-500\b/g, 'focus:border-accent'],
  [/\bfocus:border-indigo-400\b/g, 'focus:border-accent'],
  [/\bhover:bg-indigo-400\b/g, 'hover:bg-accent'],
  [/\bhover:bg-indigo-700\b/g, 'hover:bg-accent'],
  [/\bhover:border-indigo-300\b/g, 'hover:border-accent'],
  [/\bhover:border-indigo-400\b/g, 'hover:border-accent'],
  [/\bshadow-indigo-500\/40\b/g, 'shadow-accent'],
  [/\bshadow-indigo-600\/20\b/g, 'shadow-accent'],
  [/\bdisabled:bg-indigo-900\/50\b/g, 'disabled:bg-surfaceTint'],
  [/\bdisabled:bg-indigo-900\/40\b/g, 'disabled:bg-surfaceTint'],
  [/\bdark:disabled:bg-indigo-900\/40\b/g, 'dark:disabled:bg-surfaceTint'],
  [/\bdisabled:bg-indigo-200\b/g, 'disabled:bg-surfaceTint'],
  [/\bhover:bg-gray-100\b/g, 'hover:bg-surfaceElevated'],
  [/\bhover:bg-gray-800\/60\b/g, 'hover:bg-surfaceElevated'],
  [/\bpeer-checked:bg-indigo-500\b/g, 'peer-checked:bg-accent'],
  [/\bbg-accent\/10\b/g, 'bg-accentSoft'],
  [/\bbg-accent\/20\b/g, 'bg-accentSoft'],
  [/\bborder-accent\/40\b/g, 'border-accent'],

  // Non-token status palettes -> tokens
  [/\btext-amber-\d+\b/g, 'text-textMuted'],
  [/\bborder-amber-\d+\/\d+\b/g, 'border-borderStrong'],
  [/\bborder-amber-\d+\b/g, 'border-borderStrong'],
  [/\bbg-amber-\d+\/\d+\b/g, 'bg-surfaceTint'],
  [/\bbg-amber-\d+\b/g, 'bg-surfaceTint'],

  [/\btext-emerald-\d+\b/g, 'text-accent'],
  [/\bbg-emerald-\d+\/\d+\b/g, 'bg-accent'],
  [/\bbg-emerald-\d+\b/g, 'bg-accent'],
  [/\bhover:bg-emerald-\d+\b/g, 'hover:bg-accent'],

  [/\btext-rose-\d+\b/g, 'text-textMuted'],
  [/\bborder-rose-\d+\b/g, 'border-borderStrong'],
  [/\bbg-rose-\d+\/\d+\b/g, 'bg-surfaceTint'],
  [/\bhover:bg-rose-\d+\/\d+\b/g, 'hover:bg-surfaceTint'],

  [/\btext-purple-\d+\b/g, 'text-accent'],
  [/\bbg-purple-\d+\/\d+\b/g, 'bg-accent'],
  [/\bbg-purple-\d+\b/g, 'bg-accent'],
  [/\bhover:bg-purple-\d+\b/g, 'hover:bg-accent'],
  [/\bdisabled:bg-purple-\d+\/\d+\b/g, 'disabled:bg-surfaceTint'],

  [/\btext-green-\d+\b/g, 'text-accent'],
  [/\bbg-green-\d+\/\d+\b/g, 'bg-accent'],
  [/\bbg-green-\d+\b/g, 'bg-accent'],
  [/\bhover:bg-green-\d+\b/g, 'hover:bg-accent'],

  [/\btext-neutral-\d+\b/g, 'text-textMuted'],
  [/\bplaceholder-gray-\d+\b/g, 'placeholder:text-textMuted'],
  [/\bbg-surface\/10\b/g, 'bg-surfaceTint'],
  [/\bbg-bg\/60\b/g, 'bg-surfaceTint'],
];

function applyReplacements(input) {
  let output = input;
  for (const [pattern, replacement] of replacements) {
    output = output.replace(pattern, replacement);
  }
  return output;
}

let changedCount = 0;

for (const filePath of files) {
  const absPath = path.join(repoRoot, filePath);
  const original = await fs.readFile(absPath, 'utf8');
  const next = applyReplacements(original);

  if (next !== original) {
    await fs.writeFile(absPath, next, 'utf8');
    changedCount += 1;
  }
}

console.log(`tokenize-legacy-classes: updated ${changedCount} files`);
