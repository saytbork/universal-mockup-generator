/**
 * PromptEngine v2 - Main Orchestrator
 * Modular, professional, and reliable prompt generation system
 */

import { BaseBuilder } from './builders/base';
import { ProductBuilder } from './builders/product';
import { IdentityBuilder } from './builders/identity';
import { SceneBuilder } from './builders/scene';
import { ModesBuilder } from './builders/modes';
import { SpecialModesBuilder } from './builders/special';
import { FinalizeBuilder } from './builders/finalize';
import type { PromptOptions, PromptBuilder } from './types';

export class PromptEngine {
    private builders: PromptBuilder[];

    constructor() {
        // Order matters: Base → Identity → Scene → Product → Modes → Special → Finalize
        this.builders = [
            new BaseBuilder(),
            new IdentityBuilder(),
            new SceneBuilder(),
            new ProductBuilder(),
            new ModesBuilder(),
            new SpecialModesBuilder(),
            new FinalizeBuilder(),
        ];
    }

    /**
     * Build complete prompt from options
     */
    build(options: PromptOptions): string {
        const segments = this.builders
            .map(builder => builder.build(options))
            .filter(segment => segment && segment.trim().length > 0);

        const finalPrompt = segments.join(' ').trim();

        console.log('🚀 PromptEngine v2:', {
            segments: segments.length,
            length: finalPrompt.length,
            mode: options.creationMode,
        });

        return finalPrompt;
    }

    /**
     * Get individual components for debugging
     */
    getComponents(options: PromptOptions): Record<string, string> {
        return this.builders.reduce((acc, builder) => {
            const name = builder.constructor.name.replace('Builder', '');
            acc[name] = builder.build(options);
            return acc;
        }, {} as Record<string, string>);
    }

    /**
     * Validate options (basic validation)
     */
    validate(options: PromptOptions): { valid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!options.creationMode) {
            errors.push('creationMode is required');
        }

        if (!options.aspectRatio) {
            errors.push('aspectRatio is required');
        }

        if (!options.camera) {
            errors.push('camera is required');
        }

        return {
            valid: errors.length === 0,
            errors,
        };
    }
}

// Export singleton instance for convenience
export const promptEngine = new PromptEngine();

// Export class for testing
export { PromptEngine as PromptEngineClass };

// Re-export types
export type { PromptOptions } from './types';
