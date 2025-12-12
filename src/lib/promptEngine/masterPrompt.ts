type MasterPromptSections = {
  base?: string;
  constraints?: string;  // NEW: Image preservation constraints
  identity?: string;
  mode?: string;
  product?: string;
  finalize?: string;
  includeIdentity: boolean;
};

/**
 * Compose the final prompt with correct order for image preservation.
 * Order: base → constraints → identity → product → mode → finalize → negative
 */
export function buildMasterPrompt(sections: MasterPromptSections, negativePrompt: string): string {
  const { base, constraints, identity, mode, product, finalize, includeIdentity } = sections;

  // CRITICAL: Order matters for image preservation
  const parts = [
    base,
    constraints,  // Must come before identity to preserve uploaded images
    includeIdentity ? identity : '',
    product,
    mode,
    finalize,
  ]
    .filter(Boolean)
    .map(part => (part || '').trim())
    .filter(part => part.length > 0);

  const prompt = parts.join(' ').replace(/\s+/g, ' ').trim();

  // Negative prompt ALWAYS at the end
  return `${prompt} Negative prompt: ${negativePrompt}`.replace(/\s+/g, ' ').trim();
}
