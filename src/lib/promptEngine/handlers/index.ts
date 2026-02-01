/**
 * Handlers Index - Re-export all handlers
 */

export { buildProductSetupSection, type ProductSetupResult } from './productSetup';
export { buildCompositionSection, detectUnauthorizedObjects, type CompositionResult } from './compositionRules';
export { buildEnvironmentSection, type EnvironmentResult } from './environment';
export { buildLightingSection, type LightingResult } from './lighting';
export { buildCreativitySection, type CreativityResult } from './creativity';
export { buildCameraSection, type CameraResult } from './camera';
export { buildEcommerceSection, type EcommerceResult } from './ecommerce';
export { buildNegativePrompt, getSceneNegativeAdditions } from './negativePrompt';
