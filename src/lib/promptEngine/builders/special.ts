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
        const isEcomBlank =
            options.creationMode === 'ecom-blank' ||
            options.ecommerceBlankSpaceMode === true ||
            options.compositionMode === 'Ecommerce Blank Space';
        if (isEcomBlank) {
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
        const { bgColor = '#FFFFFF', sidePlacement = 'right', bgGradient } = options;
        const oppositeSide = sidePlacement === 'left' ? 'right' : 'left';
        const aspectRatio = String(options.aspectRatio || '1:1').trim() || '1:1';

        const backgroundCopy = bgGradient
            ? `Background: soft neutral gradient (linear ${bgGradient.angle ?? 90}° from ${bgGradient.startColor} to ${bgGradient.endColor}), but the overlay-safe ${oppositeSide} side must remain visually uniform with no gradient banding, no vignettes, and no contrast shifts.`
            : `Background: soft neutral solid with the exact color ${bgColor}. The overlay-safe ${oppositeSide} side must remain visually uniform with no vignettes, no contrast shifts, and no texture noise.`;

        const placementCopy =
            sidePlacement === 'center'
                ? 'Layout variant: CENTERED. Keep clean negative space on both left and right sides for overlays; do not add props or shadows that drift into the overlay-safe areas.'
                : `Layout variant: ${sidePlacement.toUpperCase()}. The product must be positioned entirely on the ${sidePlacement} side. The ${oppositeSide} side is a protected overlay-safe zone.`;

        return `
      ECOMMERCE PDP IMAGE CANVAS (OVERLAY-READY). This is a clean product image canvas designed to receive text/icon overlays later. The image is NOT a finished ad.
      STRICTLY FORBIDDEN: any text, labels, badges, captions, UI elements, icons, arrows, frames, borders, dividers, or typography of any kind.
      
      Output format: ${aspectRatio} aspect ratio. High resolution. Clean edges. Product fully visible and tack sharp. No motion blur. No dramatic angles.
      Camera: straight-on or slight 3/4 angle only. No dutch angles. No wide-angle distortion.
      
      ${placementCopy}
      Overlay-safe zone rules (NON-NEGOTIABLE): the clean side must contain NO objects, NO props, NO highlights, NO reflections, NO shadows, NO gradients, and NO background elements crossing into that zone. At least 40% of the image width must remain clean negative space reserved for overlays.
      
      ${backgroundCopy}
      Lighting: soft studio lighting, even exposure, neutral white balance. No harsh shadows. No blown highlights. Any contact shadow must stay near the product and must NOT drift into the overlay-safe zone.
      
      Product rules: product is the clear hero with correct proportions and realistic scale. No floating product. No duplicated product unless explicitly requested. Preserve the exact product packaging and label (no redesign, no invented text).
      Props: allowed only if minimal and only near the product on the product side. Absolutely no props or visual noise near the overlay-safe zone.
      Forbidden: any room scene, any real-world location context, any living subject, any head, any skin, any hands, any animals, any decorative clutter, or any editorial storytelling.
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
