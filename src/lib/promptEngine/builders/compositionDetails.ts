import type { PromptBuilder, PromptOptions } from '../types';

export class CompositionDetailsBuilder implements PromptBuilder {
    build(options: PromptOptions): string {
        const parts: string[] = [];

        if (options.compositionMode) {
            parts.push(`Composition mode: ${options.compositionMode}.`);
        }

        if (options.sidePlacement) {
            parts.push(`Product and person placement: ${options.sidePlacement} side.`);
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
