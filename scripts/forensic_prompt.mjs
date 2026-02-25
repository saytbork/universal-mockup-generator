// scripts/forensic_prompt.mjs
// Reconstruct the final prompt string for a specific resolved config and print it.

const wineType = 'auto';
const closureType = 'crown-cap';
const bottleState = 'open';
const serveState = 'served';
const bottleFillState = 'clearly-partially-consumed';
const carbonationLevel = 'subtle';

const engineStatusBlock = 'WINE_ENGINE_STATUS: active. deterministic.';
const configBlock = `WINE_CONFIG_RESOLVED: wineType=${wineType}; closureType=${closureType}; bottleState=${bottleState}; serveState=${serveState}; bottleFillState=${bottleFillState}; carbonationLevel=${carbonationLevel};`;

function buildCrownCapRemovalLockV3(closureType, bottleState) {
  if (closureType !== 'crown-cap' || bottleState !== 'open') return '';
  return [
    'CROWN_CAP_REMOVAL_LOCK_V3:',
    'Closure type: crimped metal crown-cap only.',
    'Neck lip must show smooth circular glass rim.',
    'No cork geometry.',
    'No screw-thread geometry.',
    'No foil remnants.',
    'No hybrid morphology allowed.',
    'Exactly one detached cap object.',
    'There must be at most one detached cap in the scene; if more than one cap is present the image is invalid.',
    'Detached cap must show crimp deformation consistent with pry removal.',
    'No partial ring artifacts.',
    'No duplicate closure.',
    'No duplicate closures.',
  ].join(' ');
}

function buildServeVolumeConservationLockV3(bottleState, serveState, bottleFillState) {
  if (!(bottleState === 'open' && serveState === 'served')) return '';
  if (bottleFillState === 'clearly-partially-consumed') {
    return [
      'SERVE_VOLUME_CONSERVATION_LOCK_V3:',
      'Bottle must appear clearly partially consumed.',
      'The visible liquid line must intersect the lower half of the front label area.',
      'If the liquid level appears above the central label zone, the image is invalid.',
      'The liquid meniscus must be visibly aligned with the reduced fill state relative to the label position.',
      'Label placement must remain fixed; only the liquid level moves downward.',
      'A near-full bottle is invalid.',
      'If the bottle appears retail-full while a glass contains liquid, the image is incorrect.'
    ].join(' ');
  }
  return [
    'SERVE_VOLUME_CONSERVATION_LOCK_V3:',
    'When bottleFillState=retail-full:',
    'Bottle appears in standard retail-full condition.'
  ].join(' ');
}

const geometryBlock = 'GEOMETRY_LOCK: Preserve exact bottle proportions. Preserve closure scale. Preserve label integrity. No warping. No stretching.';
const colorBlock = 'WINE_COLOR_LOCK: Liquid color must match reference exactly. No hue shift. No reinterpretation. No brightness drift. No environmental tint. Glass refraction must not shift chroma.';

const crownCapLock = buildCrownCapRemovalLockV3(closureType, bottleState);
const volumeLock = buildServeVolumeConservationLockV3(bottleState, serveState, bottleFillState);

const finalParts = [engineStatusBlock, configBlock, volumeLock, crownCapLock, geometryBlock, colorBlock].filter(Boolean);
const finalPrompt = finalParts.join(' ');

console.log('\n--- FINAL PROMPT STRING (forensic) ---\n');
console.log(finalPrompt + '\n');

// Checks
const required = [
  'The visible liquid line must intersect the lower half of the front label area.',
  'If the liquid level appears above the central label zone, the image is invalid.',
  'Label placement must remain fixed; only the liquid level moves downward.'
];
const forbidden = ['upper third', 'middle of the bottle', '%', 'ml', 'glassFillLevel'];

console.log('--- Phrase presence checks ---');
for (const r of required) {
  console.log(`${r} -> ${finalPrompt.includes(r) ? 'PRESENT' : 'MISSING'}`);
}

console.log('\n--- Forbidden token checks ---');
for (const f of forbidden) {
  console.log(`${f} -> ${finalPrompt.includes(f) ? 'FOUND' : 'OK'}`);
}

console.log('\n--- End forensic output ---\n');
