import type { PromptBuilder, PromptOptions } from '../types';

export class CompositionDetailsBuilder implements PromptBuilder {
    build(options: PromptOptions): string {
        const parts: string[] = [];
        const hideProduct =
            (options.ritualModeActive && options.ritualHideProduct === true) ||
            options.forceHideProduct === true;

        if (options.compositionMode && !(options as any).compositionModeStructural) {
            parts.push(`Composition mode: ${options.compositionMode}.`);
        }

        if (options.sidePlacement && !options.ecommerceSidePlacementFlag) {
            parts.push(`${hideProduct ? 'Subject' : 'Product'} placement: ${options.sidePlacement} side.`);
        }

        if (options.ecommerceSidePlacementFlag && options.sidePlacement) {
            if (options.sidePlacement === 'center') {
                parts.push('Maintain even negative space on both sides so copy can wrap naturally.');
            } else if (options.sidePlacement === 'left' || options.sidePlacement === 'right') {
                parts.push(
                    `Reserve large, clean negative space on the ${options.sidePlacement === 'left' ? 'right' : 'left'} side for text overlays.`
                );
            }
        }

        if (options.bgGradient) {
            const { startColor, endColor, angle = 90 } = options.bgGradient;
            parts.push(`Background gradient: linear ${angle}° from ${startColor} to ${endColor}.`);
        } else if (options.bgColor) {
            parts.push(`Background color: solid ${options.bgColor}.`);
        }

        if (options.supplementPresetCue?.trim()) {
            parts.push(options.supplementPresetCue.trim());
        }

        if (options.supplementBackgroundColor?.trim()) {
            parts.push(`Hero backdrop color: ${options.supplementBackgroundColor.trim()}.`);
        }

        if (options.supplementAccentColor?.trim()) {
            parts.push(`Secondary accents or props in ${options.supplementAccentColor.trim()}.`);
        }

        if (options.supplementFlavorNotes?.trim()) {
            parts.push(`Supporting ingredients or props inspired by: ${options.supplementFlavorNotes.trim()}.`);
        }

        if (options.includeSupplementHand) {
            parts.push('Add a cropped human hand interacting with the product in a natural, editorial way. The hand must look fully real, not mannequin-like or 3D.');
        }

        if (options.supplementCustomPrompt?.trim()) {
            parts.push(options.supplementCustomPrompt.trim());
        }

        if (options.moodPromptCue?.trim()) {
            parts.push(options.moodPromptCue.trim());
        }

        return parts.join(' ');
    }
}
