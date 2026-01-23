/**
 * UI Contract Builder
 * 
 * Converts UI state to deterministic engine contract.
 * Ensures UI never sends invalid input to engine.
 */

import type { DeterministicPromptInput, SceneType } from './sceneTypes';

// ============================================================================
// UI STATE TYPE (what the frontend sends)
// ============================================================================

export interface UIState {
    sceneType: SceneType;
    productType: string;
    packaging?: string;
    physicalScale?: string;
    productColor?: string;
    handsAllowed?: boolean;
    quantity?: number;
    arrangement?: string;
    props?: string[];
    environment?: string;
    place?: string;
    lighting?: string;
    creativityLevel?: number;
    creativityTheme?: string;
    camera?: string;
    angle?: string;
    distance?: string;
    framing?: string;
    blankSpace?: 'left' | 'right' | 'top' | 'bottom';
    aspectRatio?: string;
}

// ============================================================================
// SCENE TYPE PERMISSIONS
// ============================================================================

export function isHandsAllowed(sceneType: SceneType): boolean {
    return sceneType === 'lifestyle_product' || sceneType === 'ugc_phone';
}

export function isEnvironmentAllowed(sceneType: SceneType): boolean {
    return !['studio_packshot', 'ecommerce_blank_space'].includes(sceneType);
}

export function isPropsAllowed(sceneType: SceneType): boolean {
    return ['editorial_product', 'lifestyle_product'].includes(sceneType);
}

export function isQuantityEditable(sceneType: SceneType): boolean {
    return ['editorial_product', 'bundle_kit'].includes(sceneType);
}

// ============================================================================
// DEFAULTS
// ============================================================================

const SCENE_DEFAULTS: Record<SceneType, {
    lighting: string;
    arrangement: string;
    camera: string;
    creativity: number;
    quantity: number;
}> = {
    studio_packshot: {
        lighting: 'soft studio light',
        arrangement: 'centered',
        camera: 'DSLR',
        creativity: 0,
        quantity: 1
    },
    editorial_product: {
        lighting: 'golden hour',
        arrangement: 'staggered',
        camera: 'medium format',
        creativity: 5,
        quantity: 1
    },
    lifestyle_product: {
        lighting: 'natural window light',
        arrangement: 'natural placement',
        camera: 'DSLR',
        creativity: 4,
        quantity: 1
    },
    ugc_phone: {
        lighting: 'natural window light',
        arrangement: 'held in hand',
        camera: 'smartphone',
        creativity: 2,
        quantity: 1
    },
    ecommerce_blank_space: {
        lighting: 'even lighting',
        arrangement: 'right-aligned',
        camera: 'DSLR',
        creativity: 1,
        quantity: 1
    },
    bundle_kit: {
        lighting: 'natural soft light',
        arrangement: 'grouped',
        camera: 'DSLR',
        creativity: 3,
        quantity: 3
    }
};

export function getDefaultLighting(sceneType: SceneType): string {
    return SCENE_DEFAULTS[sceneType].lighting;
}

export function getDefaultArrangement(sceneType: SceneType): string {
    return SCENE_DEFAULTS[sceneType].arrangement;
}

export function getDefaultCamera(sceneType: SceneType): string {
    return SCENE_DEFAULTS[sceneType].camera;
}

export function getDefaultCreativity(sceneType: SceneType): number {
    return SCENE_DEFAULTS[sceneType].creativity;
}

export function getDefaultQuantity(sceneType: SceneType): number {
    return SCENE_DEFAULTS[sceneType].quantity;
}

// ============================================================================
// CLAMPING / VALIDATION
// ============================================================================

export function clampCreativity(sceneType: SceneType, level: number): number {
    if (sceneType === 'studio_packshot') return 0;
    if (sceneType === 'ecommerce_blank_space') return Math.min(level, 2);
    if (sceneType === 'ugc_phone') return Math.min(level, 3);
    return Math.max(0, Math.min(10, level));
}

export function clampQuantity(sceneType: SceneType, quantity: number): number {
    if (sceneType === 'bundle_kit') return Math.max(2, quantity);
    if (!['bundle_kit', 'editorial_product'].includes(sceneType)) return 1;
    return Math.max(1, Math.min(6, quantity));
}

export function getCameraSystem(sceneType: SceneType, userChoice?: string): string {
    if (sceneType === 'ugc_phone') return 'smartphone';
    return userChoice || SCENE_DEFAULTS[sceneType].camera;
}

// ============================================================================
// CONTRACT BUILDER
// ============================================================================

export function buildContractFromUI(uiState: UIState): DeterministicPromptInput {
    const sceneType = uiState.sceneType;
    const defaults = SCENE_DEFAULTS[sceneType];

    return {
        sceneType,
        productSetup: {
            productType: uiState.productType,
            packaging: uiState.packaging || undefined,
            physicalScale: uiState.physicalScale || 'tabletop',
            productContentColor: uiState.productColor || undefined,
            handsAllowed: isHandsAllowed(sceneType) ? (uiState.handsAllowed ?? true) : false
        },
        compositionRules: {
            quantity: clampQuantity(sceneType, uiState.quantity ?? defaults.quantity),
            arrangement: uiState.arrangement || defaults.arrangement,
            interactionObjects: isPropsAllowed(sceneType) ? (uiState.props ?? []) : []
        },
        environment: isEnvironmentAllowed(sceneType) && (uiState.environment || uiState.place)
            ? { macroEnvironment: uiState.environment, microPlace: uiState.place }
            : {},
        lighting: {
            lightingStyle: uiState.lighting || defaults.lighting
        },
        creativity: {
            level: clampCreativity(sceneType, uiState.creativityLevel ?? defaults.creativity),
            theme: uiState.creativityTheme
        },
        camera: {
            cameraSystem: getCameraSystem(sceneType, uiState.camera),
            angle: uiState.angle || 'eye level',
            distance: uiState.distance || 'medium',
            framing: uiState.framing || 'centered'
        },
        ecommerce: sceneType === 'ecommerce_blank_space'
            ? { enabled: true, blankSpacePosition: uiState.blankSpace || 'left', overlaySafeArea: true }
            : { enabled: false },
        outputFormat: {
            aspectRatio: uiState.aspectRatio || '1:1'
        }
    };
}

// ============================================================================
// PRE-VALIDATION (UI should call this before submit)
// ============================================================================

export interface UIValidationResult {
    valid: boolean;
    errors: string[];
}

export function validateUIState(uiState: Partial<UIState>): UIValidationResult {
    const errors: string[] = [];

    if (!uiState.sceneType) {
        errors.push('Please select a scene type');
    }

    if (!uiState.productType?.trim()) {
        errors.push('Please describe your product');
    }

    if (uiState.sceneType === 'bundle_kit' && (uiState.quantity ?? 0) < 2) {
        errors.push('Bundle requires at least 2 products');
    }

    const requiresEnvironment = uiState.sceneType &&
        ['lifestyle_product', 'ugc_phone'].includes(uiState.sceneType);

    if (requiresEnvironment && !uiState.environment) {
        errors.push('Please select an environment');
    }

    return { valid: errors.length === 0, errors };
}

// ============================================================================
// SCENE TYPE OPTIONS FOR UI
// ============================================================================

export interface SceneTypeUIConfig {
    label: string;
    description: string;
    tier: 'basic' | 'pro';
    icon: string;
}

export const SCENE_TYPE_UI_CONFIG: Record<SceneType, SceneTypeUIConfig> = {
    studio_packshot: {
        label: 'Studio Packshot',
        description: 'Clean product shot on studio background',
        tier: 'basic',
        icon: '📦'
    },
    editorial_product: {
        label: 'Editorial',
        description: 'Styled product photography with props',
        tier: 'pro',
        icon: '✨'
    },
    lifestyle_product: {
        label: 'Lifestyle',
        description: 'Product in natural environment',
        tier: 'basic',
        icon: '🏠'
    },
    ugc_phone: {
        label: 'UGC Phone',
        description: 'Authentic smartphone-style photo',
        tier: 'pro',
        icon: '📱'
    },
    ecommerce_blank_space: {
        label: 'Ecommerce',
        description: 'Product with space for text overlay',
        tier: 'pro',
        icon: '🛒'
    },
    bundle_kit: {
        label: 'Bundle Kit',
        description: 'Multiple products together',
        tier: 'pro',
        icon: '📦📦'
    }
};

export function getAvailableSceneTypes(tier: 'basic' | 'pro'): SceneType[] {
    return Object.entries(SCENE_TYPE_UI_CONFIG)
        .filter(([_, config]) => tier === 'pro' || config.tier === 'basic')
        .map(([type]) => type as SceneType);
}
