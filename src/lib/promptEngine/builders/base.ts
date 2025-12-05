/**
 * Base Builder - Core prompt foundation
 */

import type { PromptOptions, PromptBuilder } from '../types';

export class BaseBuilder implements PromptBuilder {
    build(options: PromptOptions): string {
        const { contentStyle, aspectRatio, camera } = options;

        const isUgc = contentStyle !== 'product';
        const style = isUgc ? 'UGC lifestyle' : 'product placement';
        const cleanAspectRatio = this.cleanAspectRatio(aspectRatio);
        const cleanCamera = this.cleanText(camera);

        let prompt = `Create an ultra-realistic, authentic ${style} photo with a ${cleanAspectRatio} aspect ratio. `;

        if (isUgc) {
            prompt += `The shot should feel candid, emotional, and cinematic, as if taken by a real person with a ${cleanCamera}. `;
            prompt += `Embrace believable imperfections—slight motion blur, a little lens smudge, off-center framing, uneven window light—so it reads as everyday life rather than a polished model shoot. `;
        } else {
            prompt += `The shot should feel refined and advertising-ready, with deliberate staging captured on a ${cleanCamera}. `;
        }

        return prompt;
    }

    private cleanAspectRatio(ratio: string): string {
        return ratio.replace(/\s+/g, '').replace(':', ' by ');
    }

    private cleanText(text: string): string {
        return text
            .replace(/label design/gi, 'existing label preserved exactly')
            .replace(/redesign/gi, '')
            .replace(/re-imagine/gi, '')
            .replace(/new label/gi, '')
            .trim();
    }
}
