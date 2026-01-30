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
            'ASPECT RATIO: 3:4 (vertical). The image must fully fill the frame with no empty space, no black bars, and no borders.',
            'No text, no logos, no watermarks, no UI overlays.',
            'No CGI look or plastic skin.',
            'No distorted hands, fingers or wrists.',
            'No floating limbs.',
            'No surreal elements, no floating objects, no distortions.',
            'Sharp focus on the subject (product), with natural lighting and grounded shadows.',
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
                'PRODUCT INTEGRITY (NON-NEGOTIABLE): The product packaging must remain identical across all images in the sequence. Same size, same proportions, and same orientation.',
                'No deformation, no scaling inconsistencies. Branding must be sharp and readable.',
                'Material and texture must look photorealistic (e.g., paper pouch, matte finish). product sits naturally on surfaces, not hovering.',
                'THE PRODUCT MUST NEVER BE CROPPED: The product must be centered, fully visible, and not cut off at the top or bottom of the frame.',
                'PRODUCT PRIORITY (CRITICAL): The product must be clearly visible in the foreground/main subject position; never placed in the background/second plane.',
                'CONTACT REALISM: The product must look physically held or placed naturally (not composited). Natural shadows and believable contact pressure.',
                ugcDepthLockActive
                    ? 'VISIBILITY LOCK: The product and label remain clearly visible and readable across the frame; never soft or unreadable.'
                    : 'OPTICS LOCK: The product must be tack sharp and the sharpest object in the frame. Use eye-level or slight top-down angle (35mm–50mm lens equivalent). Absolutely no wide-angle distortion.',
                'Avoid dark backgrounds that could create black gaps in the 3:4 vertical framing.'
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
