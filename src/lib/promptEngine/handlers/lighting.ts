/**
 * Lighting Handler - Builds lighting section with validation
 */

import type { LightingConfig, SceneType } from '../sceneTypes';
import { isLightingAllowed, getSceneTypeRules } from '../sceneTypeRules';

export interface LightingResult {
    section: string;
    valid: boolean;
    error?: string;
}

export function buildLightingSection(lighting: LightingConfig, sceneType: SceneType): LightingResult {
    if (!lighting.lightingStyle) {
        return { section: 'LIGHTING: Natural, product-safe lighting.', valid: true };
    }

    if (!isLightingAllowed(sceneType, lighting.lightingStyle)) {
        const rules = getSceneTypeRules(sceneType);
        return { section: '', valid: false, error: `Lighting style "${lighting.lightingStyle}" conflicts with sceneType="${sceneType}". Blocked: ${rules.blockedLightingStyles.join(', ')}` };
    }

    const parts: string[] = ['LIGHTING:', `${lighting.lightingStyle}, product-safe, realistic.`];
    if (sceneType === 'ugc_phone') parts.push('Natural indoor ambient, no professional lighting setup.');
    else if (sceneType === 'studio_packshot') parts.push('Controlled, even illumination with product highlights.');
    else if (sceneType === 'ecommerce_blank_space') parts.push('Clean, shadow-free on background.');

    return { section: parts.join(' '), valid: true };
}
