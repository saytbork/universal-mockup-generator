/**
 * ============================================================================
 * 🔒 SYSTEM PROMPT v1.0 — LOCKED CONTRACT
 * ============================================================================
 * 
 * STATUS: FROZEN
 * LOCKED DATE: 2026-01-31
 * 
 * This is the root contract for the commercial product photography engine.
 * ============================================================================
 */

export const DETERMINISTIC_SECTIONS = {
    GLOBAL_RULES: `
🔒 SYSTEM PROMPT v1.0 — FINAL MEGA PROMPT (GEMINI)
GLOBAL RULES (NON-NEGOTIABLE)
This system is deterministic.
Do NOT infer, assume, or add missing elements.
Do NOT introduce people, humans, hands, bodies, or interaction unless explicitly provided in Section 06.
If a concept is not declared, it must NOT appear.
Studio scenes are object-only by default.
Product is always physically grounded and real.
Never generate an empty scene. The product must always be visible.
`.trim(),

    SECTION_01: `
01 / PRODUCT SETUP
Ultra-realistic premium advertising photography.
High-end editorial or cinematic quality.
Real physical environment with believable materials and realistic scale.
No stock-photo look. No mockups. No CGI appearance.
The product is the single visual hero.
`.trim(),

    SECTION_02: `
02 / PHYSICAL PROPERTIES
Real-world materials only
Accurate scale and proportions
True-to-life surface response to light
Natural micro-imperfections
Correct contact shadows and occlusion
No floating objects. No visual tricks.
`.trim(),

    SECTION_03: `
03 / PRODUCT STATE & MOTION
PRODUCT_STATE_MOTION: Static
Fully assembled
Cap present and attached
Contents contained
No movement
No deformation
`.trim(),

    SECTION_04: `
04 / PRODUCT STRUCTURE
Single product only (unless bundle mode explicitly enabled)
No duplicates
No broken, melted, warped, or partial components
Label aligned, intact, and readable
`.trim(),

    SECTION_05: `
05 / PRODUCT PLACEMENT
Product is placed in a physically plausible position:
Resting on a surface
Supported by gravity
Correct contact shadows
No suspension unless explicitly defined.
`.trim(),

    SECTION_06: `
06 / PRODUCT INTERACTION (STRICT)
One interaction per scene.
Allowed values only:
None, Passive Presence, Cropped Hand, Supported Hold, Holding, Two-Hand Hold, Presenting, Framed Presentation, Applying / Opening, Capsule Display, Resting Interaction
RULES:
If interaction = None, DO NOT mention hands, people, or interaction.
If interaction ≠ None, inject ONLY the corresponding interaction block.
No generic interaction language.
No conditional phrases like “if hands are present”.
`.trim(),

    SECTION_07: `
07 / VIEWPOINT & VANTAGE
Viewpoint is explicitly defined (e.g. eye-level, slight high-angle, low-angle)
Perspective must match physical placement
No impossible camera positions
`.trim(),

    SECTION_08: `
08 / PHOTO MODE (ENVIRONMENT SYSTEM)
Treat Photo Mode as a configurable environment, not a style keyword.
Apply: Environment mood, Surface logic, Spatial context, Material language
Do NOT introduce humans unless Section 06 explicitly requires it.
`.trim(),

    SECTION_09: `
09 / CAMERA & FRAMING
Real photographic lens behavior
Physically plausible depth of field
Natural perspective compression
Camera properties: Angle: explicitly defined, Distance: explicitly defined, Lens: realistic (50mm, 85mm, 100mm, 70–200mm, etc.)
Avoid symmetrical default framing.
`.trim(),

    SECTION_10: `
10 / LIGHTING
Directional, realistic lighting only
No flat lighting
Controlled highlights
Natural shadow falloff
Lighting must match environment context
No dramatic or artificial effects unless explicitly requested.
`.trim(),

    SECTION_11: `
11 / LABEL LOCK & FINAL VALIDATION (CRITICAL)
LABEL LOCK:
The product label comes from the reference image.
Reproduce exactly.
Do NOT rewrite, invent, complete, or reinterpret text.
Do NOT distort, warp, curve, or perspective-bend the label.
Label must face the camera clearly.

FINAL VALIDATION:
Product must be visible and centered in intent.
Never generate an empty background.
No forbidden terms.
No humans unless Section 06 allows it.
Aspect ratio: landscape 4:3.
`.trim(),

    QUALITY_ENFORCERS: `
QUALITY ENFORCERS
Ultra-realistic textures
Premium commercial photography quality
Real physics
Grounded contact points
No repetition
No generic visuals
The image must look like a real professional photoshoot, never a digital illustration.
`.trim(),

    FORBIDDEN: `
FORBIDDEN (GLOBAL)
Do NOT include: human, people, person, hands (unless Section 06 explicitly injects them), lifestyle, ugc, mannequin, CGI artifacts
`.trim(),

    OUTPUT_GOAL: `
OUTPUT GOAL
Generate a single high-quality product photograph that strictly follows all sections above.
No assumptions. No creativity outside the schema.
This is a locked commercial system.
`.trim()
};

/**
 * Builds the full deterministic prompt foundation v1.0.
 */
export function buildDeterministicFoundation(): string {
    return Object.values(DETERMINISTIC_SECTIONS).join('\n\n');
}
