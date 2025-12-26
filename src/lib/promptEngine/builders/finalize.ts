/**
 * Finalize Builder - Final restrictions and quality requirements
 */

import type { PromptOptions, PromptBuilder } from '../types';

const NATURAL_UGC_CONTRACT = [
    'LIFESTYLE MODE: NATURAL UGC.',
    'SCENE NARRATIVE: This must look like a real, casual photo taken at home by a normal person using a smartphone. The image should feel natural, human, and believable and must not look staged, produced, or commercially polished.',
    'ANTI-ESTHETIC RULES: No studio lighting. No professional photography. No polished or commercial composition. No beauty filters. No skin smoothing. No brand-style presentation.',
    'VISUAL FIDELITY: Smartphone front-camera feel. Natural domestic lighting. Uneven exposure is allowed. Minor imperfections are allowed. Do NOT force noise, blur, or degradation.',
    'CREATOR IDENTITY: Real skin texture with natural variation. No retouching. Casual, unposed expression and posture. The person is not presenting or performing.',
    'CAPTURE: Handheld or casual front-camera framing. Slightly imperfect framing is allowed. Horizon does not need to be perfectly level. Camera placement feels incidental, not planned.',
    'ENVIRONMENT: Real domestic environment. Lived-in but not dirty or chaotic. Everyday surroundings.',
    'CRITICAL PROHIBITIONS: No studio light. No production setup. No ecommerce product shot. No influencer-style posing. No showing the product directly to camera.',
    'PRODUCT SECONDARY: Product remains incidental, never hero-centered, perfectly isolated, or presented directly to the viewer.',
    'GOAL: Natural, pleasant, believable UGC. Not raw and messy. Not polished or optimized. Just real.'
].join(' ');

export class FinalizeBuilder implements PromptBuilder {
    build(options: PromptOptions): string {
        const lines: string[] = [
            'Final render must be high resolution, photorealistic and free of watermarks or text.',
            'No text, no logos, no watermarks.',
            'No CGI look or plastic skin.',
            'No distorted hands, fingers or wrists.',
            'No floating limbs.',
            'No invented labels or product redesign.',
            'No hallucinated packaging.',
            'Product geometry, material and label must remain exact.'
        ];

        const intent = options.creationIntent || 'ugc';

        if (intent !== 'ugc') {
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

        if (options.naturalUgcActive) {
            lines.push(NATURAL_UGC_CONTRACT);
        }

        return lines.join(' ').trim().replace(/\s+/g, ' ');
    }
}
