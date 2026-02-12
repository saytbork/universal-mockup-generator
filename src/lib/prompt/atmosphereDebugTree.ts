import type { CanonicalScene } from './atmosphereResolver';

export type DebugNode = {
  label: string;
  value?: string;
  children?: DebugNode[];
};

export type DebugTree = {
  root: DebugNode;
};

const normalize = (value: unknown): string => String(value || '').trim().toLowerCase();

const resolveWorldId = (scene: CanonicalScene): 'studio' | 'underwater' | 'splash-tank' | 'outdoor' => {
  const mode = normalize(scene.photoMode);
  const env = normalize(scene.environmentSettings);
  if (mode.includes('underwater') || env.includes('underwater')) return 'underwater';
  if (mode.includes('splash') || mode.includes('foam') || mode.includes('pool water')) return 'splash-tank';
  if (normalize(scene.photoType).includes('environment')) return 'outdoor';
  return 'studio';
};

const WORLD_DEFAULTS: Record<string, { surfaceStyle: string; materialTone: string; lightingSource: string; lockedRules: string[] }> = {
  studio: {
    surfaceStyle: 'controlled studio surface',
    materialTone: 'clean commercial neutral',
    lightingSource: 'controlled softbox studio source',
    lockedRules: ['rigidMaterialsOnly=true', 'noOrganicResidue=true', 'noClutter=true', 'labelProtection=true'],
  },
  underwater: {
    surfaceStyle: 'submerged depth plane with coherent waterline geometry',
    materialTone: 'aqueous optical realism',
    lightingSource: 'underwater refracted directional light',
    lockedRules: ['rigidMaterialsOnly=false', 'noOrganicResidue=false', 'noClutter=true', 'labelProtection=true'],
  },
  'splash-tank': {
    surfaceStyle: 'impact-ready wet surface',
    materialTone: 'high-clarity liquid contrast',
    lightingSource: 'high-speed controlled splash light',
    lockedRules: ['rigidMaterialsOnly=true', 'noOrganicResidue=false', 'noClutter=true', 'labelProtection=true'],
  },
  outdoor: {
    surfaceStyle: 'natural grounded outdoor surface',
    materialTone: 'environment-balanced natural tonality',
    lightingSource: 'natural directional sunlight',
    lockedRules: ['rigidMaterialsOnly=false', 'noOrganicResidue=false', 'noClutter=false', 'labelProtection=true'],
  },
};

const detectLightingConflict = (worldId: string, lightingInput: string): boolean => {
  const incoming = normalize(lightingInput);
  if (worldId === 'underwater' && (incoming.includes('softbox') || incoming.includes('studio'))) return true;
  if (worldId === 'studio' && incoming.includes('underwater')) return true;
  if (worldId === 'outdoor' && incoming.includes('clinical softbox')) return true;
  return false;
};

const isLockedComposition = (scene: CanonicalScene): boolean => {
  const mode = String(scene.photoMode || '').trim();
  return (
    mode === 'Hero Landing Page' ||
    mode === 'Color Pop Hero' ||
    mode === 'Ingredient Stack' ||
    mode === 'Ingredient Flat Lay'
  );
};

export function buildAtmosphereDebugTree(
  scene: CanonicalScene,
  atmosphere: string
): DebugTree {
  const worldId = resolveWorldId(scene);
  const worldDefaults = WORLD_DEFAULTS[worldId];
  const customIngredients = Array.isArray(scene.customIngredients) ? scene.customIngredients : [];
  const defaultIngredients = Array.isArray(scene.defaultIngredients) ? scene.defaultIngredients : [];
  const ingredientSource = customIngredients.length > 0 ? 'custom' : 'default';
  const ingredientList =
    ingredientSource === 'custom'
      ? customIngredients.map(item => item.name).filter(Boolean)
      : defaultIngredients;
  const ingredientDensity =
    ingredientSource === 'custom'
      ? (customIngredients.find(item => item?.density && item.density !== 'auto')?.density || 'auto')
      : 'auto';
  const ingredientPlacementLogic =
    ingredientSource === 'custom'
      ? (customIngredients.find(item => item?.placement && item.placement !== 'auto')?.placement || 'auto')
      : 'default-mapping';

  const lightingInput = String(scene.lighting || '');
  const lightingConflict = detectLightingConflict(worldId, lightingInput);
  const lightingResolved = lightingConflict ? worldDefaults.lightingSource : (lightingInput || worldDefaults.lightingSource);
  const lightingOverridden = lightingConflict;
  const lockedComposition = isLockedComposition(scene);

  const atmosphereText = String(atmosphere || '');
  const hasIngredientResolution = atmosphereText.includes('INGREDIENT_RESOLUTION');
  const hasSpecialEffect = atmosphereText.includes('SPECIAL_EFFECT');
  const hasPhysicsRules = atmosphereText.includes('PHYSICS_RULES');

  return {
    root: {
      label: 'Root',
      children: [
        { label: 'Output Profile', value: String(scene.outputProfile || '') },
        { label: 'Photo Type', value: String(scene.photoType || '') },
        {
          label: 'Composition',
          children: [
            { label: 'value', value: String(scene.composition || '') },
            { label: 'lockedComposition', value: String(lockedComposition) },
          ],
        },
        { label: 'Product State & Motion', value: String(scene.productStateMotion || '') },
        { label: 'Product Structure', value: String(scene.productStructure || '') },
        { label: 'Environment Settings', value: String(scene.environmentSettings || '') },
        { label: 'Physical Placement', value: String(scene.physicalPlacement || '') },
        { label: 'Physical Properties', value: String(scene.physicalProperties || '') },
        {
          label: 'Ingredient System',
          children: [
            { label: 'Source', value: ingredientSource },
            { label: 'Ingredient List', value: ingredientList.join(', ') || 'none' },
            { label: 'Density', value: String(ingredientDensity) },
            { label: 'Placement Logic', value: String(ingredientPlacementLogic) },
            { label: 'containsINGREDIENT_RESOLUTION', value: String(hasIngredientResolution) },
          ],
        },
        {
          label: 'Visual World',
          children: [
            { label: 'World ID', value: worldId },
            { label: 'Surface Style', value: worldDefaults.surfaceStyle },
            { label: 'Material Tone', value: worldDefaults.materialTone },
            { label: 'Locked Rules', value: worldDefaults.lockedRules.join(', ') },
          ],
        },
        {
          label: 'Lighting',
          children: [
            { label: 'Input', value: lightingInput || 'none' },
            { label: 'Resolved', value: lightingResolved },
            { label: 'Conflict Override', value: String(lightingConflict) },
            { label: 'lightingOverridden', value: String(lightingOverridden) },
          ],
        },
        {
          label: 'Special Effects',
          children: [
            { label: 'list', value: (scene.specialEffects || []).join(', ') || 'none' },
            { label: 'containsSPECIAL_EFFECT', value: String(hasSpecialEffect) },
          ],
        },
        { label: 'Product Interaction', value: String(scene.productInteraction || '') },
        { label: 'Viewpoint & Vantage', value: String(scene.viewpointVantage || '') },
        { label: 'Camera & Framing', value: String(scene.cameraFraming || '') },
        {
          label: 'Physics Rules',
          children: [
            { label: 'containsPHYSICS_RULES', value: String(hasPhysicsRules) },
            { label: 'enforced', value: 'no floating; gravity; no label obstruction; no clipping; real-world scale' },
          ],
        },
        { label: 'Constraint Suffix', value: String(scene.constraintSuffix || '') },
      ],
    },
  };
}
