/**
 * Scene Type Rules - Each sceneType controls allowed/prohibited sections
 */

import type { SceneType } from './sceneTypes';

export interface SceneTypeRules {
    description: string;
    allowsEnvironment: boolean;
    allowsHands: boolean;
    allowsAdvancedCreativity: boolean;
    allowedLightingStyles: string[];
    blockedLightingStyles: string[];
    requiredSections: string[];
    prohibitedSections: string[];
    imperfectionLevel: 'none' | 'minimal' | 'moderate' | 'high';
    realismLevel: 'commercial' | 'editorial' | 'lifestyle' | 'raw_ugc';
    negativePromptAdditions: string[];
}

export const SCENE_TYPE_RULES: Record<SceneType, SceneTypeRules> = {
    studio_packshot: {
        description: 'Clean studio packshot photography. Commercial product hero shot with controlled lighting and clean background. Studio setting. No real environment. No lifestyle context.',
        allowsEnvironment: false,
        allowsHands: false,
        allowsAdvancedCreativity: false,
        allowedLightingStyles: ['studio key light', 'soft box', 'beauty dish', 'natural soft light', 'gradient lighting', 'rim light', 'product lighting', 'soft studio light', 'studio soft light'],
        blockedLightingStyles: ['ring light', 'phone flash', 'harsh sunlight', 'candlelight', 'neon', 'window light', 'golden hour'],
        requiredSections: ['product', 'lighting', 'camera'],
        prohibitedSections: ['environment', 'person', 'hands', 'lifestyle', 'routine', 'wellness'],
        imperfectionLevel: 'none',
        realismLevel: 'commercial',
        negativePromptAdditions: [
            'hands', 'humans', 'person', 'environment', 'lifestyle cues', 'lifestyle scene',
            'phone camera artifacts', 'amateur photography', 'cluttered background',
            'home environment', 'kitchen', 'bathroom', 'vanity', 'counter', 'countertop',
            'routine', 'morning routine', 'daily use', 'wellness routine',
            'bedroom', 'living room', 'any room environment',
            'nature', 'outdoor', 'indoor real space',
            'product in use', 'person using product', 'usage context'
        ]
    },
    editorial_product: {
        description: 'Editorial product photography with artistic styling and curated composition.',
        allowsEnvironment: true,
        allowsHands: false,
        allowsAdvancedCreativity: true,
        allowedLightingStyles: ['natural soft light', 'golden hour', 'overcast diffused', 'studio key light', 'dramatic shadow', 'editorial lighting'],
        blockedLightingStyles: ['ring light', 'phone flash', 'harsh direct'],
        requiredSections: ['product', 'lighting', 'camera'],
        prohibitedSections: ['person', 'hands', 'ugc_artifacts'],
        imperfectionLevel: 'minimal',
        realismLevel: 'editorial',
        negativePromptAdditions: ['hands', 'humans', 'phone camera', 'amateur photography', 'messy scene', 'cluttered']
    },
    lifestyle_product: {
        description: 'Lifestyle product photography showing product in natural, real-world context.',
        allowsEnvironment: true,
        allowsHands: true,
        allowsAdvancedCreativity: true,
        allowedLightingStyles: ['natural window light', 'golden hour', 'soft ambient', 'overcast diffused', 'morning light', 'afternoon light', 'indoor ambient'],
        blockedLightingStyles: ['harsh studio', 'ring light'],
        requiredSections: ['product', 'environment', 'lighting', 'camera'],
        prohibitedSections: ['studio_backdrop', 'commercial_polish'],
        imperfectionLevel: 'moderate',
        realismLevel: 'lifestyle',
        negativePromptAdditions: ['studio backdrop', 'commercial polish', 'perfect symmetry', 'product-only isolation']
    },
    ugc_phone: {
        description: 'User-generated content captured with smartphone. Natural, imperfect, authentic aesthetic.',
        allowsEnvironment: true,
        allowsHands: true,
        allowsAdvancedCreativity: false,
        allowedLightingStyles: ['natural window light', 'indoor ambient', 'overcast', 'bathroom lighting', 'kitchen lighting', 'bedroom lighting'],
        blockedLightingStyles: ['ring light', 'studio lighting', 'professional lighting', 'beauty dish', 'soft box', 'cinematic lighting'],
        requiredSections: ['product', 'environment', 'camera'],
        prohibitedSections: ['studio_lighting', 'perfect_symmetry', 'commercial_composition', 'professional_camera'],
        imperfectionLevel: 'high',
        realismLevel: 'raw_ugc',
        negativePromptAdditions: ['studio lighting', 'perfect symmetry', 'commercial polish', 'professional photography', 'ring light effect', 'beauty filter', 'skin smoothing', 'influencer styling', 'centered composition', 'HDR look']
    },
    ecommerce_blank_space: {
        description: 'Ecommerce product shot with intentional blank space for text and UI overlays.',
        allowsEnvironment: false,
        allowsHands: false,
        allowsAdvancedCreativity: false,
        allowedLightingStyles: ['studio soft light', 'even lighting', 'product lighting', 'clean white light'],
        blockedLightingStyles: ['dramatic shadow', 'harsh contrast', 'moody lighting', 'natural window'],
        requiredSections: ['product', 'lighting', 'camera', 'ecommerce_layout'],
        prohibitedSections: ['environment', 'person', 'hands', 'lifestyle', 'creativity'],
        imperfectionLevel: 'none',
        realismLevel: 'commercial',
        negativePromptAdditions: ['environment', 'lifestyle', 'hands', 'humans', 'complex background', 'shadows on background', 'cluttered']
    },
    bundle_kit: {
        description: 'Bundle or kit photography showing multiple products together in organized arrangement.',
        allowsEnvironment: true,
        allowsHands: false,
        allowsAdvancedCreativity: true,
        allowedLightingStyles: ['studio soft light', 'natural soft light', 'even lighting', 'product lighting', 'lifestyle ambient'],
        blockedLightingStyles: ['harsh direct', 'ring light', 'dramatic single source'],
        requiredSections: ['product', 'composition', 'lighting', 'camera'],
        prohibitedSections: ['person', 'hands'],
        imperfectionLevel: 'minimal',
        realismLevel: 'editorial',
        negativePromptAdditions: ['hands', 'humans', 'single product only', 'cluttered arrangement', 'overlapping products']
    }
};

export function getSceneTypeRules(sceneType: SceneType): SceneTypeRules {
    return SCENE_TYPE_RULES[sceneType];
}

export function isLightingAllowed(sceneType: SceneType, lightingStyle: string): boolean {
    const rules = SCENE_TYPE_RULES[sceneType];
    const normalized = lightingStyle.toLowerCase().trim();
    if (rules.blockedLightingStyles.some(blocked => normalized.includes(blocked.toLowerCase()))) {
        return false;
    }
    if (rules.realismLevel === 'commercial' || sceneType === 'ugc_phone') {
        return rules.allowedLightingStyles.some(allowed =>
            normalized.includes(allowed.toLowerCase()) || allowed.toLowerCase().includes(normalized)
        );
    }
    return true;
}

export function isEnvironmentAllowed(sceneType: SceneType): boolean {
    return SCENE_TYPE_RULES[sceneType].allowsEnvironment;
}

export function areHandsAllowed(sceneType: SceneType): boolean {
    return SCENE_TYPE_RULES[sceneType].allowsHands;
}

export function getNegativePromptAdditions(sceneType: SceneType): string[] {
    return SCENE_TYPE_RULES[sceneType].negativePromptAdditions;
}
