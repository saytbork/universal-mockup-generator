// Freeze guard: world ownership and Nature Elements anchor injection are enforced here.
import type { StudioAuthorityBundle, StudioUIState } from '../types/studioTypes';
import { resolveWorldBuilder } from '../worldBuilders/worldRouter';

type WorldPresetState = StudioUIState & {
  environmentPreset?: string;
  environment?: string;
  contextPresetValue?: string;
};

const NATURE_ELEMENTS_REALISM_ANCHORS = [
  'NATURAL_MATERIAL_REALISM: All natural elements must exhibit real-world photogrammetric detail. Leaves, wood, soil, stone, and water must show natural irregularities, micro surface variation, organic imperfection, and non-uniform coloration.',
  'NO_SYNTHETIC_RENDERING: No CGI vegetation. No plastic-looking leaves. No artificial symmetry. No stylized rendering.',
  'SURFACE_MICRODETAIL: Visible surface imperfections, micro scratches, dust particles, natural texture roughness, subsurface scattering for leaves.',
  'PHOTOGRAPHIC_LIGHT_RESPONSE: Natural sunlight interaction with surfaces including soft shadow diffusion, leaf translucency, and realistic reflectance.',
].join(' ');

function isNatureElementsEnvironment(state?: StudioUIState): boolean {
  if (!state) return false;
  const worldState = state as WorldPresetState;
  return (
    String(worldState.environmentPreset || '').trim() === 'Nature Elements' ||
    String(worldState.environment || '').trim() === 'Nature Elements' ||
    String(worldState.contextPresetValue || '').trim() === 'Nature Elements'
  );
}

export function buildWorld(
  authority: StudioAuthorityBundle,
  explicitWorld?: StudioAuthorityBundle['world'],
  state?: StudioUIState
): string {
  const { name, builder } = resolveWorldBuilder(authority, state, explicitWorld);
  // eslint-disable-next-line no-console
  console.log('[WORLD BUILDER RESOLVED]', name);
  // eslint-disable-next-line no-console
  console.log('[ENVIRONMENT BUILDER USED]', name);
  const worldContract = builder(authority, state, explicitWorld);
  const contract = String(worldContract || '');
  const hasAllNatureAnchors =
    contract.includes('NATURAL_MATERIAL_REALISM:') &&
    contract.includes('NO_SYNTHETIC_RENDERING:') &&
    contract.includes('SURFACE_MICRODETAIL:') &&
    contract.includes('PHOTOGRAPHIC_LIGHT_RESPONSE:');
  const shouldInjectAnchors =
    isNatureElementsEnvironment(state) &&
    !hasAllNatureAnchors;
  const result = shouldInjectAnchors
    ? `${worldContract} ${NATURE_ELEMENTS_REALISM_ANCHORS}`.trim()
    : worldContract;
  return result;
}
