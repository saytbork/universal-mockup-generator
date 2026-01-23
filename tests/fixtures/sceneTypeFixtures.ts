/**
 * CANONICAL SCENE TYPE FIXTURES
 * 
 * 6 PASS fixtures — one per sceneType.
 * Minimal, canonical, no noise.
 * 
 * CRITICAL: If any fixture changes result, v1 is BROKEN.
 */

import type { DeterministicPromptInput } from '../src/lib/promptEngine/sceneTypes';

// ============================================================================
// 1. STUDIO PACKSHOT
// ============================================================================

export const FIXTURE_STUDIO_PACKSHOT: DeterministicPromptInput = {
    sceneType: 'studio_packshot',
    productSetup: {
        productType: 'vitamin supplement bottle',
        packaging: 'white plastic bottle with cap',
        physicalScale: 'tabletop',
        productContentColor: 'orange',
        handsAllowed: false
    },
    compositionRules: {
        quantity: 1,
        arrangement: 'centered',
        interactionObjects: []
    },
    environment: {},
    lighting: {
        lightingStyle: 'soft studio light'
    },
    creativity: {
        level: 0
    },
    camera: {
        cameraSystem: 'DSLR',
        angle: 'eye level',
        distance: 'medium',
        rotation: '0',
        framing: 'centered'
    },
    ecommerce: {
        enabled: false
    },
    outputFormat: {
        aspectRatio: '1:1'
    }
};

// ============================================================================
// 2. EDITORIAL PRODUCT
// ============================================================================

export const FIXTURE_EDITORIAL_PRODUCT: DeterministicPromptInput = {
    sceneType: 'editorial_product',
    productSetup: {
        productType: 'luxury face cream',
        packaging: 'glass jar with gold lid',
        physicalScale: 'tabletop',
        productContentColor: 'white',
        handsAllowed: false
    },
    compositionRules: {
        quantity: 2,
        arrangement: 'staggered',
        interactionObjects: ['marble slab', 'dried flowers']
    },
    environment: {
        macroEnvironment: 'indoor',
        microPlace: 'minimalist surface'
    },
    lighting: {
        lightingStyle: 'golden hour'
    },
    creativity: {
        level: 5,
        theme: 'elegant',
        paletteSource: 'neutral tones'
    },
    camera: {
        cameraSystem: 'medium format',
        angle: 'slight top-down',
        distance: 'medium-close',
        rotation: '0',
        framing: 'rule of thirds'
    },
    ecommerce: {
        enabled: false
    },
    outputFormat: {
        aspectRatio: '4:5'
    }
};

// ============================================================================
// 3. LIFESTYLE PRODUCT
// ============================================================================

export const FIXTURE_LIFESTYLE_PRODUCT: DeterministicPromptInput = {
    sceneType: 'lifestyle_product',
    productSetup: {
        productType: 'protein powder',
        packaging: 'matte black container',
        physicalScale: 'tabletop',
        productContentColor: 'chocolate brown',
        handsAllowed: true
    },
    compositionRules: {
        quantity: 1,
        arrangement: 'natural placement',
        interactionObjects: ['blender', 'banana', 'towel']
    },
    environment: {
        macroEnvironment: 'indoor',
        microPlace: 'kitchen counter'
    },
    lighting: {
        lightingStyle: 'natural window light'
    },
    creativity: {
        level: 4,
        theme: 'active lifestyle'
    },
    camera: {
        cameraSystem: 'DSLR',
        angle: 'eye level',
        distance: 'medium',
        rotation: '0',
        framing: 'environmental'
    },
    ecommerce: {
        enabled: false
    },
    outputFormat: {
        aspectRatio: '4:5'
    }
};

// ============================================================================
// 4. UGC PHONE
// ============================================================================

export const FIXTURE_UGC_PHONE: DeterministicPromptInput = {
    sceneType: 'ugc_phone',
    productSetup: {
        productType: 'gummy vitamins',
        packaging: 'clear plastic jar',
        physicalScale: 'handheld',
        productContentColor: 'multi-color',
        handsAllowed: true
    },
    compositionRules: {
        quantity: 1,
        arrangement: 'held in hand',
        interactionObjects: []
    },
    environment: {
        macroEnvironment: 'indoor',
        microPlace: 'bathroom vanity'
    },
    lighting: {
        lightingStyle: 'bathroom lighting'
    },
    creativity: {
        level: 2
    },
    camera: {
        cameraSystem: 'smartphone',
        angle: 'selfie angle',
        distance: 'close',
        rotation: 'slight tilt',
        framing: 'off-center'
    },
    ecommerce: {
        enabled: false
    },
    outputFormat: {
        aspectRatio: '9:16'
    }
};

// ============================================================================
// 5. ECOMMERCE BLANK SPACE
// ============================================================================

export const FIXTURE_ECOMMERCE_BLANK_SPACE: DeterministicPromptInput = {
    sceneType: 'ecommerce_blank_space',
    productSetup: {
        productType: 'skincare serum',
        packaging: 'amber glass dropper bottle',
        physicalScale: 'tabletop',
        productContentColor: 'golden',
        handsAllowed: false
    },
    compositionRules: {
        quantity: 1,
        arrangement: 'right-aligned',
        interactionObjects: []
    },
    environment: {},
    lighting: {
        lightingStyle: 'even lighting'
    },
    creativity: {
        level: 1
    },
    camera: {
        cameraSystem: 'DSLR',
        angle: 'eye level',
        distance: 'medium',
        rotation: '0',
        framing: 'product with negative space'
    },
    ecommerce: {
        enabled: true,
        blankSpacePosition: 'left',
        overlaySafeArea: true
    },
    outputFormat: {
        aspectRatio: '1:1'
    }
};

// ============================================================================
// 6. BUNDLE KIT
// ============================================================================

export const FIXTURE_BUNDLE_KIT: DeterministicPromptInput = {
    sceneType: 'bundle_kit',
    productSetup: {
        productType: 'skincare routine set',
        packaging: 'mixed bottles and jars',
        physicalScale: 'tabletop',
        productContentColor: 'white and clear',
        handsAllowed: false
    },
    compositionRules: {
        quantity: 4,
        arrangement: 'grouped display',
        interactionObjects: []
    },
    environment: {
        macroEnvironment: 'indoor',
        microPlace: 'clean surface'
    },
    lighting: {
        lightingStyle: 'natural soft light'
    },
    creativity: {
        level: 3
    },
    camera: {
        cameraSystem: 'DSLR',
        angle: 'slight top-down',
        distance: 'medium-wide',
        rotation: '0',
        framing: 'full kit visible'
    },
    ecommerce: {
        enabled: false
    },
    outputFormat: {
        aspectRatio: '16:9'
    }
};

// ============================================================================
// FIXTURE REGISTRY
// ============================================================================

export const SCENE_TYPE_FIXTURES = {
    studio_packshot: FIXTURE_STUDIO_PACKSHOT,
    editorial_product: FIXTURE_EDITORIAL_PRODUCT,
    lifestyle_product: FIXTURE_LIFESTYLE_PRODUCT,
    ugc_phone: FIXTURE_UGC_PHONE,
    ecommerce_blank_space: FIXTURE_ECOMMERCE_BLANK_SPACE,
    bundle_kit: FIXTURE_BUNDLE_KIT
} as const;

export type SceneTypeFixtureKey = keyof typeof SCENE_TYPE_FIXTURES;
