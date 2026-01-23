/**
 * RAW DOMESTIC UGC — SIMPLIFIED MAPPER
 * 
 * 1 action to activate: Open accordion = ON
 * All pro controls locked silently
 * Only 1 exposed control: Capture Geometry
 */

// ============================================================================
// CAPTURE GEOMETRY (ONLY USER CONTROL)
// ============================================================================

export type CaptureGeometry =
    | 'eye_level'
    | 'slight_top_down'
    | 'crooked_lazy';

export const CAPTURE_GEOMETRY_OPTIONS = [
    { id: 'eye_level' as CaptureGeometry, label: 'Eye-level', prompt: 'camera at eye level, casual framing' },
    { id: 'slight_top_down' as CaptureGeometry, label: 'Slight top-down', prompt: 'camera slightly above, looking down at product' },
    { id: 'crooked_lazy' as CaptureGeometry, label: 'Crooked / lazy angle', prompt: 'slightly tilted camera, imperfect lazy framing' }
];

// ============================================================================
// ENGINE-OWNED VALUES (NEVER EXPOSED TO USER)
// ============================================================================

const UGC_ENGINE_OVERRIDES = {
    camera: 'smartphone_front',
    depth: 'flat',
    focus: 'uniform',
    background: 'never_blurred',
    lighting: 'ambient_domestic',
    framing: 'slightly_wrong',
    maxHands: 1,
    handStyle: 'cropped_single'
};

// ============================================================================
// STRIPPED CONTROLS (DELETED FROM UGC)
// ============================================================================

export const UGC_STRIPPED_CONTROLS = [
    'skinRealism',
    'appearanceLevel',
    'sceneOrder',
    'environment',
    'lighting',
    'camera',
    'cameraType',
    'aspectRatio',
    'depth',
    'bokeh',
    'blur'
];

// ============================================================================
// FORBIDDEN VISUAL QUALITIES
// ============================================================================

const UGC_FORBIDDEN = [
    'DSLR',
    'mirrorless',
    'bokeh',
    'cinematic blur',
    'portrait mode',
    'pro lighting',
    'studio gradient',
    'clean background',
    'professional depth of field',
    'selective focus'
];

// ============================================================================
// PROMPT GENERATION
// ============================================================================

export interface UGCPromptResult {
    prompt: string;
    negativePrompt: string;
}

export function mapRawDomesticUGC(
    productDescription: string,
    captureGeometry: CaptureGeometry
): UGCPromptResult {
    const geometry = CAPTURE_GEOMETRY_OPTIONS.find(g => g.id === captureGeometry);

    const parts: string[] = [];

    // Core UGC description
    parts.push('Raw domestic UGC-style photo.');
    parts.push(`Product: ${productDescription}.`);

    // Capture geometry (only user control)
    parts.push(geometry?.prompt || 'casual framing');

    // Engine-owned technical constraints
    parts.push('Shot on smartphone front camera.');
    parts.push('Flat depth, uniform focus, no background blur.');
    parts.push('Ambient domestic lighting only.');
    parts.push('Slightly imperfect framing, not composed.');

    // Hand constraint
    parts.push('HANDS: Maximum 1 hand visible, cropped at edge of frame. No duplicate hands. No extra limbs.');

    // Anti-professional directive
    parts.push('CRITICAL: This must look casual, bored, accidental. NOT professional. NOT designed. NOT polished.');
    parts.push('If it looks "nice" or "clean", it is WRONG.');

    // Negative prompt
    const negativePrompt = [
        ...UGC_FORBIDDEN,
        'studio lighting',
        'professional photography',
        'composed framing',
        'multiple hands',
        'two hands',
        'clean aesthetic',
        'designed look'
    ].join(', ');

    return {
        prompt: parts.join(' '),
        negativePrompt
    };
}

// ============================================================================
// VALIDATION
// ============================================================================

export function isUGCActive(accordionOpen: boolean): boolean {
    // Accordion open = mode active. No toggle needed.
    return accordionOpen;
}

export function getUGCLockedState(): typeof UGC_ENGINE_OVERRIDES {
    return { ...UGC_ENGINE_OVERRIDES };
}
