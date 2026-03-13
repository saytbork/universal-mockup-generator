export type PromptSection = {
  id: string;
  content: string;
};

const dedupeExactSentences = (prompt: string): string => {
  const chunks = prompt
    .split(/(?<=[.!?])\s+/)
    .map(chunk => chunk.trim())
    .filter(Boolean);

  const seen = new Set<string>();
  const unique = chunks.filter(chunk => {
    const normalized = chunk.toLowerCase().replace(/\s+/g, ' ').trim();
    if (!normalized) return false;
    if (seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });

  return unique.join(' ').replace(/\s+/g, ' ').trim();
};

export function buildMasterPrompt(
  sections: PromptSection[],
  negativePrompt?: string
): string {
  const ordered = sections
    .filter(Boolean)
    .map((section) => String(section.content || '').trim())
    .filter(Boolean);

  return dedupeExactSentences(
    [...ordered, negativePrompt || '']
      .filter(Boolean)
      .join('\n\n')
  );
}
