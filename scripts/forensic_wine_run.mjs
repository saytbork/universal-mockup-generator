// scripts/forensic_wine_run.mjs
// Forensic run for wine served early-return behavior.

const visualProfile = 'wine';
const serveState = 'served';
const closureType = 'crown-cap';
const bottleState = 'open';
const carbonationLevel = 'visible';

// Reconstruct wine truth block as resolver would produce for served state
const engineStatusBlock = 'WINE_ENGINE_STATUS: active. deterministic.';
const configBlock = `WINE_CONFIG_RESOLVED: wineType=auto; closureType=${closureType}; bottleState=${bottleState}; serveState=${serveState}; bottleFillState=clearly-partially-consumed; carbonationLevel=${carbonationLevel};`;

const volumeLock = [
  'SERVE_VOLUME_CONSERVATION_LOCK_V3:',
  'Bottle must appear clearly partially consumed.',
  'The visible liquid line must intersect the lower half of the front label area.',
  'If the liquid level appears above the central label zone, the image is invalid.',
  'The liquid meniscus must be visibly aligned with the reduced fill state relative to the label position.',
  'Label placement must remain fixed; only the liquid level moves downward.',
  'A near-full bottle is invalid.',
  'If the bottle appears retail-full while a glass contains liquid, the image is incorrect.'
].join(' ');

const crownCapLock = [
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
  'No duplicate closures.'
].join(' ');

const geometryBlock = 'GEOMETRY_LOCK: Preserve exact bottle proportions. Preserve closure scale. Preserve label integrity. No warping. No stretching.';
const colorBlock = 'WINE_COLOR_LOCK: Liquid color must match reference exactly. No hue shift. No reinterpretation. No brightness drift. No environmental tint. Glass refraction must not shift chroma.';

// Simulate early return activation (what winePipeline logs)
console.log('[WINE SERVED MODE] early return activated');

const finalPrompt = [engineStatusBlock, configBlock, volumeLock, crownCapLock, geometryBlock, colorBlock].join(' ').replace(/\s{2,}/g, ' ').trim();

console.log('\n--- FINAL PROMPT (forensic) ---\n');
console.log(finalPrompt + '\n');

// Validation
const required = [
  'WINE_ENGINE_STATUS',
  'WINE_CONFIG_RESOLVED',
  'SERVE_VOLUME_CONSERVATION_LOCK_V3',
  'CROWN_CAP_REMOVAL_LOCK_V3',
  'GEOMETRY_LOCK',
  'WINE_COLOR_LOCK',
];
const forbidden = [
  'WINE_ENVIRONMENT',
  'WINE_LIGHTING',
  'COMPOSITION',
  'PHOTO_MODE',
  'PACKAGING',
  'ADVANCED_CONTROLS',
  'FRAME_CONSTRAINT',
  'OUTPUT_PROFILE',
];

console.log('--- Validation summary ---');
let ok = true;
for (const r of required) {
  const count = (finalPrompt.match(new RegExp(r, 'g')) || []).length;
  console.log(`${r}: count=${count}`);
  if (count !== 1) ok = false;
}
for (const f of forbidden) {
  const found = finalPrompt.includes(f);
  console.log(`${f}: ${found ? 'FOUND' : 'OK'}`);
  if (found) ok = false;
}

// Extra duplication checks
const dupChecks = ['WINE_ENGINE_STATUS', 'SERVE_VOLUME_CONSERVATION_LOCK_V3'];
for (const d of dupChecks) {
  const count = (finalPrompt.match(new RegExp(d, 'g')) || []).length;
  console.log(`Dup check ${d}: ${count}`);
  if (count > 1) ok = false;
}

console.log('\nOverall validation:', ok ? 'PASS' : 'FAIL', '\n');

process.exit(ok ? 0 : 2);
