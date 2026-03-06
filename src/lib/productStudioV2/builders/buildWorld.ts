import type { StudioAuthorityBundle, StudioUIState } from '../types/studioTypes';
import { resolveWorldBuilder } from '../worldBuilders/worldRouter';

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
  const result = builder(authority, state, explicitWorld);
  // eslint-disable-next-line no-console
  console.log('[DEBUG][buildWorld] FINAL background string emitted (router):', JSON.stringify(result));
  return result;
}

