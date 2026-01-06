/**
 * PREMIUM PRODUCT STUDIO SCHEMA v1
 * 
 * Objetivo: Renders nivel OLLY / AG1 / Neuro
 * 
 * Orden jerárquico:
 * 1. SceneType (manda todo)
 * 2. ProductDefinition
 * 3. Environment + MicroPlace (condicional)
 * 4. Lighting
 * 5. Bundle (si aplica)
 */

// ============================================================================
// SCENE TYPE (ROOT CONTROLLER)
// ============================================================================

export type SceneType =
    | 'studio_branding'      // Producto protagonista, fondo limpio, sin environment
    | 'editorial_product'    // Producto + props controlados, look editorial
    | 'lifestyle_real'       // Environment real, luz natural, sin rostro
    | 'ugc_phone'           // Persona presente, cámara phone, imperfecciones
    | 'bundle_hero';        // 2-5 productos, jerarquía clara

// ============================================================================
// PRODUCT DEFINITION
// ============================================================================

export type ProductCategory =
    | 'supplement_capsule'
    | 'supplement_powder'
    | 'supplement_gummy'
    | 'supplement_liquid'
    | 'skincare_serum'
    | 'skincare_cream'
    | 'skincare_cleanser'
    | 'beverage'
    | 'food'
    | 'other';

export type PackagingType =
    | 'bottle_plastic'
    | 'bottle_glass'
    | 'jar_plastic'
    | 'jar_glass'
    | 'tube'
    | 'sachet'
    | 'box'
    | 'pouch'
    | 'dropper'
    | 'pump'
    | 'can'
    | 'other';

export interface ProductDefinition {
    /** Required: What the product is */
    category: ProductCategory;

    /** Required: Packaging type */
    packaging: PackagingType;

    /** Optional: Brand name (for reference, not rendered) */
    brandName?: string;

    /** Optional: Product name */
    productName?: string;

    /** Required: Primary color of product/packaging */
    primaryColor: string;

    /** Optional: Secondary/accent color */
    accentColor?: string;

    /** Optional: Content color (for transparent packaging) */
    contentColor?: string;

    /** Physical scale */
    scale: 'small' | 'medium' | 'large';
}

// ============================================================================
// ENVIRONMENT (CONDICIONAL - solo Lifestyle Real)
// ============================================================================

export type MacroEnvironment =
    // Indoor
    | 'kitchen'
    | 'living_room'
    | 'bedroom'
    | 'bathroom'
    | 'workspace'
    | 'hallway'
    | 'home_gym'
    | 'balcony_terrace'
    // Outdoor
    | 'urban_exterior'
    | 'natural_exterior'
    | 'parking_lot'
    | 'backyard_patio'
    | 'street_corner'
    // Custom
    | 'custom';

export type MicroPlace =
    // Kitchen
    | 'kitchen_counter'
    | 'breakfast_table'
    | 'coffee_station'
    | 'near_stove'
    | 'refrigerator_shelf'
    // Living Room
    | 'coffee_table'
    | 'side_table'
    | 'bookshelf'
    | 'tv_console'
    | 'window_sill'
    // Bedroom
    | 'nightstand'
    | 'dresser'
    | 'vanity'
    | 'bed_surface'
    // Bathroom
    | 'bathroom_counter'
    | 'shower_shelf'
    | 'medicine_cabinet'
    | 'bathtub_edge'
    // Workspace
    | 'desk'
    | 'desk_organizer'
    | 'monitor_stand'
    // Outdoor
    | 'outdoor_table'
    | 'garden_bench'
    | 'patio_railing'
    | 'car_cupholder'
    | 'gym_bench'
    // Custom
    | 'custom';

export interface EnvironmentConfig {
    /** Required for lifestyle_real */
    macro: MacroEnvironment;

    /** Required: specific placement within macro */
    microPlace: MicroPlace;

    /** Optional: custom description if macro/micro = custom */
    customDescription?: string;
}

// ============================================================================
// LIGHTING
// ============================================================================

export type LightingStyle =
    // Natural / Real-world
    | 'natural_light'
    | 'sunny_day'
    | 'golden_hour'
    | 'overcast'
    | 'cozy_indoors'
    | 'ring_light'
    | 'mood_lighting'
    | 'night_mode'
    | 'flash_photo'
    // Studio (engine-level, not always exposed in UI)
    | 'studio_soft'
    | 'studio_dramatic';

// ============================================================================
// BUNDLE ENTITY
// ============================================================================

export type BundleType = 'duo' | 'trio' | 'kit';

export type BundleLayout = 'linear' | 'pyramid' | 'cluster';

export type BundleSpacing = 'tight' | 'balanced' | 'airy';

export interface BundleProduct {
    /** Product definition */
    product: ProductDefinition;

    /** Is this the hero (main) product? */
    isHero: boolean;

    /** Position in layout (1 = front/center) */
    position: number;
}

export interface BundleConfig {
    /** Required: Type of bundle */
    type: BundleType;

    /** Required: Products in bundle (2-5) */
    products: BundleProduct[];

    /** Required: Layout style */
    layout: BundleLayout;

    /** Required: Spacing between products */
    spacing: BundleSpacing;
}

// ============================================================================
// CAMERA (simplificado)
// ============================================================================

export type CameraAngle =
    | 'eye_level'
    | 'slight_top_down'
    | 'top_down'
    | 'low_angle'
    | 'three_quarter';

export type CameraDistance =
    | 'close_up'
    | 'medium'
    | 'wide';

export interface CameraConfig {
    angle: CameraAngle;
    distance: CameraDistance;
}

// ============================================================================
// PERSON (solo UGC)
// ============================================================================

export type PersonInteraction =
    | 'holding_product'
    | 'using_product'
    | 'product_in_frame'
    | 'selfie_with_product';

export interface PersonConfig {
    /** How person interacts with product */
    interaction: PersonInteraction;

    /** Show face? (UGC can hide face) */
    showFace: boolean;

    /** Hand visible? */
    showHands: boolean;
}

// ============================================================================
// MAIN INPUT CONTRACT
// ============================================================================

export interface PremiumStudioInput {
    /** ROOT CONTROLLER - determines all other rules */
    sceneType: SceneType;

    /** Required: Product definition */
    product: ProductDefinition;

    /** Required for lifestyle_real only */
    environment?: EnvironmentConfig;

    /** Required: Lighting style */
    lighting: LightingStyle;

    /** Required for bundle_hero only */
    bundle?: BundleConfig;

    /** Optional: Camera settings */
    camera?: CameraConfig;

    /** Required for ugc_phone only */
    person?: PersonConfig;

    /** Output format */
    aspectRatio: '1:1' | '4:5' | '9:16' | '16:9';
}

// ============================================================================
// SCENE TYPE RULES (what each scene type allows/requires)
// ============================================================================

export interface SceneTypeRules {
    requiresEnvironment: boolean;
    requiresBundle: boolean;
    requiresPerson: boolean;
    allowsEnvironment: boolean;
    allowsBundle: boolean;
    allowsPerson: boolean;
    allowedLighting: LightingStyle[];
    defaultCamera: CameraConfig;
}

export const SCENE_TYPE_RULES: Record<SceneType, SceneTypeRules> = {
    studio_branding: {
        requiresEnvironment: false,
        requiresBundle: false,
        requiresPerson: false,
        allowsEnvironment: false,
        allowsBundle: false,
        allowsPerson: false,
        allowedLighting: ['studio_soft', 'studio_dramatic', 'natural_light'],
        defaultCamera: { angle: 'eye_level', distance: 'medium' }
    },
    editorial_product: {
        requiresEnvironment: false,
        requiresBundle: false,
        requiresPerson: false,
        allowsEnvironment: false,  // Abstract/stylized only, not real
        allowsBundle: false,
        allowsPerson: false,
        allowedLighting: ['natural_light', 'golden_hour', 'studio_soft', 'mood_lighting'],
        defaultCamera: { angle: 'slight_top_down', distance: 'medium' }
    },
    lifestyle_real: {
        requiresEnvironment: true,
        requiresBundle: false,
        requiresPerson: false,
        allowsEnvironment: true,
        allowsBundle: false,
        allowsPerson: false,  // No face protagonist
        allowedLighting: ['natural_light', 'sunny_day', 'golden_hour', 'overcast', 'cozy_indoors'],
        defaultCamera: { angle: 'eye_level', distance: 'medium' }
    },
    ugc_phone: {
        // UGC environment is optional - can be implicit for more authentic feel
        requiresEnvironment: false,
        requiresBundle: false,
        requiresPerson: true,
        allowsEnvironment: true,
        allowsBundle: false,
        allowsPerson: true,
        allowedLighting: ['natural_light', 'ring_light', 'cozy_indoors', 'flash_photo', 'night_mode'],
        defaultCamera: { angle: 'eye_level', distance: 'close_up' }
    },
    bundle_hero: {
        requiresEnvironment: false,
        requiresBundle: true,
        requiresPerson: false,
        // Environment is optional for bundle - default is NO environment (clean backdrop)
        // Only add environment if user explicitly selects one
        allowsEnvironment: true,
        allowsBundle: true,
        allowsPerson: false,
        allowedLighting: ['studio_soft', 'natural_light', 'golden_hour'],
        defaultCamera: { angle: 'slight_top_down', distance: 'wide' }
    }
};
