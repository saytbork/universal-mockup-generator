/**
 * Master Prompt Assembler
 * CANONICAL ORDER - This defines the precedence of prompt sections
 * 
 * ORDER (earlier = lower priority, later = higher priority in prompt):
 * 1. creationIntent - Structural context (UGC vs Product vs Brand)
 * 2. creationMode - Mode-specific rules (lifestyle, studio, ecom-blank)
 * 3. ugcRealMode - DOMINANT modifier when active
 * 4. formulationStory - Expert credibility (optional)
 * 5. ecommerceBuilder - Blank space layout (optional, BLOCKED if UGC active)
 * 6. cameraFraming - Physical camera composition
 * 7. environmentLightingMood - Scene, light, atmosphere
 * 8. identity - Person physical traits
 * 9. finalize - Constraints and output format
 */

type MasterPromptSections = {
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
 * - UGC Real Mode (when active) takes precedence over all styling
 * - Identity is placed AFTER scene for human-first composition
 * - Finalize provides quality anchors and constraints
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

  // CANONICAL ORDER - Do not change this sequence
    const parts = [
      creationIntent,     // 1. Structural context
      creationMode,       // 2. Mode rules
      ugcRealMode,        // 3. UGC override (DOMINANT)
      formulationStory,   // 4. Expert credibility
      ecommerceBuilder,   // 5. Blank space layout
      cameraFraming,      // 6. Camera composition
      environmentLightingMood, // 7. Scene + lighting
      compositionDetails, // 8. Composition instructions
      identity,           // 9. Person traits
      finalize            // 10. Constraints + output
    ]
    .filter(Boolean)
    .map(part => (part || '').trim())
    .filter(part => part.length > 0);

  const prompt = parts.join(' ').replace(/\s+/g, ' ').trim();

  console.log('[MASTER PROMPT] Assembled', parts.length, 'sections,', prompt.length, 'chars');

  return `${prompt} Negative prompt: ${negativePrompt}`.replace(/\s+/g, ' ').trim();
}
