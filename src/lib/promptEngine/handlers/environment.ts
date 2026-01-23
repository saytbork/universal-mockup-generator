/**
 * Environment Handler - Conditional environment section builder
 */

import type { EnvironmentConfig, SceneType } from '../sceneTypes';
import { isEnvironmentAllowed, getSceneTypeRules } from '../sceneTypeRules';

export interface EnvironmentResult {
    section: string;
    active: boolean;
}

export function buildEnvironmentSection(environment: EnvironmentConfig, sceneType: SceneType): EnvironmentResult {
    if (!isEnvironmentAllowed(sceneType)) return { section: '', active: false };

    const parts: string[] = ['ENVIRONMENT:'];
    if (environment.macroEnvironment) parts.push(environment.macroEnvironment);
    if (environment.microPlace) parts.push(`- ${environment.microPlace}`);

    if (sceneType === 'ugc_phone') {
        parts.push('Real domestic environment, not stylized or perfect.');
        parts.push('Lived-in space with natural imperfections.');
    } else if (sceneType === 'lifestyle_product') {
        parts.push('Natural, contextual setting.');
    }

    if (!environment.macroEnvironment && !environment.microPlace) return { section: '', active: false };
    return { section: parts.join(' '), active: true };
}
