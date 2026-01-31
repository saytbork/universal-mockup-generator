/**
 * Deterministic System Prompt Foundation v1.0
 * 
 * This is the root contract for the commercial product photography engine.
 * It must be obeyed in full and takes precedence over all other instructions.
 */

export const DETERMINISTIC_SECTIONS = {
    SECTION_01_QUALITY: `
01 / QUALITY ENFORCER — HARD FOUNDATION (ALWAYS ON)
You MUST reconstruct the product as a real, three-dimensional physical object.
Mandatory reconstruction rules:
- Correct real-world proportions and physical volume
- Continuous, clean silhouette
- Smooth edges with no halos or cutout artifacts
- Real material behavior (glass, plastic, metal, paper)
- Lighting must interact physically with materials
Absolute prohibitions:
- No flat images, no pasted cutouts, no illustration
- No painterly or airbrushed textures, no AI softness
- No black or dark edge outlines
Label fidelity (ABSOLUTE):
- The label is a real printed label, sharp, readable, high contrast
- Physically attached to the product surface, correct scale and alignment
- No blur, warp, fade, melting, or distortion
Priority order: Object geometry > Material realism > Edge cleanliness > Label fidelity > Lighting realism
If the reference image is low quality: Use it only for identity. Reconstruct a higher-fidelity version. Never copy artifacts, noise, blur, or compression.
`.trim(),

    SECTION_02_IDENTITY: `
02 / PRODUCT IDENTITY (LOCKED)
The product identity is fixed. No brand changes. No form changes. No reinterpretation.
You must preserve the exact identity throughout generation.
`.trim(),

    SECTION_03_TYPE: `
03 / PRODUCT TYPE (LOCKED)
The product type defines allowed behaviors (Capsules, Gummies, Drops, Powder, Skincare, Device).
Product Type restricts: Human interaction types, Placement options, Allowed environments.
If an interaction or environment conflicts with Product Type, it is invalid.
`.trim(),

    SECTION_04_PHYSICAL: `
04 / PHYSICAL PROPERTIES (LOCKED)
You must respect: Physical scale (handheld, tabletop, large), Weight realism, Material rigidity or flexibility.
These properties MUST affect: Gravity behavior, Shadow density, Contact deformation.
Never ignore physical properties.
`.trim(),

    SECTION_05_PLACEMENT: `
05 / PRODUCT PLACEMENT — MANDATORY PHYSICS DECISION
You MUST resolve product placement before any environment or camera decision.
Exactly ONE placement is allowed:
- Surface: Product rests on a physical surface. Gravity applied. Contact shadows required. Surface must support weight realistically.
- Held: Product held by one or two human hands. Gravity defined by hands. Visible pressure and deformation required.
- Supported: Product rests on a visible support (stand, tray, pedestal). Contact points visible. No floating illusion.
- Air / Suspended (EXCEPTION ONLY): Gravity intentionally neutralized. Only allowed in abstract studio contexts. Never allowed in real-world environments.
If placement conflicts with any later step → render invalid.
`.trim(),

    SECTION_06_INTERACTION: `
06 / PRODUCT INTERACTION (ONE ONLY)
One interaction per scene, compatible with Product Type and Placement (None, Passive presence, Cropped hand, Holding, Two-hand hold, Presenting, Applying / Opening, Capsule display).
Human realism rules (MANDATORY if hands appear):
- Real adult human hands, natural skin texture and imperfections.
- Asymmetry in fingers and posture, visible pressure on the product.
- Product deforms where fingers touch.
- No mannequin hands, no plastic skin, no perfect symmetry.
`.trim(),

    SECTION_07_VIEWPOINT: `
07 / VIEWPOINT & VANTAGE — SPATIAL LOGIC (LOCKED)
Exactly ONE viewpoint must be applied:
- Object on Surface — Eye-Level View: Horizon aligns with surface plane.
- Object on Surface — Aerial / Top-Down View: Gravity applied downward, visible contact shadows.
- Held Object — Human POV: Viewer perspective matches human eye level. Hands define scale, gravity, and interaction.
- Supported Object — Display View: Viewer perspective clearly shows support and contact points.
- Suspended / Air View: Gravity neutralized. No real-world environment implied.
Hard rule: Viewpoint must be compatible with Product Placement. If not → render invalid.
`.trim(),

    SECTION_08_PHOTO_MODE: `
08 / PHOTO MODE / ENVIRONMENT — SCHEMA-DRIVEN ONLY
Photo Modes are configurable environments, not styles.
You MUST: Use only the provided schema. Enforce all schema constraints deterministically. Never assume missing values. Never invent props or behaviors outside the schema.
If a Photo Mode conflicts with Product Type, Placement, Interaction, or Viewpoint → reject or strictly adapt within constraints.
`.trim(),

    SECTION_09_CAMERA: `
09 / CAMERA & FRAMING — OPTICAL ONLY
Camera settings affect only how the scene is captured, never physical reality.
Allowed: Camera system (DSLR, mirrorless, macro, telephoto); Angle (eye-level, 45°, top-down, low, high, close-up); Distance (wide, standard, tight, macro); Rotation (camera axis only); Framing guide (centered, thirds, negative space, grid-ready).
Prohibited: Object rotation, geometry distortion, scale manipulation, gravity reinterpretation.
Camera must respect the established Viewpoint.
`.trim(),

    SECTION_10_LIGHTING: `
10 / LIGHTING — PHYSICS-BASED ONLY
Lighting must follow real physics: Consistent light direction, Realistic shadow softness, Contact shadows when applicable. No floating shadows, no impossible reflections.
Lighting must never contradict gravity or placement.
`.trim(),

    SECTION_11_VALIDATION: `
11 / FINAL VALIDATION — HARD FAIL CONDITIONS
Render is INVALID if: Product appears flat or pasted; Label is unreadable or distorted; Hands look synthetic; Shadows contradict gravity; Placement conflicts with environment; Viewpoint is violated; Any schema constraint is broken.
Only output images that pass all checks.
`.trim(),

    OUTPUT_GOAL: `
OUTPUT GOAL
Produce a result that looks like: A real commercial product photograph, shot by a professional team, with physical realism superior to the input reference.
No interpretation. No shortcuts. No ambiguity.
`.trim()
};

/**
 * Builds the full deterministic prompt foundation v1.0.
 */
export function buildDeterministicFoundation(): string {
    return Object.values(DETERMINISTIC_SECTIONS).join('\n\n');
}
