import { ProductStudioState } from '../../lib/productStudio/types';
import { resolveWineV4 } from './wineResolverV4';
import { finalizeWinePrompt } from './wineFinalize';

export function buildWinePrompt(state: ProductStudioState): string {
  const segments = resolveWineV4(state);
  return finalizeWinePrompt(segments);
}
