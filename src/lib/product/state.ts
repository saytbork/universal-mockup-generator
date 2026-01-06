/**
 * PRODUCT STUDIO STATE
 * 
 * State type for Product Studio UI.
 * Wires to creativity, composition, lighting, and camera systems.
 */

import type { CreativeMode } from '../creativity/schema';
import type { CommercialComposition } from '../system/commercialComposition';
import type { AspectRatio, SidePlacement, ShotType, CameraAngle } from '../composition/constraints';
import type { TimeOfDay, LightingStyle } from '../composition/lighting';

// ============================================================================
// PRODUCT STUDIO STATE TYPE
// ============================================================================

export interface ProductStudioState {
    // Art Direction (Creativity) - DOMINANT
    creativeMode: CreativeMode;

    // Commercial Composition
    commercialComposition: CommercialComposition;

    // Product Structure (legacy name in UI)
    productCount: 1 | 2 | 3;

    // Environment
    environment: 'studio_white' | 'studio_gradient' | 'abstract' | 'editorial_surface';
    environmentColor?: string;

    // Lighting
    timeOfDay: TimeOfDay;
    lightingStyle: LightingStyle;

    // Camera
    cameraShot: ShotType;
    cameraAngle: CameraAngle;
    sidePlacement: SidePlacement;

    // Output
    aspectRatio: AspectRatio;
}

// ============================================================================
// DEFAULTS
// ============================================================================

export const DEFAULT_PRODUCT_STUDIO_STATE: ProductStudioState = {
    creativeMode: 'high_end_studio',
    commercialComposition: 'hero_product',
    productCount: 1,
    environment: 'studio_white',
    timeOfDay: 'midday',
    lightingStyle: 'natural_light',
    cameraShot: 'medium',
    cameraAngle: 'eye_level',
    sidePlacement: 'center',
    aspectRatio: '1:1'
};

// ============================================================================
// ENVIRONMENT OPTIONS
// ============================================================================

export const PRODUCT_STUDIO_ENVIRONMENTS = [
    {
        id: 'studio_white',
        label: 'Clean White',
        prompt: 'pure white seamless studio background'
    },
    {
        id: 'studio_gradient',
        label: 'Subtle Gradient',
        prompt: 'soft gradient studio background with subtle color transition'
    },
    {
        id: 'abstract',
        label: 'Abstract',
        prompt: 'abstract geometric background with modern design elements'
    },
    {
        id: 'editorial_surface',
        label: 'Editorial Surface',
        prompt: 'premium textured surface like marble, concrete, or natural stone'
    }
];

// ============================================================================
// BLOCK CONFIGURATION FOR UI
// ============================================================================

export const PRODUCT_STUDIO_UI_BLOCKS = [
    {
        id: 'creativity',
        order: 1,
        title: 'Art Direction',
        dominant: true,
        subtitle: 'This is the creative brain.',
        component: 'CreativitySelector'
    },
    {
        id: 'commercial_composition',
        order: 2,
        title: 'Commercial Composition',
        dominant: false,
        subtitle: 'How your products tell a story.',
        component: 'CompositionSelector'
    },
    {
        id: 'environment',
        order: 3,
        title: 'Environment',
        dominant: false,
        subtitle: 'Background and surface.',
        component: 'EnvironmentSelector'
    },
    {
        id: 'lighting',
        order: 4,
        title: 'Lighting',
        dominant: false,
        subtitle: 'Light quality and mood.',
        component: 'LightingSelector'
    },
    {
        id: 'camera',
        order: 5,
        title: 'Camera & Placement',
        dominant: false,
        subtitle: 'Framing and position.',
        component: 'CameraSelector'
    },
    {
        id: 'output',
        order: 6,
        title: 'Output Format',
        dominant: false,
        subtitle: 'Aspect ratio.',
        component: 'OutputSelector'
    }
];
