/**
 * LIFESTYLE PROMPT INJECTION
 * 
 * Injects Lifestyle Intent rules into prompts.
 * Overrides generic rules when specific intent is active.
 */

import type { LifestyleIntent } from './lifestyleIntent';
import {
    INTENT_PERSON_RULES,
    INTENT_INTERACTION_RULES,
    INTENT_CAMERA_RULES,
    INTENT_DEPTH_RULES
} from './lifestyleIntent';
import { injectUGCDepthRules } from './rawDomesticUGC';

// ============================================================================
// INTENT-BASED INJECTION
// ============================================================================

export interface LifestyleInjection {
    personDirective: string;
    interactionDirective: string;
    cameraDirective: string;
    depthDirective: string;
    fullInjection: string;
}

export function injectLifestyleIntent(intent: LifestyleIntent): LifestyleInjection {
    const personRules = INTENT_PERSON_RULES[intent];
    const interactionRules = INTENT_INTERACTION_RULES[intent];
    const cameraRules = INTENT_CAMERA_RULES[intent];
    const depthRules = INTENT_DEPTH_RULES[intent];

    // Person directive
    let personDirective: string;
    if (!personRules.faceAllowed) {
        personDirective = 'PERSON: No face visible. No identity. Only implied presence through hands or partial body.';
    } else if (personRules.emphasis === 'secondary') {
        personDirective = 'PERSON: May be present but secondary to product and environment.';
    } else {
        personDirective = 'PERSON: Fully enabled for storytelling. Natural interaction.';
    }

    // Interaction directive
    const allowedInteractions = interactionRules.allowed.join(', ');
    const interactionDirective = `PRODUCT INTERACTION: ${allowedInteractions}. Default: ${interactionRules.default}.`;

    // Camera directive
    const cameraDirective = `CAMERA: ${cameraRules.allowedCameras.join(' or ')}. Framing: ${cameraRules.framing}.`;

    // Depth directive
    let depthDirective: string;
    if (depthRules.locked) {
        depthDirective = `DEPTH: ${depthRules.mode.toUpperCase()} (locked). No background separation.`;
    } else {
        depthDirective = `DEPTH: ${depthRules.mode}. Natural depth of field.`;
    }

    const fullInjection = [
        '',
        `--- LIFESTYLE INTENT: ${intent.toUpperCase()} ---`,
        personDirective,
        interactionDirective,
        cameraDirective,
        depthDirective,
        '--- END LIFESTYLE INTENT ---'
    ].join('\n');

    return {
        personDirective,
        interactionDirective,
        cameraDirective,
        depthDirective,
        fullInjection
    };
}

// ============================================================================
// UGC MODE INJECTION (OVERRIDES EVERYTHING)
// ============================================================================

export function injectRawDomesticUGC(): string {
    return [
        '',
        '--- RAW DOMESTIC UGC MODE ---',
        'MODE: Careless front-camera capture at home.',
        'ALL PROFESSIONAL CONTROLS LOCKED.',
        '',
        injectUGCDepthRules(),
        '',
        'MANDATORY IMPERFECTIONS:',
        '- Slightly off-center framing',
        '- Ambient lighting only (no studio)',
        '- Visible domestic clutter acceptable',
        '- No styling, no staging',
        '- Real, unpolished moment',
        '--- END RAW UGC ---'
    ].join('\n');
}
