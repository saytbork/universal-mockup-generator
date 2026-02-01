/**
 * Product Setup Handler - Builds product description section
 */

import type { ProductSetup, SceneType } from '../sceneTypes';
import type { ProductPlacement } from '../../productStudio/types';

export interface ProductSetupResult {
    section: string;
    productDescriptor: string;
}

export function buildProductSetupSection(
    productSetup: ProductSetup,
    sceneType: SceneType,
    placement?: ProductPlacement
): ProductSetupResult {
    const parts: string[] = [];
    parts.push(`PRODUCT: ${productSetup.productType}`);
    if (productSetup.packaging) parts.push(`Packaging: ${productSetup.packaging}`);
    if (productSetup.physicalScale) parts.push(`Scale: ${productSetup.physicalScale}`);
    if (productSetup.productContentColor) parts.push(`Product content color: ${productSetup.productContentColor}`);
    if (placement) {
        const descriptions: Record<ProductPlacement, string> = {
            surface: 'Product rests on a physical surface. Gravity applied. Contact shadows required. Surface must support weight realistically.',
            held: 'Product held by one or two natural hands. Gravity defined by hands. Visible pressure and deformation required.',
            supported: 'Product rests on a visible support (stand, tray, pedestal). Contact points visible. No floating illusion.',
            air: 'Gravity intentionally neutralized. Abstract studio context only.'
        };
        parts.push(`Physical placement: ${descriptions[placement]}`);
    }
    parts.push('Asset appearance must remain unchanged.');
    if (productSetup.handsAllowed === true) parts.push('Hands may interact with product naturally.');

    const descriptorParts = [productSetup.productType];
    if (productSetup.packaging) descriptorParts.push(`in ${productSetup.packaging}`);

    return { section: parts.join(' '), productDescriptor: descriptorParts.join(' ') };
}
