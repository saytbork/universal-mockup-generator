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
 * 9. selfieCapture - UGC selfie hard constraints (conditional)
 * 10. finalize - Constraints and output format
 * 11. ugcRealMode - DOMINANT override (always appended last when active)
 */

const OPTIMIZED_UGC_PROMPT = '';
const NATURAL_UGC_PROMPT = `
LIFESTYLE MODE: NATURAL UGC.

SCENE NARRATIVE:
This must look like a real, casual photo taken at home by a normal person using a smartphone.
The image should feel natural, human, and believable.
It must not look staged, produced, or commercially polished.

RULES:
- No studio lighting.
- No professional photography.
- No polished or commercial composition.
- No beauty filters.
- No skin smoothing.
- No brand-style presentation.

VISUAL FIDELITY:
- Hyperrealistic and imperfect UGC photo aesthetic.
- Basic smartphone front-camera quality.
- Flat focus across the entire frame.
- Everything sharp from foreground to background.
- No background blur, no bokeh, no depth of field effects.
- Natural domestic lighting.
- Uneven exposure is allowed.
- Minor imperfections are allowed.
- Low dynamic range with small sensor characteristics.

CREATOR IDENTITY:
- Real skin texture with natural variation.
- No retouching.
- Casual, unposed expression and posture.
- The person is not presenting or performing.

CAPTURE:
- Handheld or casual front-camera framing.
- Arm visible positioned as if holding the device (phone invisible).
- Slightly imperfect framing and handheld wobbling are allowed.
- Horizon does not need to be perfectly level.
- Camera placement feels incidental, not planned.

ENVIRONMENT:
- Real domestic environment.
- Lived-in but not dirty or chaotic.
- Everyday surroundings.

CRITICAL PROHIBITIONS:
- No studio light.
- No production setup.
- No ecommerce product shot.
- No influencer-style posing.
- No showing the product directly to camera.

GOAL:
Natural, pleasant, believable UGC.
Not raw and messy.
Not polished or optimized.
Just real.
`.trim();
const RAW_UGC_PROMPT = '';

const UGC_CONTRACTS = {
  optimized: OPTIMIZED_UGC_PROMPT,
  natural: NATURAL_UGC_PROMPT,
  raw: RAW_UGC_PROMPT,
};

export type MasterPromptSections = {
  creationIntent: string;
  creationMode: string;
  ugcRealMode: string;
  formulationStory?: string;
  ecommerceBuilder?: string;
  cameraFraming: string;
  environmentLightingMood: string;
  compositionDetails?: string;
  selfieCapture?: string;
  identity?: string;
  finalize?: string;
  sceneStructure?: string;
};

/**
 * Compose the final prompt matching the canonical order.
 * 
 * PRECEDENCE:
 * - UGC Real Mode (when active) is appended last so it can override every other section.
 * - Identity is placed AFTER scene for human-first composition.
 * - Finalize provides quality anchors and constraints before the final UGC override.
 */
export function buildMasterPrompt(
  sections: MasterPromptSections,
  negativePrompt: string,
  ugcStyle: 'optimized' | 'natural' | 'raw' = 'optimized'
): string {
  const {
    creationIntent,
    creationMode,
    ugcRealMode,
    formulationStory,
    ecommerceBuilder,
    cameraFraming,
    environmentLightingMood,
    compositionDetails,
    selfieCapture,
    identity,
    finalize,
    sceneStructure
  } = sections;

  const selfieCaptureActive = Boolean(selfieCapture && selfieCapture.trim().length > 0);

  // CANONICAL ORDER - creation intent first, raw domestic UGC last
  const candidateParts = selfieCaptureActive
    ? [
      sceneStructure,     // 0. PHYSICAL STRUCTURE (Foundational)
      creationIntent,     // 1. Structural context
      creationMode,       // 2. Mode rules
      formulationStory,   // 3. Expert credibility
      ecommerceBuilder,   // 4. Blank space layout
      identity,           // 5. Person traits (before selfie capture)
      selfieCapture,      // 6. UGC selfie hard constraints
      cameraFraming,      // 7. Camera composition
      environmentLightingMood, // 8. Scene + lighting
      compositionDetails, // 9. Composition instructions
      finalize            // 10. Constraints + output
    ]
    : [
      sceneStructure,     // 0. PHYSICAL STRUCTURE (Foundational)
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

  const ugcContract = UGC_CONTRACTS[ugcStyle];
  if (ugcContract) {
    const trimmedContract = ugcContract.trim();
    if (trimmedContract.length > 0) {
      renderedParts.push(trimmedContract);
    }
  }

  const ugcSection = (ugcRealMode || '').trim();
  if (ugcSection) {
    renderedParts.push(ugcSection);
  }

  const prompt = renderedParts.join(' ').replace(/\s+/g, ' ').trim();

  console.log('[MASTER PROMPT] Assembled', renderedParts.length, 'sections,', prompt.length, 'chars');

  return `${prompt} Negative prompt: ${negativePrompt}`.replace(/\s+/g, ' ').trim();
}
