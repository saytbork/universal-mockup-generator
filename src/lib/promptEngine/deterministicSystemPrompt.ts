/**
 * ============================================================================
 * 🔒 SYSTEM PROMPT v1.0 — LOCKED CONTRACT
 * ============================================================================
 * 
 * STATUS: FROZEN
 * LOCKED DATE: 2026-01-31
 * 
 * ⚠️  DO NOT MODIFY THIS FILE
 * ⚠️  DO NOT ADD EXCEPTIONS
 * ⚠️  DO NOT "FIX" EDGE CASES HERE
 * 
 * This is the root contract for the commercial product photography engine.
 * Any extensions must be implemented in v1.1+ via separate modules.
 * 
 * To extend the engine:
 * - Create deterministicSystemPrompt.v1.1.ts
 * - Import and extend, do not mutate this file
 * 
 * Violations of this contract will break deterministic generation guarantees.
 * ============================================================================
 */

export const DETERMINISTIC_SECTIONS = {
    SECTION_01: `
01 / QUALITY ENFORCER
The product must be reconstructed as a real 3D physical object.
Required:
- Correct proportions and volume
- Clean continuous silhouette
- Sharp edges, no halos, no cutout artifacts
- Realistic shadows and reflections
Forbidden:
- Flat renders
- Painted or airbrushed look
- Soft AI edges
- Graphic or illustrated style
`.trim(),

    SECTION_02: `
02 / PRODUCT IDENTITY
One real commercial product
No fictional variations
No deformation or exaggeration
Low-quality references must be reconstructed cleanly, not copied.
`.trim(),

    SECTION_03: `
03 / PHYSICAL PROPERTIES
Materials must behave realistically:
- Glass looks like glass
- Plastic looks like plastic
- Liquids show surface tension
- Paper has natural rigidity
Lighting must follow real-world physics.
`.trim(),

    SECTION_04: `
04 / PRODUCT STRUCTURE
Single product unless specified
Gravity always applies
Contact shadows are mandatory
No floating without physical justification
`.trim(),

    SECTION_05: `
05 / PRODUCT PLACEMENT
Select one:
- surface → resting on a surface
- held → supported by realistic hands
- supported → assisted by stand or block
- air → suspended with physical logic
No mixed placements.
`.trim(),

    SECTION_06: `
06 / PRODUCT INTERACTION
Select one:
none, cropped-hand, holding, two-hand-hold, presenting, opening, capsule-display (capsules only)
Rules:
- Interaction must match placement
- Hands must look realistic, proportional, and natural
- No gestures, no symbolism
`.trim(),

    SECTION_07: `
07 / VIEWPOINT & VANTAGE
Defines the physical position of the camera in space.
Valid: eye-level, top-down, low-angle, high-angle, product-level
Rules:
- Viewpoint must match placement
- No impossible perspectives
- No mixed viewpoints
`.trim(),

    SECTION_08: `
08 / PHOTO MODE (WORLD)
Presence rules:
- Studio worlds → product only, no hands
- Lifestyle / UGC worlds → hands only, never full people
`.trim(),

    SECTION_09: `
09 / CAMERA & FRAMING
Professional photography only.
Camera: DSLR or mirrorless
Lens behavior: Standard, Macro (only if physically plausible), Telephoto compression (no distortion)
Framing: Centered hero, Rule of thirds, Left aligned with negative space, Right aligned with negative space, Grid-ready
Camera must respect viewpoint.
`.trim(),

    SECTION_10: `
10 / LIGHTING
Lighting must be realistic and coherent:
- Studio lighting is controlled
- Natural lighting feels natural
- No glowing edges
- No fantasy effects
Lighting derives from Photo Mode unless overridden.
`.trim(),

    SECTION_11: `
11 / FINAL VALIDATION (HARD FAIL)
The generation must FAIL if:
- Placement conflicts with interaction
- Photo Mode conflicts with placement
- Studio world includes hands
- Lifestyle world includes full people
- Viewpoint conflicts with camera
- Any forbidden term appears
No silent correction. Fail immediately.
`.trim(),

    LEXICAL_COMPLIANCE: `
LEXICAL COMPLIANCE (CRITICAL)
The following term must never appear: ❌ human
Always use: realistic hands, natural interaction, real-world, life-scale, natural point of view
`.trim(),

    OUTPUT_GOAL: `
FINAL OUTPUT REQUIREMENT
The image must look like a real commercial product photograph suitable for ecommerce, advertising, or editorial use.
No creativity outside constraints. No interpretation. No deviation.
`.trim()
};

/**
 * Builds the full deterministic prompt foundation v1.0.
 */
export function buildDeterministicFoundation(): string {
    return Object.values(DETERMINISTIC_SECTIONS).join('\n\n');
}
