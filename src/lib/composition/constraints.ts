/**
 * COMPOSITION CONSTRAINTS
 * 
 * Aspect ratio is STRUCTURAL, not output-only.
 * Resolved BEFORE shotType, framing, sidePlacement.
 * 
 * PRIORITY ORDER:
 * 1. Aspect Ratio
 * 2. Shot Type
 * 3. Camera Angle
 * 4. Framing
 * 5. Side Placement
 * 6. Lighting
 */

// ============================================================================
// TYPES
// ============================================================================

export type AspectRatio = '1:1' | '4:5' | '9:16' | '16:9';
export type ShotType = 'close_up' | 'portrait' | 'medium' | 'three_quarter' | 'full_body';
export type SidePlacement = 'center' | 'left' | 'right';
export type CameraAngle = 'eye_level' | 'slight_high' | 'slight_low' | 'bottom_up' | 'top_down';
export type CreationMode = 'lifestyle_ugc' | 'bg_replace' | 'product_studio';

// ============================================================================
// ASPECT RATIO CONSTRAINTS
// ============================================================================

export interface AspectConstraints {
    allowedShotTypes: ShotType[];
    allowedSidePlacement: SidePlacement[];
    allowedCameraAngles: CameraAngle[];
    maxSideOffset: number; // 0-100%
}

export const ASPECT_RATIO_CONSTRAINTS: Record<AspectRatio, AspectConstraints> = {
    '1:1': {
        allowedShotTypes: ['close_up', 'portrait', 'medium'],
        allowedSidePlacement: ['center'],
        allowedCameraAngles: ['eye_level', 'slight_high', 'slight_low'],
        maxSideOffset: 10
    },
    '4:5': {
        allowedShotTypes: ['close_up', 'portrait', 'medium', 'three_quarter'],
        allowedSidePlacement: ['center', 'left', 'right'],
        allowedCameraAngles: ['eye_level', 'slight_high', 'slight_low'],
        maxSideOffset: 60
    },
    '9:16': {
        allowedShotTypes: ['close_up', 'portrait', 'medium', 'three_quarter', 'full_body'],
        allowedSidePlacement: ['center', 'left', 'right'],
        allowedCameraAngles: ['eye_level', 'slight_high', 'slight_low', 'bottom_up', 'top_down'],
        maxSideOffset: 100
    },
    '16:9': {
        allowedShotTypes: ['close_up', 'portrait', 'medium', 'three_quarter', 'full_body'],
        allowedSidePlacement: ['center', 'left', 'right'],
        allowedCameraAngles: ['eye_level', 'slight_high', 'slight_low'],
        maxSideOffset: 80
    }
};

// ============================================================================
// SILENT OVERRIDES
// ============================================================================

export function resolveShot(
    aspect: AspectRatio,
    requested: ShotType,
    creationMode: CreationMode
): ShotType {
    const constraints = ASPECT_RATIO_CONSTRAINTS[aspect];

    // Special case: 4:5 allows full_body only in lifestyle_ugc
    if (aspect === '4:5' && requested === 'full_body') {
        if (creationMode !== 'lifestyle_ugc') {
            return 'three_quarter';
        }
    }

    // Check if allowed
    if (constraints.allowedShotTypes.includes(requested)) {
        return requested;
    }

    // Silent override to closest valid
    if (requested === 'full_body') return 'medium';
    if (requested === 'three_quarter') return 'medium';

    return constraints.allowedShotTypes[0];
}

export function resolveSidePlacement(
    aspect: AspectRatio,
    requested: SidePlacement
): SidePlacement {
    const constraints = ASPECT_RATIO_CONSTRAINTS[aspect];

    if (constraints.allowedSidePlacement.includes(requested)) {
        return requested;
    }

    // Silent override to center
    return 'center';
}

export function resolveCameraAngle(
    aspect: AspectRatio,
    requested: CameraAngle
): CameraAngle {
    const constraints = ASPECT_RATIO_CONSTRAINTS[aspect];

    if (constraints.allowedCameraAngles.includes(requested)) {
        return requested;
    }

    // Silent override to eye_level
    return 'eye_level';
}

// ============================================================================
// SIDE PLACEMENT PROMPT LANGUAGE
// ============================================================================

export function getSidePlacementPrompt(placement: SidePlacement): string {
    switch (placement) {
        case 'left':
            return 'Subject positioned in the left third of the frame, with clear empty negative space on the right reserved for copy.';
        case 'right':
            return 'Subject positioned in the right third of the frame, with clear empty negative space on the left reserved for copy.';
        case 'center':
        default:
            return 'Subject centered in frame with balanced composition.';
    }
}

// ============================================================================
// FULL RESOLUTION PIPELINE
// ============================================================================

export interface CompositionInput {
    aspectRatio: AspectRatio;
    shotType: ShotType;
    sidePlacement: SidePlacement;
    cameraAngle: CameraAngle;
    creationMode: CreationMode;
}

export interface ResolvedComposition {
    aspectRatio: AspectRatio;
    shotType: ShotType;
    sidePlacement: SidePlacement;
    cameraAngle: CameraAngle;
    placementPrompt: string;
    overrides: string[];
}

export function resolveComposition(input: CompositionInput): ResolvedComposition {
    const overrides: string[] = [];

    // 1. Aspect ratio is fixed (structural)
    const aspectRatio = input.aspectRatio;

    // 2. Resolve shot type
    const shotType = resolveShot(aspectRatio, input.shotType, input.creationMode);
    if (shotType !== input.shotType) {
        overrides.push(`shotType: ${input.shotType} → ${shotType}`);
    }

    // 3. Resolve camera angle
    const cameraAngle = resolveCameraAngle(aspectRatio, input.cameraAngle);
    if (cameraAngle !== input.cameraAngle) {
        overrides.push(`cameraAngle: ${input.cameraAngle} → ${cameraAngle}`);
    }

    // 4. Resolve side placement
    const sidePlacement = resolveSidePlacement(aspectRatio, input.sidePlacement);
    if (sidePlacement !== input.sidePlacement) {
        overrides.push(`sidePlacement: ${input.sidePlacement} → ${sidePlacement}`);
    }

    // 5. Get placement prompt language
    const placementPrompt = getSidePlacementPrompt(sidePlacement);

    return {
        aspectRatio,
        shotType,
        sidePlacement,
        cameraAngle,
        placementPrompt,
        overrides
    };
}
