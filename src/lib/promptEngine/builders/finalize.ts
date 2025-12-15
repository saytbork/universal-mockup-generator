/**
 * Finalize Builder - Final restrictions and quality requirements
 */

import type { PromptOptions, PromptBuilder } from '../types';

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

        return lines.join(' ').trim().replace(/\s+/g, ' ');
    }
}
