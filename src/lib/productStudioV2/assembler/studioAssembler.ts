// Freeze guard: keep `\n\n` block boundaries stable for validator block scanning.
const DEDUPE_KEYS = [
  'STUDIO_LIGHTING_PROFILE',
  'STUDIO_COMPOSITION_PROFILE',
  'STUDIO_MATERIAL_PROFILE',
  'COFFEE_LIGHTING_PROFILE',
  'COFFEE_COMPOSITION_PROFILE',
  'COFFEE_MATERIAL_PROFILE',
  'COFFEE_COMPOSITION_DOMINANCE',
  'COFFEE_PRODUCT_DOMINANCE_RATIO',
];

// Keep block boundaries stable: normalize only inline horizontal whitespace.
function normalizeInlineWhitespace(text: string): string {
  return String(text || '').replace(/[ \t]{2,}/g, ' ').trim();
}

function dedupePromptKeySentences(prompt: string): string {
  let nextPrompt = prompt;
  for (const key of DEDUPE_KEYS) {
    const pattern = new RegExp(`${key}:\\s*[^.]*\\.`, 'g');
    const matches = nextPrompt.match(pattern);
    if (!matches || matches.length < 2) continue;
    let seen = 0;
    const keepIndex = matches.length - 1;
    nextPrompt = nextPrompt.replace(pattern, (match) => {
      const out = seen === keepIndex ? match : '';
      seen += 1;
      return out;
    });
  }
  return normalizeInlineWhitespace(nextPrompt);
}

export function assembleStudioPrompt(blocks: string[]): string {
  // Double-newline block contract is intentional for validator block scanning.
  const rawPrompt = blocks.filter((block) => block.trim().length > 0).join('\n\n');
  return dedupePromptKeySentences(rawPrompt);
}
