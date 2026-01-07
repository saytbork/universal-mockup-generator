/**
 * PRODUCT STUDIO STATE — UNIFIED, TYPED, COMPLETE
 * 
 * Single source of truth for all Product Studio controls.
 * NO optional fields without defaults.
 */

// ============================================================================
// PRODUCT ASSET
// ============================================================================

export interface ProductAsset {
  id: string;
  label: string;
  previewUrl: string;
  base64: string;
  mimeType: string;
  heightValue?: number;
  heightUnit: 'cm' | 'in';
}

// ============================================================================
// PRODUCT STUDIO STATE
// ============================================================================

export interface ProductStudioState {
  // Multi-product
  products: ProductAsset[];
  activeProductId: string | null;

  // Product Setup
  productType: 'bottle' | 'jar' | 'tube' | 'box' | 'pouch' | 'dropper' | 'pump' | 'spray' | 'stick' | 'custom';
  packaging: 'glass' | 'plastic' | 'metal' | 'cardboard' | 'mixed';
  physicalScale: 'travel' | 'standard' | 'large' | 'jumbo';
  handsHolding: boolean;

  // Creativity
  creativityLevel: 'off' | 'subtle' | 'bold' | 'max';
  creativeTheme: 'ingredient_color_story' | 'clinical_minimal' | 'premium_luxury' | 'fresh_bright' | 'dark_dramatic' | 'playful_pop' | 'tech_clean';
  paletteSource: 'product_label' | 'warm_neutrals' | 'cool_neutrals' | 'complementary' | 'custom';
  propDensity: 'none' | 'minimal' | 'moderate' | 'rich';
  selectedProps: string[];

  // Camera & Framing
  cameraSystem: 'dslr_mirrorless' | 'macro' | 'telephoto';
  angle: 'eye_level' | '45_hero' | 'top_down' | 'low_angle' | 'high_angle' | 'detail_closeup';
  distance: 'wide' | 'standard' | 'tight' | 'macro';
  rotation: 0 | 5 | 10 | 15;
  framing: 'centered_hero' | 'rule_of_thirds' | 'left_negative' | 'right_negative' | 'grid_ready';

  // Environment
  environment: string;
  customEnvironment: string;
  lighting: 'natural_soft' | 'studio_key' | 'dramatic' | 'flat' | 'backlit' | 'golden_hour';

  // Ecommerce
  ecommerceMode: boolean;
  blankSpaceEnabled: boolean;
  blankSpaceSide: 'left' | 'center' | 'right';
  backgroundColor: string;
  gradientEnabled: boolean;
  gradientStart: string;
  gradientEnd: string;
  gradientAngle: number;

  // Output
  aspectRatio: '1:1' | '4:5' | '9:16' | '16:9' | '3:4';
}

// ============================================================================
// DEFAULT STATE
// ============================================================================

export const DEFAULT_PRODUCT_STUDIO_STATE: ProductStudioState = {
  // Multi-product
  products: [],
  activeProductId: null,

  // Product Setup
  productType: 'bottle',
  packaging: 'glass',
  physicalScale: 'standard',
  handsHolding: false,

  // Creativity
  creativityLevel: 'subtle',
  creativeTheme: 'clinical_minimal',
  paletteSource: 'product_label',
  propDensity: 'minimal',
  selectedProps: [],

  // Camera & Framing
  cameraSystem: 'dslr_mirrorless',
  angle: '45_hero',
  distance: 'standard',
  rotation: 0,
  framing: 'centered_hero',

  // Environment
  environment: 'studio',
  customEnvironment: '',
  lighting: 'studio_key',

  // Ecommerce
  ecommerceMode: false,
  blankSpaceEnabled: false,
  blankSpaceSide: 'center',
  backgroundColor: '#ffffff',
  gradientEnabled: false,
  gradientStart: '#ffffff',
  gradientEnd: '#f0f0f0',
  gradientAngle: 180,

  // Output
  aspectRatio: '1:1',
};

// ============================================================================
// STATE HELPERS
// ============================================================================

export function addProduct(state: ProductStudioState, product: ProductAsset): ProductStudioState {
  if (state.products.length >= 5) {
    console.warn('[ProductStudio] Max 5 products allowed');
    return state;
  }
  return {
    ...state,
    products: [...state.products, product],
    activeProductId: state.activeProductId ?? product.id,
  };
}

export function removeProduct(state: ProductStudioState, productId: string): ProductStudioState {
  const filtered = state.products.filter(p => p.id !== productId);
  return {
    ...state,
    products: filtered,
    activeProductId: state.activeProductId === productId
      ? (filtered[0]?.id ?? null)
      : state.activeProductId,
  };
}

export function setActiveProduct(state: ProductStudioState, productId: string): ProductStudioState {
  return {
    ...state,
    activeProductId: productId,
  };
}

export function updateProductLabel(state: ProductStudioState, productId: string, label: string): ProductStudioState {
  return {
    ...state,
    products: state.products.map(p =>
      p.id === productId ? { ...p, label } : p
    ),
  };
}

export function getActiveProduct(state: ProductStudioState): ProductAsset | null {
  return state.products.find(p => p.id === state.activeProductId) ?? null;
}

// ============================================================================
// PRODUCT STUDIO STEP 3 VALUES (Legacy Compatibility)
// Used by mapProductModeToPromptOptions
// ============================================================================

export interface ProductStudioStep3Values {
  // Scene
  sceneIntent?: string;
  aspectRatio?: string;

  // Product Setup
  productType?: string;
  productTypeCustom?: string;
  productScale?: string;
  handsHolding?: boolean;
  noPerson?: boolean;
  selfieMode?: string;
  ugcRealMode?: boolean;

  // Camera & Framing
  productCameraSystem?: 'DSLR / mirrorless' | 'Macro lens' | 'Telephoto compression';
  productCameraAngle?: 'Eye level product' | '45° hero' | '45 degree hero' | 'Top-down flat lay' | 'Low angle power' | 'High angle overview' | 'Detail close-up';
  productCameraDistance?: 'Wide' | 'Standard' | 'Tight' | 'Macro';
  productCameraRotation?: 0 | 5 | 10 | 15;
  productFramingGuide?: 'Centered hero' | 'Rule of thirds' | 'Left aligned + negative space' | 'Right aligned + negative space' | 'Grid-ready';

  // Creativity
  productCreativityLevel?: 'Off' | 'Subtle' | 'Bold' | 'Max';
  productCreativeTheme?: 'Ingredient Color Story' | 'Clinical Minimal' | 'Premium Luxury' | 'Fresh & Bright' | 'Dark & Dramatic' | 'Playful Pop' | 'Tech Clean';
  productPaletteSource?: 'Use product label colors' | 'Warm neutrals' | 'Cool neutrals' | 'Complementary accent' | 'Custom palette';
  productPropDensity?: 'None' | 'Light' | 'Minimal' | 'Medium' | 'Moderate' | 'Dense' | 'Rich';
  productPropsSelected?: string[];
  productPaletteA?: string;
  productPaletteB?: string;
  productPaletteC?: string;

  // Environment
  environment?: string;
  customEnvironment?: string;
  lightingStyle?: string;

  // Ecommerce
  ecommerceSidePlacementFlag?: boolean;
  sidePlacement?: string;
  ecommerceBackgroundMode?: 'white' | 'gradient';
  ecommerceBackgroundColor?: string;
  ecommerceGradientStart?: string;
  ecommerceGradientEnd?: string;
  ecommerceGradientAngle?: string;

  // Product Structure
  productStructure?: string;
}
