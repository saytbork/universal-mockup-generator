/**
 * Master Prompt Assembler
 * CANONICAL ORDER - This defines the precedence of prompt sections
 * 
 * ORDER (earlier = lower priority, later = higher priority in prompt):
 * 1. creationIntent - Structural context (UGC vs Product vs Brand)
 * 2. creationMode - Mode-specific rules (lifestyle, studio, ecom-blank)
 * 3. formulationStory - Expert credibility (optional)
 * 4. ecommerceBuilder - Blank space layout (optional, BLOCKED if UGC active)
 * 5. cameraFraming - Physical camera composition
 * 6. environmentLightingMood - Scene, light, atmosphere
 * 7. compositionDetails - Layout + supporting context
 * 8. identity - Person physical traits
 * 9. finalize - Constraints and output format
 * 10. ugcRealMode - DOMINANT override (always appended last when active)
 */

export type MasterPromptSections = {
  creationIntent: string;
  creationMode: string;
  ugcRealMode: string;
  formulationStory?: string;
  ecommerceBuilder?: string;
  cameraFraming: string;
  environmentLightingMood: string;
  compositionDetails?: string;
  identity?: string;
  finalize?: string;
};

/**
 * Compose the final prompt matching the canonical order.
 * 
 * PRECEDENCE:
 * - UGC Real Mode (when active) is appended last so it can override every other section.
 * - Identity is placed AFTER scene for human-first composition.
 * - Finalize provides quality anchors and constraints before the final UGC override.
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
      compositionDetails,
      identity,
      finalize
    } = sections;

  // CANONICAL ORDER - creation intent first, raw domestic UGC last
    const candidateParts = [
      creationIntent,     // 1. Structural context
      creationMode,       // 2. Mode rules
      formulationStory,   // 3. Expert credibility
      ecommerceBuilder,   // 4. Blank space layout
      cameraFraming,      // 5. Camera composition
      environmentLightingMood, // 6. Scene + lighting
      compositionDetails, // 7. Composition instructions
      identity,           // 8. Person traits
      finalize            // 9. Constraints + output
    ];

    const cleanedParts: string[] = [];
    for (const candidate of candidateParts) {
      if (!candidate) continue;
      const trimmedCandidate = candidate.trim();
      if (trimmedCandidate.length === 0) continue;
      cleanedParts.push(trimmedCandidate);
    }

    const renderedParts: string[] = [];
    for (const cleanedPart of cleanedParts) {
      renderedParts.push(cleanedPart);
    }

    const ugcSection = (ugcRealMode || '').trim();
    if (ugcSection) {
      renderedParts.push(ugcSection);
    }

  const prompt = renderedParts.join(' ').replace(/\s+/g, ' ').trim();

  console.log('[MASTER PROMPT] Assembled', renderedParts.length, 'sections,', prompt.length, 'chars');

  return `${prompt} Negative prompt: ${negativePrompt}`.replace(/\s+/g, ' ').trim();
}
