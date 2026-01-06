/**
 * Product Setup Handler - Builds product description section
 */

import type { ProductSetup, SceneType } from '../sceneTypes';

export interface ProductSetupResult {
    section: string;
    productDescriptor: string;
}

export function buildProductSetupSection(productSetup: ProductSetup, sceneType: SceneType): ProductSetupResult {
    const parts: string[] = [];
    parts.push(`PRODUCT: ${productSetup.productType}`);
    if (productSetup.packaging) parts.push(`Packaging: ${productSetup.packaging}`);
    if (productSetup.physicalScale) parts.push(`Scale: ${productSetup.physicalScale}`);
    if (productSetup.productContentColor) parts.push(`Product content color: ${productSetup.productContentColor}`);
    parts.push('Asset appearance must remain unchanged.');
    if (productSetup.handsAllowed === true) parts.push('Hands may interact with product naturally.');

    const descriptorParts = [productSetup.productType];
    if (productSetup.packaging) descriptorParts.push(`in ${productSetup.packaging}`);

    return { section: parts.join(' '), productDescriptor: descriptorParts.join(' ') };
}
