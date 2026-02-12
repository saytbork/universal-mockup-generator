export type CanonicalSceneIngredient = {
  name: string;
  cutStyle?: 'whole' | 'sliced' | 'halved' | 'crushed' | 'powdered' | 'extract' | 'auto';
  freshness?: 'dry' | 'fresh' | 'wet' | 'condensed' | 'auto';
  density?: 'minimal' | 'balanced' | 'abundant' | 'auto';
  placement?: 'base' | 'surround' | 'background' | 'foreground' | 'auto';
};

export type CanonicalScene = {
  outputProfile: 'ecommerce-conversion' | 'luxury-brand' | 'clinical' | string;
  photoType: 'Photo Studio' | 'Environment' | string;
  composition: string;
  photoMode: string;
  productStateMotion: string;
  productStructure: string;
  environmentSettings: string;
  physicalPlacement: string;
  physicalProperties: string;
  defaultIngredients?: string[];
  customIngredients?: CanonicalSceneIngredient[];
  visualWorld: string;
  lighting: string;
  specialEffects: string[];
  productInteraction: string;
  viewpointVantage: string;
  cameraFraming: string;
  constraintSuffix: string;
};

type AtmosphereSetting = {
  id: string;
  defaults: {
    surfaceStyle?: string;
    materialTone?: string;
    lightingSource?: string;
    density?: 'minimal' | 'balanced' | 'abundant';
  };
  locked: {
    rigidMaterialsOnly?: boolean;
    noOrganicResidue?: boolean;
    noClutter?: boolean;
    labelProtection?: boolean;
  };
  allowsOverride: {
    surfaceStyle?: boolean;
    materialTone?: boolean;
    lightingSource?: boolean;
    ingredientDensity?: boolean;
    ingredientPlacement?: boolean;
  };
};

const normalize = (value: unknown): string => String(value || '').trim().toLowerCase();

const WORLD_CONTRACTS: Record<string, AtmosphereSetting> = {
  studio: {
    id: 'studio',
    defaults: {
      surfaceStyle: 'controlled studio surface',
      materialTone: 'clean commercial neutral',
      lightingSource: 'controlled softbox studio source',
      density: 'minimal',
    },
    locked: {
      rigidMaterialsOnly: true,
      noOrganicResidue: true,
      noClutter: true,
      labelProtection: true,
    },
    allowsOverride: {
      surfaceStyle: true,
      materialTone: true,
      lightingSource: true,
      ingredientDensity: true,
      ingredientPlacement: true,
    },
  },
  underwater: {
    id: 'underwater',
    defaults: {
      surfaceStyle: 'submerged depth plane with coherent waterline geometry',
      materialTone: 'aqueous optical realism',
      lightingSource: 'underwater refracted directional light',
      density: 'balanced',
    },
    locked: {
      rigidMaterialsOnly: false,
      noOrganicResidue: false,
      noClutter: true,
      labelProtection: true,
    },
    allowsOverride: {
      surfaceStyle: false,
      materialTone: true,
      lightingSource: false,
      ingredientDensity: true,
      ingredientPlacement: true,
    },
  },
  'splash-tank': {
    id: 'splash-tank',
    defaults: {
      surfaceStyle: 'impact-ready wet surface',
      materialTone: 'high-clarity liquid contrast',
      lightingSource: 'high-speed controlled splash light',
      density: 'balanced',
    },
    locked: {
      rigidMaterialsOnly: true,
      noOrganicResidue: false,
      noClutter: true,
      labelProtection: true,
    },
    allowsOverride: {
      surfaceStyle: true,
      materialTone: true,
      lightingSource: true,
      ingredientDensity: true,
      ingredientPlacement: true,
    },
  },
  outdoor: {
    id: 'outdoor',
    defaults: {
      surfaceStyle: 'natural grounded outdoor surface',
      materialTone: 'environment-balanced natural tonality',
      lightingSource: 'natural directional sunlight',
      density: 'balanced',
    },
    locked: {
      rigidMaterialsOnly: false,
      noOrganicResidue: false,
      noClutter: false,
      labelProtection: true,
    },
    allowsOverride: {
      surfaceStyle: true,
      materialTone: true,
      lightingSource: true,
      ingredientDensity: true,
      ingredientPlacement: true,
    },
  },
};

const resolveWorldId = (scene: CanonicalScene): string => {
  const explicitWorld = normalize(scene.visualWorld);
  if (explicitWorld === 'underwater') return 'underwater';
  if (explicitWorld === 'splash-tank' || explicitWorld === 'splash tank') return 'splash-tank';
  if (explicitWorld === 'outdoor' || explicitWorld === 'environment') return 'outdoor';
  if (explicitWorld === 'studio' || explicitWorld === 'photo studio') return 'studio';
  const mode = normalize(scene.photoMode);
  const env = normalize(scene.environmentSettings);
  if (mode.includes('underwater') || env.includes('underwater')) return 'underwater';
  if (mode.includes('splash') || mode.includes('foam') || mode.includes('pool water')) return 'splash-tank';
  if (scene.photoType === 'Environment') return 'outdoor';
  return 'studio';
};

const mapIngredient = (item: CanonicalSceneIngredient): string => {
  const cutStyle = item.cutStyle || 'auto';
  const freshness = item.freshness || 'auto';
  const density = item.density || 'auto';
  const placement = item.placement || 'auto';
  return `${item.name} (cut=${cutStyle}, freshness=${freshness}, density=${density}, placement=${placement})`;
};

const resolveIngredients = (scene: CanonicalScene, world: AtmosphereSetting): string => {
  const custom = Array.isArray(scene.customIngredients) ? scene.customIngredients.filter(i => normalize(i.name)) : [];
  const useCustom = custom.length > 0;
  const resolved = useCustom
    ? custom.map(mapIngredient)
    : (scene.defaultIngredients || []).filter(Boolean).map(v => String(v).trim()).filter(Boolean);
  if (resolved.length === 0) return '';
  const ingredientLine = resolved.length > 0 ? resolved.join('; ') : 'none';
  const density = useCustom
    ? custom
        .map(item => item.density || 'auto')
        .find(value => value && value !== 'auto')
    : undefined;
  const densityResolved = density && world.allowsOverride.ingredientDensity ? density : world.defaults.density || 'balanced';
  return [
    'INGREDIENT_RESOLUTION:',
    `Ingredient source: ${useCustom ? 'customIngredients (override defaults)' : 'default mapping'}.`,
    `Ingredient set: ${ingredientLine}.`,
    `Ingredient density authority: ${densityResolved}.`,
    'Ingredient physics: all ingredients are physically grounded, obey gravity, and preserve clear label visibility.',
  ].join(' ');
};

const resolveSpecialEffects = (scene: CanonicalScene): string => {
  const providedEffects = Array.isArray(scene.specialEffects) ? scene.specialEffects : [];
  const inferredFromPhotoMode = (() => {
    const mode = normalize(scene.photoMode);
    if (mode.includes('splash shot')) return ['splash shot'];
    if (mode.includes('condensation droplets')) return ['condensation droplets'];
    if (mode.includes('underwater split')) return ['underwater split'];
    if (mode.includes('pool water')) return ['pool water'];
    if (mode.includes('foam')) return ['foam'];
    return [];
  })();
  const effects = providedEffects.length > 0 ? providedEffects : inferredFromPhotoMode;
  const lines = effects
    .map(effect => normalize(effect))
    .map(effect => {
      if (effect.includes('splash shot')) {
        return 'SPECIAL_EFFECT: freeze-motion liquid droplets following gravity arc with micro shadow contact on surface.';
      }
      if (effect.includes('condensation droplets')) {
        return 'SPECIAL_EFFECT: micro-condensed droplets with subtle highlight wrap and realistic cold-surface physics.';
      }
      if (effect.includes('underwater split')) {
        return 'SPECIAL_EFFECT: clean waterline separation with realistic refraction and caustic light behavior.';
      }
      if (effect.includes('pool water')) {
        return 'SPECIAL_EFFECT: controlled surface ripples with bounded displacement and physically coherent splash decay.';
      }
      if (effect.includes('foam')) {
        return 'SPECIAL_EFFECT: coherent foam mass with realistic bubble tension and gravity-consistent contact behavior.';
      }
      return '';
    })
    .filter(Boolean);
  return lines.join(' ');
};

const resolveLighting = (scene: CanonicalScene, world: AtmosphereSetting): string => {
  const incoming = String(scene.lighting || '').trim();
  const incomingNorm = normalize(incoming);
  const worldDefault = world.defaults.lightingSource || 'controlled lighting';
  const conflictsWithWorld =
    (world.id === 'underwater' && (incomingNorm.includes('softbox') || incomingNorm.includes('studio'))) ||
    (world.id === 'studio' && incomingNorm.includes('underwater')) ||
    (world.id === 'outdoor' && incomingNorm.includes('clinical softbox'));
  const resolved = conflictsWithWorld || !world.allowsOverride.lightingSource ? worldDefault : (incoming || worldDefault);
  return `Lighting authority: ${resolved}.`;
};

const resolveCompositionLine = (scene: CanonicalScene): string => {
  const mode = String(scene.photoMode || '').trim();
  if (mode === 'Hero Landing Page' || mode === 'Color Pop Hero' || mode === 'Ingredient Stack' || mode === 'Ingredient Flat Lay') {
    return `Composition authority: locked module (${mode}); preserve existing locked composition behavior.`;
  }
  return `Composition authority: ${scene.composition || 'standard commercial composition'}.`;
};

const sanitizeConstraintSuffix = (value: string): string => {
  return String(value || '')
    .replace(/ATMOSPHERE_RESOLUTION:/gi, '')
    .replace(/INGREDIENT_RESOLUTION:/gi, '')
    .replace(/PHYSICS_RULES\s*\(GLOBAL\):/gi, '')
    .replace(/BACKGROUND_ISOLATION:/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
};

const resolveConstraintSuffix = (scene: CanonicalScene): string =>
  `Constraint suffix: ${
    sanitizeConstraintSuffix(scene.constraintSuffix || '') ||
    'Apply existing constraint engine, LABEL LOCK, PRODUCT LOCK, square integrity, and physical properties.'
  }`;

export function resolveAtmosphere(scene: CanonicalScene): string {
  const worldId = resolveWorldId(scene);
  const world = WORLD_CONTRACTS[worldId] || WORLD_CONTRACTS.studio;
  const ingredientResolution = resolveIngredients(scene, world);
  const specialEffects = resolveSpecialEffects(scene);
  const lightingLine = resolveLighting(scene, world);

  const blocks = [
    'ATMOSPHERE_RESOLUTION:',
    `Output profile authority: ${scene.outputProfile}.`,
    `Photo type authority: ${scene.photoType}.`,
    resolveCompositionLine(scene),
    'BACKGROUND_ISOLATION: Input background removed. Product fully isolated before scene generation. no legacy environment blending.',
    `Product state & motion: ${scene.productStateMotion || 'static'}.`,
    `Product structure: ${scene.productStructure || 'preserve existing product geometry and packaging truth'}.`,
    `Environment settings: ${scene.environmentSettings || 'studio-controlled environment'}.`,
    `Physical placement: ${scene.physicalPlacement || 'grounded on physical support plane'}.`,
    `Physical properties: ${scene.physicalProperties || 'real materials, scale fidelity, and optical coherence'}.`,
    'LABEL_PROTECTION: label protection active; no label obstruction; preserve label visibility and readability.',
    ingredientResolution,
    `Visual world: ${scene.visualWorld || world.id}.`,
    lightingLine,
    specialEffects,
    `Product interaction: ${scene.productInteraction || 'none'}.`,
    `Viewpoint & vantage: ${scene.viewpointVantage || 'product-centric vantage'}.`,
    `Camera & framing: ${scene.cameraFraming || 'stable commercial framing with product-first readability'}.`,
    'PHYSICS_RULES (GLOBAL): no floating without shadow anchor; contact shadow coherence enforced; ingredients obey gravity; no label obstruction; no clipping through product; no surreal deformation; respect real-world scale.',
    resolveConstraintSuffix(scene),
  ].filter(Boolean);

  return blocks.join(' ');
}
