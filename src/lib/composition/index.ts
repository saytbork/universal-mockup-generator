/**
 * COMPOSITION MODULE — PUBLIC API
 */

// Constraints
export type {
    AspectRatio,
    ShotType,
    SidePlacement,
    CameraAngle,
    CreationMode,
    AspectConstraints,
    CompositionInput,
    ResolvedComposition
} from './constraints';

export {
    ASPECT_RATIO_CONSTRAINTS,
    resolveShot,
    resolveSidePlacement,
    resolveCameraAngle,
    getSidePlacementPrompt,
    resolveComposition
} from './constraints';

// Lighting
export type { TimeOfDay, LightingStyle, LightingInput, ResolvedLighting } from './lighting';
export { VALID_LIGHTING, resolveLighting, getLightingPrompt } from './lighting';

// Mode Isolation
export type { PromptFields } from './modeIsolation';
export {
    BG_REPLACE_STRIPPED,
    BG_REPLACE_ALLOWED,
    stripForBgReplace,
    shouldStripEnvironment,
    getModeBehavior
} from './modeIsolation';

// Assembly
export type { FullPromptInput, AssembledPrompt } from './assembly';
export { assemblePrompt } from './assembly';
