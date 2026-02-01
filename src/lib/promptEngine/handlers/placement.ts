/**
 * Placement Handler - Builds physical placement section (Section 05)
 */

import type { ProductPlacement } from '../../productStudio/types';
import type { SceneType } from '../sceneTypes';

export function buildPlacementSection(placement: ProductPlacement | undefined, sceneType: SceneType): string {
    const p = placement || 'surface';

    const descriptions: Record<ProductPlacement, string> = {
        surface: 'Product rests on a physical surface. Gravity applied. Contact shadows required. Surface must support weight realistically.',
        held: 'Product held by one or two natural hands. Gravity defined by hands. Visible pressure and deformation required.',
        supported: 'Product rests on a visible support (stand, tray, pedestal). Contact points visible. No floating illusion.',
        air: 'Gravity intentionally neutralized. Abstract studio context only.'
    };

    return `05 / PRODUCT PLACEMENT: ${descriptions[p]}`;
}
