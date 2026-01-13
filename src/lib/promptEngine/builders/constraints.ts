/**
 * ConstraintsBuilder - Ensures uploaded images are preserved
 */

import type { PromptBuilder, PromptOptions } from '../types';

export class ConstraintsBuilder implements PromptBuilder {
    build(options: PromptOptions): string {
        // Only add constraints when image is uploaded for lifestyle mode
        const hasUploadedImage = options.productAssets && options.productAssets.length > 0;
        const isLifestyleMode = options.contentStyle === 'ugc' || options.creationMode === 'lifestyle';
        const isBgReplaceOverlay = options.creationMode === 'bg-replace' && options.ecommerceSidePlacementFlag === true;

        if (!hasUploadedImage || !isLifestyleMode) {
            return '';
        }

        if (isBgReplaceOverlay) {
            return [
                'CRITICAL IMAGE CONSTRAINTS (BACKGROUND REPLACEMENT):',
                'Use the uploaded image as the primary immutable reference for the product (and person if present).',
                'Do not redesign, reinterpret, or replace the subject or product.',
                'Preserve pose, proportions, realism, and all product branding exactly.',
                'Background replacement is allowed and required: remove the original environment and replace it with the selected neutral canvas.',
                'Do not invent new text, logos, watermarks, or packaging.'
            ].join(' ');
        }

        return [
            'CRITICAL IMAGE CONSTRAINTS:',
            'Use the uploaded image as the primary immutable reference.',
            'Do not redesign, reinterpret, or replace the scene.',
            'Preserve subject, pose, framing, proportions and realism.',
            'Preserve the exact uploaded product shape, proportions, colors, label layout, text and typography.',
            'Do not modify branding. Do not rotate or mirror the product.',
            'The uploaded image is the ground truth reference.',
            'Only enhance lighting, background softness and lifestyle realism.',
            'Do not invent new humans, products, text or environments.',
        ].join(' ');
    }
}
