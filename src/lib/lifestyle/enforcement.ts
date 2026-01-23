/**
 * LIFESTYLE CAMERA ENFORCEMENT
 * 
 * If creationIntent === 'ugc', force smartphone.
 * Silent override. No warning. No logs.
 */

export type CameraType = 'smartphone' | 'dslr' | 'mirrorless';

// ============================================================================
// CAMERA ENFORCEMENT
// ============================================================================

export function enforceCamera(
    creationIntent: string,
    requestedCamera: CameraType
): CameraType {
    // UGC = smartphone ALWAYS
    if (creationIntent === 'ugc' || creationIntent === 'raw_ugc' || creationIntent === 'pov') {
        return 'smartphone';
    }

    return requestedCamera;
}

// ============================================================================
// DEPTH ENFORCEMENT
// ============================================================================

export type DepthStyle = 'flat' | 'shallow' | 'deep';

export function enforceDepth(
    creationIntent: string,
    requestedDepth: DepthStyle
): DepthStyle {
    // UGC = flat ALWAYS
    if (creationIntent === 'ugc' || creationIntent === 'raw_ugc' || creationIntent === 'pov') {
        return 'flat';
    }

    return requestedDepth;
}

// ============================================================================
// UGC FORBIDDEN KEYWORDS (STRIP FROM PROMPT)
// ============================================================================

export const UGC_FORBIDDEN_KEYWORDS = [
    'bokeh',
    'cinematic',
    'shallow depth',
    'blur',
    'blurred background',
    'portrait mode',
    'depth of field',
    'DSLR',
    'mirrorless',
    'professional lens'
];

export function stripForbiddenFromPrompt(prompt: string, isUGC: boolean): string {
    if (!isUGC) return prompt;

    let cleaned = prompt;
    for (const keyword of UGC_FORBIDDEN_KEYWORDS) {
        const regex = new RegExp(keyword, 'gi');
        cleaned = cleaned.replace(regex, '');
    }

    // Clean up double spaces
    cleaned = cleaned.replace(/\s{2,}/g, ' ').trim();

    return cleaned;
}

// ============================================================================
// HANDS ENFORCEMENT
// ============================================================================

export type SceneType = 'product_studio' | 'lifestyle' | 'ugc';

export function getMaxHands(sceneType: SceneType): number {
    switch (sceneType) {
        case 'product_studio':
            return 0;
        case 'lifestyle':
            return 2;
        case 'ugc':
            return 1;
        default:
            return 2;
    }
}

export function getHandsConstraint(sceneType: SceneType): string {
    const maxHands = getMaxHands(sceneType);

    if (maxHands === 0) {
        return 'HANDS CONSTRAINT: No hands. No fingers. No human elements. Product only.';
    }

    if (maxHands === 1) {
        return 'HANDS CONSTRAINT: Maximum 1 hand visible, cropped at edge of frame. No duplicate hands. No extra limbs. No plastic skin. Hands must look human, imperfect, and real.';
    }

    return 'HANDS CONSTRAINT: Maximum 2 natural hands. No duplicate hands. No extra limbs. No plastic skin. No perfect symmetry. Hands must look human, imperfect, and real.';
}
