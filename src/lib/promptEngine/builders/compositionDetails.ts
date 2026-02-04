import type { PromptBuilder, PromptOptions } from '../types';

export class CompositionDetailsBuilder implements PromptBuilder {
    build(options: PromptOptions): string {
        const parts: string[] = [];
        const hideProduct =
            (options.ritualModeActive && options.ritualHideProduct === true) ||
            options.forceHideProduct === true;

        if (options.compositionMode) {
            parts.push(`Composition mode: ${options.compositionMode}.`);
        }

        if (options.sidePlacement) {
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

        return parts.join(' ');
    }
}
