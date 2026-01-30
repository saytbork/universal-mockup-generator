/**
 * Ecommerce Narrative Sequence Builder
 * Provides unique prompts for a 5-image story sequence.
 */

import type { PromptOptions, PromptBuilder } from '../types';

export class EcommerceNarrativeBuilder implements PromptBuilder {
    build(options: PromptOptions): string {
        if (!options.ecommerceSequenceActive || !options.ecommerceSequenceIndex) {
            return '';
        }

        const index = options.ecommerceSequenceIndex;

        switch (index) {
            case 1:
                return this.buildCleanProductShot(options);
            case 2:
                return this.buildIngredientContext(options);
            case 3:
                return this.buildPreparationMoment(options);
            case 4:
                return this.buildLifestyleSetting(options);
            case 5:
                return this.buildPremiumLifestyleShot(options);
            default:
                return '';
        }
    }

    private buildCleanProductShot(options: PromptOptions): string {
        return `
      NARRATIVE STEP 1 (CLEAN PRODUCT SHOT):
      A professional, minimalist studio packshot.
      The product is placed on a clean, solid neutral surface (beige, light grey, or white).
      Soft, even studio lighting with gentle contact shadows.
      Zero clutter. The focus is entirely on the product's premium texture and branding.
      Slightly low angle to give the product a heroic and professional presence.
    `.trim().replace(/\s+/g, ' ');
    }

    private buildIngredientContext(options: PromptOptions): string {
        return `
      NARRATIVE STEP 2 (INGREDIENT CONTEXT):
      The product is surrounded by high-quality RAW ingredients that reflect its composition.
      Grounded, natural setting on a stone or wooden surface.
      Organic arrangement of botanical or natural elements.
      Cinematic side lighting to highlight the textures of both the ingredients and the product packaging.
      The product remains the central subject, integrated naturally into the environment.
    `.trim().replace(/\s+/g, ' ');
    }

    private buildPreparationMoment(options: PromptOptions): string {
        return `
      NARRATIVE STEP 3 (PREPARATION MOMENT):
      A dynamic 'in-use' or preparation shot.
      The product is held naturally in a hand or placed near tools used for its application/consumption.
      Casual, authentic morning light or soft indoor lighting.
      Human touch is present, creating a relatable and functional context.
      Real-life environment (bathroom vanity, kitchen counter, or wellness space) providing depth and story.
    `.trim().replace(/\s+/g, ' ');
    }

    private buildLifestyleSetting(options: PromptOptions): string {
        return `
      NARRATIVE STEP 4 (LIFESTYLE SETTING):
      The product is integrated into a wider, lived-in lifestyle environment.
      It rests on a side table or shelf within a beautiful, modern home setting.
      Deep focal depth to show a glimpse of the surrounding environment (plants, books, soft textiles).
      Warm, natural afternoon sun streaming in, creating a mood of wellness and comfort.
      The product feels like a natural part of the user's daily ritual.
    `.trim().replace(/\s+/g, ' ');
    }

    private buildPremiumLifestyleShot(options: PromptOptions): string {
        return `
      NARRATIVE STEP 5 (PREMIUM LIFESTYLE SHOT):
      A close-up, high-end editorial lifestyle capture.
      The product is being interacted with (e.g., being picked up or held) in a premium, aspirational setting.
      Focus is tack sharp on the product label, with a soft RETINA focus on the background.
      Sophisticated, high-contrast lighting that emphasizes the premium nature of the brand.
      The final image of the sequence, conveying a sense of quality, trust, and luxury.
    `.trim().replace(/\s+/g, ' ');
    }
}
