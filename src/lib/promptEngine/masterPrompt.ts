type MasterPromptSections = {
  creationIntent: string;
  creationMode: string;
  ugcRealMode: string;
  formulationStory?: string;
  ecommerceBuilder?: string;
  cameraFraming: string;
  environmentLightingMood: string;
  identity?: string;
  finalize?: string;
};

/**
 * Compose the final prompt matching the required canonical order.
 */
export function buildMasterPrompt(sections: MasterPromptSections, negativePrompt: string): string {
  const {
    creationIntent,
    creationMode,
    ugcRealMode,
    formulationStory,
    ecommerceBuilder,
    cameraFraming,
    environmentLightingMood,
    identity,
    finalize
  } = sections;

  const parts = [
    creationIntent,
    creationMode,
    ugcRealMode,
    formulationStory,
    ecommerceBuilder,
    cameraFraming,
    environmentLightingMood,
    identity,
    finalize
  ]
    .filter(Boolean)
    .map(part => (part || '').trim())
    .filter(part => part.length > 0);

  const prompt = parts.join(' ').replace(/\s+/g, ' ').trim();
  return `${prompt} Negative prompt: ${negativePrompt}`.replace(/\s+/g, ' ').trim();
}
