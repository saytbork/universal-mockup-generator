/**
 * Special Modes Builder - Hero Landing, Ecom Blank Extended, Formulation Expert
 */

import type { PromptOptions, PromptBuilder } from '../types';

export class SpecialModesBuilder implements PromptBuilder {
    build(options: PromptOptions): string {
        let prompt = '';

        // Hero Landing Mode
        if (options.isHeroLandingMode) {
            prompt += this.buildHeroLanding(options) + ' ';
        }

        // Ecom Blank Extended (additional rules beyond ModesBuilder)
        if (options.compositionMode === 'ecom-blank') {
            prompt += this.buildEcomBlankExtended(options) + ' ';
        }

        // Real Mode
        if (options.realModeActive) {
            prompt += this.buildRealMode(options) + ' ';
        }

        return prompt.trim();
    }

    private buildHeroLanding(options: PromptOptions): string {
        const {
            heroBackground = '#FFFFFF',
            heroAlignment = '',
            heroScale = 1,
            heroShadow = '',
        } = options;

        const scalePercent = Math.round(heroScale * 100);

        return `
      Design this as a seamless ecommerce hero module on a ${heroBackground} backdrop.
      Keep the set ultra minimal—no room environment, just a clean base plane and negative space perfect for landing pages.
      ${heroAlignment}
      Scale the product so it fills roughly ${scalePercent}% of the frame height without cropping labels.
      ${heroShadow}
      Do not introduce furniture, backgrounds, or lifestyle props—just use subtle geometry or gradients to support the hero.
    `.trim().replace(/\s+/g, ' ');
    }

    private buildEcomBlankExtended(options: PromptOptions): string {
        const { bgColor = '#FFFFFF', sidePlacement = 'right' } = options;
        const oppositeSide = sidePlacement === 'left' ? 'right' : 'left';

        return `
      This image must use a pure solid background with the exact color: ${bgColor}.
      Do NOT generate rooms, environments, furniture, props or scenery.
      Keep the background perfectly uniform and flat.
      
      Place the product and the person exclusively on the ${sidePlacement} side of the frame.
      Leave large, clean negative space on the ${oppositeSide} side for text overlays.
      
      Use soft studio lighting suitable for Amazon, Shopify and paid ads.
      Do NOT add text, logos, watermarks or graphics.
      
      Insert the uploaded product cleanly into the scene with:
      - perfect edges,
      - precise shape preservation,
      - correct reflections,
      - realistic soft shadows on the flat background,
      - exact label, exact colors and exact proportions.
      
      Maintain correct human anatomy at all times:
      - natural hands,
      - correct finger shape,
      - proper wrist rotation,
      - realistic arm connection to the body.
    `.trim().replace(/\s+/g, ' ');
    }

    private buildRealMode(options: PromptOptions): string {
        const basePrompt = `
      UGC Real Mode active.
      Accept imperfect lighting, hotspot glare and natural grain.
      Allow slight focus breathing or softness.
      Never reduce product readability.
    `.trim().replace(/\s+/g, ' ');

        return basePrompt;
    }
}
