/**
 * Composition Rules Handler - Builds physical composition section
 */

import type { CompositionRules, SceneType } from '../sceneTypes';

export interface CompositionResult {
    section: string;
    allowedObjects: Set<string>;
}

export function buildCompositionSection(compositionRules: CompositionRules, sceneType: SceneType): CompositionResult {
    const parts: string[] = ['COMPOSITION:'];
    parts.push(compositionRules.quantity === 1 ? 'Single product unit.' : `${compositionRules.quantity} product units.`);
    if (compositionRules.arrangement) parts.push(`Arrangement: ${compositionRules.arrangement}.`);
    parts.push(compositionRules.interactionObjects.length > 0
        ? `Interaction objects: ${compositionRules.interactionObjects.join(', ')}.`
        : 'No additional objects in scene.');

    const allowedObjects = new Set<string>(compositionRules.interactionObjects.map(obj => obj.toLowerCase().trim()));
    return { section: parts.join(' '), allowedObjects };
}

export function detectUnauthorizedObjects(text: string, allowedObjects: Set<string>, compositionRules: CompositionRules): string[] {
    // Objects that shouldn't appear unless explicitly declared
    // NOTE: Excludes color-descriptive words (chocolate, honey, cream, etc.) to avoid false positives
    const commonObjects = ['fruit', 'flowers', 'plant', 'candle', 'book', 'mirror', 'splash', 'droplets', 'leaves', 'petals', 'stones', 'crystals', 'fabric', 'silk', 'bowl', 'plate', 'cup', 'mug', 'scoop', 'spoon', 'brush', 'sponge', 'cotton', 'ice', 'steam', 'smoke', 'bubbles', 'foam', 'sand', 'shell', 'feather'];
    const violations: string[] = [];
    const lowerText = text.toLowerCase();

    if (compositionRules.interactionObjects.length === 0) {
        for (const obj of commonObjects) {
            if (lowerText.includes(obj)) violations.push(obj);
        }
    } else {
        for (const obj of commonObjects) {
            if (lowerText.includes(obj) && !allowedObjects.has(obj)) {
                const isPartOfAllowed = Array.from(allowedObjects).some(allowed => allowed.includes(obj) || obj.includes(allowed));
                if (!isPartOfAllowed) violations.push(obj);
            }
        }
    }
    return violations;
}
