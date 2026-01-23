/**
 * Finalize Builder - Final restrictions and quality requirements
 */

import type { PromptOptions, PromptBuilder } from '../types';

export class FinalizeBuilder implements PromptBuilder {
    build(options: PromptOptions): string {
        const hideProduct =
            (options.ritualModeActive && options.ritualHideProduct === true) ||
            options.forceHideProduct === true;

        const ugcDepthLockActive =
            Boolean(options.ugcRealModeActive) ||
            Boolean(options.rawDomesticUgcActive) ||
            options.contentStyle === 'ugc' ||
            options.creationIntent === 'ugc' ||
            options.creationMode === 'lifestyle';

        const lines: string[] = [
            'Final render must be high resolution, photorealistic and free of watermarks or text.',
            'No text, no logos, no watermarks.',
            'No CGI look or plastic skin.',
            'No distorted hands, fingers or wrists.',
            'No floating limbs.',
        ];

        if (hideProduct) {
            lines.push(
                'CRITICAL: No product visible anywhere in frame (no packaging, no bottles, no jars, no labels, no supplement containers).',
                'Do not include any brand packaging, product hero, or close-up packshot.',
                'Emphasize the person and environment; do not show any brand packaging.'
            );
            if (options.ritualNoObjects) {
                lines.push(
                    'CRITICAL: No props or objects visible. Only people and environment/architecture. Empty hands.'
                );
            }
        } else {
            lines.push(
                'No invented labels or product redesign.',
                'No hallucinated packaging.',
                'Product geometry, material and label must remain exact.',
                'PRODUCT PRIORITY (CRITICAL): The product must be clearly visible in the foreground/main subject position; never placed in the background/second plane.',
                'CONTACT REALISM: The product must look physically held (not composited). Fingers must occlude edges naturally with believable grip pressure and contact shadows. No pasted/sticker look and no halo/cutout edges.',
                ugcDepthLockActive
                    ? 'VISIBILITY LOCK: The product and label remain clearly visible and readable across the frame; never soft or unreadable.'
                    : 'OPTICS LOCK: The product must be tack sharp and the sharpest object in the frame. Use deep depth of field (f/8–f/11) or focus stacking; absolutely no portrait mode, bokeh, or shallow depth-of-field that blurs the product or label.',
                ugcDepthLockActive
                    ? 'Never let the product be unreadable: label text remains clear and legible.'
                    : 'Never let the product be out of focus: no blurry product, no soft focus on the product, and no depth-of-field that blurs the label.'
            );
            if (options.ritualModeActive && options.ritualNoObjects) {
                lines.push(
                    'CRITICAL: No props or objects visible. Only people and environment/architecture. Empty hands.'
                );
            }
        }

        const intent = options.creationIntent || 'ugc';

        if (intent !== 'ugc' && options.contentStyle !== 'product' && options.sceneIntent !== 'ecommerce') {
            lines.push(
                'No lifestyle framing.',
                'No creator narrative.',
                'No selfie perspective.',
                'No phone camera.',
                'No text or graphic overlays.',
                'No logos or graphics.'
            );
        }

        if (options.productStructure && options.productStructure !== 'single') {
            lines.push(
                'Only one product is held naturally in the hand while any additional items rest on nearby surfaces (table, shelf, counter, or bag).',
                'Do not place multiple products in one hand or in both hands simultaneously.'
            );
        }

        if (!options.identityLock && options.contentStyle !== 'product' && options.sceneIntent !== 'ecommerce') {
            lines.push(
                'NEGATIVE IDENTITY CONSTRAINT: same woman, same person, identical face, repeated subject, recurring individual.'
            );
        }

        return lines.join(' ').trim().replace(/\s+/g, ' ');
    }
}
