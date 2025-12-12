type MasterPromptSections = {
  base?: string;
  identity?: string;
  mode?: string;
  product?: string;
  finalize?: string;
  includeIdentity: boolean;
};

/**
 * Compose the final prompt, keeping lifestyle/person details only when enabled.
 */
export function buildMasterPrompt(sections: MasterPromptSections, negativePrompt: string): string {
  const { base, identity, mode, product, finalize, includeIdentity } = sections;
  const parts = [
    base,
    includeIdentity ? identity : '',
    mode,
    product,
    finalize,
  ]
    .filter(Boolean)
    .map(part => (part || '').trim())
    .filter(part => part.length > 0);

  const prompt = parts.join(' ').replace(/\s+/g, ' ').trim();

  return `${prompt} Negative prompt: ${negativePrompt}`.replace(/\s+/g, ' ').trim();
}
