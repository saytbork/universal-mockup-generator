/**
 * Deterministic System Prompt Foundation
 * 
 * This module contains the strict 11-section system prompt provided for 
 * ensuring physical realism, deterministic behavior, and hard validation.
 */

export const DETERMINISTIC_SECTIONS = {
    SECTION_01_QUALITY: `
01 / QUALITY ENFORCER — HARD FOUNDATION (ALWAYS ON)
The product MUST be reconstructed as a real three-dimensional physical object.
Reconstruction rules:
- Correct real-world proportions and volume
- Continuous clean silhouette
- Smooth edges, no halos, no cutout artifacts
- Physically accurate materials (glass, plastic, metal, paper)
- Lighting interacts with materials realistically
Global prohibitions:
- No flat images, no pasted cutouts, no illustration
- No painterly or airbrushed look, no AI softness
- No black or dark edge outlines
Label rules (ABSOLUTE):
- Label is a real printed label, sharp, readable, high contrast
- Physically attached to the surface, correct scale and alignment
- No blur, warp, fade, or melting
Priority order: Object geometry > Material realism > Edge cleanliness > Label fidelity > Lighting realism
`.trim(),

    SECTION_02_IDENTITY: `
02 / PRODUCT IDENTITY (LOCKED)
Product identity is fixed. No brand changes. No form changes. No reinterpretation.
`.trim(),

    SECTION_03_TYPE: `
03 / PRODUCT TYPE (LOCKED)
The product type defines allowed interactions, placements, and environments.
Product Type restricts: Human interaction types, Placement options, Allowed environments.
`.trim(),

    SECTION_04_PHYSICAL: `
04 / PHYSICAL PROPERTIES (LOCKED)
Define: Physical scale (handheld, tabletop, large), Weight realism, Material rigidity or flexibility.
These properties MUST affect: Gravity behavior, Shadow intensity, Contact deformation.
`.trim(),

    SECTION_05_PLACEMENT: `
05 / PRODUCT PLACEMENT — MANDATORY (PHYSICS)
Exactly ONE placement:
- Surface: Product rests on a physical surface. Gravity applied. Contact shadows required.
- Held: Product held by human hands. Visible pressure and deformation required. Gravity defined by hands.
- Supported: Product rests on a visible support. Contact points visible. No floating illusion.
- Air / Suspended (EXCEPTION): Gravity intentionally neutralized. Only allowed in abstract studio contexts. Never allowed in real-world environments.
If placement conflicts with environment → render invalid.
`.trim(),

    SECTION_06_INTERACTION: `
06 / PRODUCT INTERACTION (ONE ONLY)
Interaction must respect Product Type and Placement.
Human realism rules (mandatory if hands appear):
- Real adult human hands, natural skin texture and imperfections.
- Asymmetry in fingers and posture, visible pressure on product.
- Product deforms where fingers touch.
- No mannequin hands, no plastic skin, no perfect symmetry.
`.trim(),

    SECTION_07_VIEWPOINT: `
07 / VIEWPOINT & VANTAGE — SPATIAL LOGIC (LOCKED)
Exactly ONE viewpoint:
- Object on Surface — Eye-Level View
- Object on Surface — Aerial / Top-Down View
- Held Object — Human POV
- Supported Object — Display View
- Suspended / Air View
Hard rule: Viewpoint must be compatible with Product Placement. Incompatible combinations invalidate the render.
`.trim(),

    SECTION_08_PHOTO_MODE: `
08 / PHOTO MODE / ENVIRONMENT (SCHEMA-DRIVEN ONLY)
Photo Modes are configurable environments, not styles.
Each Photo Mode schema defines environment mood, lighting system, surface/background type, allowed human presence, camera bias.
All schema constraints MUST be enforced deterministically. No assumptions outside the schema.
`.trim(),

    SECTION_09_CAMERA: `
09 / CAMERA & FRAMING — OPTICAL ONLY
Camera controls never modify physical reality.
Allowed: DSLR, mirrorless, macro, telephoto; Angle (eye-level, 45°, top-down, low, high, close-up); Distance (wide, standard, tight, macro); Framing guide (centered, thirds, negative space).
Prohibitions: No object rotation, no geometry distortion, no scale manipulation, no gravity reinterpretation.
Camera must respect the defined Viewpoint.
`.trim(),

    SECTION_10_LIGHTING: `
10 / LIGHTING — PHYSICS-BASED
Lighting must obey real physics: Consistent light direction, Real shadow softness, Contact shadows where applicable. No floating shadows, no impossible reflections.
`.trim(),

    SECTION_11_VALIDATION: `
11 / FINAL VALIDATION — HARD FAIL CONDITIONS
The render is INVALID if:
- Product appears flat or pasted
- Label is unreadable
- Hands look synthetic
- Shadows contradict gravity
- Placement conflicts with environment
- Viewpoint is violated
- Any schema constraint is broken
Only output images that pass all checks.
`.trim()
};

/**
 * Builds the full deterministic prompt foundation.
 */
export function buildDeterministicFoundation(): string {
    return Object.values(DETERMINISTIC_SECTIONS).join('\n\n');
}
