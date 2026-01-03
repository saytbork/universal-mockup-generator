import { execFileSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';

const repoRoot = process.cwd();

const files = execFileSync('git', ['ls-files'], { encoding: 'utf8' })
  .split('\n')
  .map(line => line.trim())
  .filter(Boolean)
  .filter(filePath => {
    if (filePath.startsWith('dist/')) return false;
    if (filePath.startsWith('node_modules/')) return false;
    if (filePath.endsWith('.png') || filePath.endsWith('.jpg') || filePath.endsWith('.jpeg') || filePath.endsWith('.webp')) return false;
    return (
      filePath.endsWith('.ts') ||
      filePath.endsWith('.tsx') ||
      filePath.endsWith('.js') ||
      filePath.endsWith('.jsx') ||
      filePath.endsWith('.css') ||
      filePath.endsWith('.html')
    );
  });

const forbidden = [
  // Legacy palettes
  /\b(bg|text|border|from|via|to)-(gray|indigo|purple|blue|sky|green|rose|emerald|slate|neutral|amber|red|yellow|orange)-/g,
  // Disallowed theme variants (theme must be CSS variables only)
  /\bdark:/g,
  // Arbitrary color utilities
  /\b(bg|text|border)-\[#/g,
  // Arbitrary shadows
  /\bshadow-\[/g,
  // Opacity modifiers on semantic surface tokens (avoid opacity-only contrast hacks)
  /\bbg-(bg|surface|surfaceElevated|surfaceTint)\/\d+\b/g,
  // Arbitrary opacity on semantic surfaces (e.g. bg-surface/[0.02])
  /\bbg-(bg|surface|surfaceElevated|surfaceTint)\/\[/g,
  // Hardcoded white surfaces
  /\bbg-white\b/g,
];

const matches = [];

for (const filePath of files) {
  const absPath = path.join(repoRoot, filePath);
  let contents = '';
  try {
    contents = await fs.readFile(absPath, 'utf8');
  } catch (error) {
    if (error && typeof error === 'object' && error.code === 'ENOENT') continue;
    throw error;
  }
  for (const pattern of forbidden) {
    if (pattern.test(contents)) {
      matches.push({ filePath, pattern: String(pattern) });
    }
    pattern.lastIndex = 0;
  }
}

if (matches.length) {
  // eslint-disable-next-line no-console
  console.error('Design token enforcement failed. Forbidden utilities detected:');
  for (const match of matches) {
    // eslint-disable-next-line no-console
    console.error(`- ${match.filePath} (${match.pattern})`);
  }
  process.exit(1);
}

console.log('Design token enforcement passed.');
