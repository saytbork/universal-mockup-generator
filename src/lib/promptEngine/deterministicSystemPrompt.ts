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
    SECTION_01_QUALITY: `
01 / QUALITY ENFORCER — HARD FOUNDATION (ALWAYS ON)
The product MUST be reconstructed as a real, three-dimensional physical object.
Mandatory reconstruction rules:
- Correct real-world proportions and physical volume
- Continuous, clean silhouette
- Smooth edges, no halos, no cutout artifacts
- Physically correct materials (glass, plastic, metal, paper)
- Lighting must interact realistically with materials
Absolute prohibitions:
- No flat images, no pasted cutouts, no illustration
- No painterly or airbrushed textures, no AI softness
- No black or dark edge outlines
Label fidelity (ABSOLUTE):
- Label is a real printed label, sharp, readable, high contrast
- Physically attached to the product surface, correct scale and alignment
- No blur, warp, fade, melting, or distortion
Priority order: Object geometry > Material realism > Edge cleanliness > Label fidelity > Lighting realism
`.trim(),

    SECTION_02_IDENTITY: `
02 / PRODUCT IDENTITY (LOCKED)
Product identity is fixed. No brand changes. No form changes. No reinterpretation.
`.trim(),

    SECTION_03_TYPE: `
03 / PRODUCT TYPE (LOCKED)
Defines allowed behaviors. Product Type restricts: Allowed interactions, Allowed placements, Allowed environments. Invalid combinations must be rejected.
`.trim(),

    SECTION_04_PHYSICAL: `
04 / PHYSICAL PROPERTIES (LOCKED)
You must respect: Physical scale (handheld, tabletop, large), Weight realism, Material rigidity or flexibility.
These properties MUST affect: Gravity behavior, Shadow density, Contact deformation.
`.trim(),

    SECTION_05_STRUCTURE: `
05 / PRODUCT STRUCTURE (LOCKED)
Defines: Single product vs bundle, Grouping and spacing, Relative positioning between products. This step does NOT define gravity or support.
`.trim(),

    SECTION_06_PLACEMENT: `
06 / PRODUCT PLACEMENT — MANDATORY PHYSICS DECISION
Defines how the product exists physically in the scene. Exactly ONE placement must be resolved:
- On Surface: Product rests on a physical surface. Gravity applied. Contact shadows required.
- Held in Hands: Product supported by one or two human hands. Gravity defined by hands. Visible pressure and deformation required.
- Supported (Stand / Tray / Pedestal): Product supported by a visible structure. Contact points visible. No floating illusion.
- Floating / Suspended (STRICTLY LIMITED): Gravity neutralized. Allowed ONLY in abstract studio contexts. NEVER allowed in real-world environments.
`.trim(),

    SECTION_07_INTERACTION: `
07 / PRODUCT INTERACTION (ONE ONLY)
Defines what is interacting with the product. Must be compatible with Product Type and Placement.
Human realism rules (MANDATORY if hands appear):
- Real adult human hands, natural skin texture and imperfections.
- Asymmetry in fingers and posture, visible pressure on the product.
- Product deforms where fingers touch.
- No mannequin hands, no plastic skin, no perfect symmetry.
`.trim(),

    SECTION_08_VIEWPOINT: `
08 / VIEWPOINT & VANTAGE — SPATIAL LOGIC (LOCKED)
Defines how the scene is perceived relative to gravity, not optics. Exactly ONE viewpoint must be applied:
- Surface — Eye-Level View: Horizon aligns with surface plane.
- Surface — Aerial / Top-Down View: Gravity applied downward, visible contact shadows.
- Held Object — Human POV: Viewer perspective matches human eye level.
- Supported Object — Display View: Clearly shows support and contact points.
- Suspended View (Abstract Only): Gravity neutralized. No real-world environment implied.
Hard rule: Viewpoint must be compatible with Product Placement.
`.trim(),

    SECTION_09_PHOTO_MODE: `
09 / PHOTO MODE / ENVIRONMENT — SCHEMA-DRIVEN ONLY
Photo Modes are environments, not styles. Use only the provided schema. Enforce all schema constraints deterministically. Never assume missing values. Never invent props or behaviors outside the schema.
`.trim(),

    SECTION_10_CAMERA: `
10 / CAMERA & FRAMING — OPTICAL ONLY
Camera controls affect only how the scene is captured.
Allowed: Camera system, Angle, Distance, Rotation (camera axis only), Framing guide.
Prohibited: Object rotation, geometry distortion, scale manipulation, gravity reinterpretation.
`.trim(),

    SECTION_11_LIGHTING: `
11 / LIGHTING — PHYSICS-BASED ONLY
Lighting must follow real physics: Consistent direction, Realistic softness, Contact shadows when applicable.
No floating shadows, no impossible reflections.
`.trim(),

    SECTION_12_VALIDATION: `
12 / FINAL VALIDATION — HARD FAIL CONDITIONS
The render is INVALID if: Product appears flat or pasted; Label is unreadable or distorted; Hands look synthetic; Shadows contradict gravity; Placement conflicts with environment; Viewpoint is violated; Any schema constraint is broken.
`.trim(),

    OUTPUT_GOAL: `
OUTPUT GOAL
Produce a real commercial product photograph, shot by a professional team, with physical realism superior to the input reference.
No interpretation. No shortcuts. No ambiguity.
`.trim()
};

/**
 * Builds the full deterministic prompt foundation v1.0.
 */
export function buildDeterministicFoundation(): string {
    return Object.values(DETERMINISTIC_SECTIONS).join('\n\n');
}
