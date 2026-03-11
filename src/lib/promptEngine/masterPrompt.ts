export type PromptSection = {
  id: string;
  content: string;
};

export function buildMasterPrompt(
  sections: PromptSection[],
  negativePrompt?: string
): string {
  const ordered = sections
    .filter(Boolean)
    .map((section) => String(section.content || '').trim())
    .filter(Boolean);

  return [...ordered, negativePrompt || '']
    .filter(Boolean)
    .join('\n\n');
}
