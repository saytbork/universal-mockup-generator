/**
 * Ecommerce Handler - Override mode for blank space layouts
 */

import type { EcommerceConfig, SceneType } from '../sceneTypes';

export interface EcommerceResult {
    section: string;
    active: boolean;
    overrides: string[];
}

export function buildEcommerceSection(ecommerce: EcommerceConfig, sceneType: SceneType): EcommerceResult {
    if (sceneType !== 'ecommerce_blank_space' || !ecommerce.enabled) {
        return { section: '', active: false, overrides: [] };
    }

    const parts: string[] = ['ECOMMERCE RULES:'];
    const overrides: string[] = ['environment', 'advanced_creativity', 'lifestyle_elements'];

    if (ecommerce.blankSpacePosition) {
        const opposite = ecommerce.blankSpacePosition === 'left' ? 'right' : ecommerce.blankSpacePosition === 'right' ? 'left' : ecommerce.blankSpacePosition === 'top' ? 'bottom' : 'top';
        parts.push(`Product positioned on ${opposite} of frame.`);
        parts.push(`Large, clean negative space on ${ecommerce.blankSpacePosition}.`);
    } else {
        parts.push('Product with generous negative space.');
    }

    if (ecommerce.overlaySafeArea) {
        parts.push('Reserve text-safe overlay zone in negative space.');
        parts.push('No visual elements in overlay zone.');
    }

    parts.push('Clean, uncluttered background.');
    parts.push('Commercial composition optimized for UI/text placement.');
    parts.push('No environment, no lifestyle elements.');

    return { section: parts.join(' '), active: true, overrides };
}
