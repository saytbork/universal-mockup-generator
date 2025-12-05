/**
 * Finalize Builder - Final restrictions and quality requirements
 */

import type { PromptOptions, PromptBuilder } from '../types';

export class FinalizeBuilder implements PromptBuilder {
    build(options: PromptOptions): string {
        return `
      Final render must be high resolution, photorealistic and free of watermarks or text.
      No text, no logos, no watermarks.
      No CGI look or plastic skin.
      No distorted hands, fingers or wrists.
      No floating limbs.
      No invented labels or product redesign.
      No hallucinated packaging.
      Product geometry, material and label must remain exact.
    `.trim().replace(/\s+/g, ' ');
    }
}
