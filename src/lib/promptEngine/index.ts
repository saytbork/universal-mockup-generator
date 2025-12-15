/**
 * PromptEngine v2 - Main Orchestrator
 * Modular, professional, and reliable prompt generation system
 */

import { IdentityBuilder } from './builders/identity';
import { ConstraintsBuilder } from './builders/constraints';
import { FinalizeBuilder } from './builders/finalize';
import { SceneNarrativeBuilder } from './builders/canonicalScene';
import type { PromptOptions } from './types';
import { buildMasterPrompt } from './masterPrompt';

function negativePrompt() {
    return [
        "deformed hands",
        "extra fingers",
        "missing fingers",
        "long fingers",
        "broken fingers",
        "distorted limbs",
        "blurry face",
        "distorted face",
        "face artifacts",
        "asymmetric face",
        "extra limbs",
        "extra arms",
        "extra legs",
        "mutated body",
        "mangled hands",
        "text",
        "logo",
        "watermark",
        "signature",
        "caption",
        "cartoon style",
        "3d cartoon",
        "plush toy",
        "doll-like face",
        "overexposed skin",
        "underexposed skin",
        "grainy skin texture",
        "over-smoothed skin",
        "warped product",
        "stretched product",
        "deformed bottle",
        "incorrect label",
        "fake reflections",
        "ai artifacts",
        "floating objects",
        "cut-off head",
        "cut-off body",
        "partial person",
        "framing issues",
        "duplicate objects",
        "double body",
        "disconnected arms",
        "altered outfit",
        "invented clothing",
        "incorrect fabric",
        "incorrect outfit color",
        "wrong clothing texture"
    ].join(", ");
}

export class PromptEngine {
    private constraintsBuilder = new ConstraintsBuilder();
    private identityBuilder = new IdentityBuilder();
    private finalizeBuilder = new FinalizeBuilder();
    private narrativeBuilder = new SceneNarrativeBuilder();

    /**
     * Build complete prompt from options
     */
    build(options: PromptOptions): string {
        const constraintsSection = this.constraintsBuilder.build(options);
        const identitySection =
            options.personIncluded && options.contentStyle !== 'product'
                ? this.identityBuilder.build(options)
                : '';
        const narrativeSections = this.narrativeBuilder.build(options, {
            identity: identitySection,
            constraints: constraintsSection
        });
        const finalizeSection = this.finalizeBuilder.build(options);

        const finalPrompt = buildMasterPrompt(
            {
                creationIntent: narrativeSections.creationIntent,
                creationMode: narrativeSections.creationMode,
                ugcRealMode: narrativeSections.ugcRealMode,
                formulationStory: narrativeSections.formulationStory,
                ecommerceBuilder: narrativeSections.ecommerceBuilder,
                cameraFraming: narrativeSections.cameraFraming,
                environmentLightingMood: narrativeSections.environmentLightingMood,
                identity: narrativeSections.identity,
                finalize: finalizeSection
            },
            negativePrompt()
        );

        // Debug logging for final prompt validation
        console.log('🚀 PromptEngine v2 - FINAL PROMPT:', {
            length: finalPrompt.length,
            creationIntent: options.creationIntent,
            creationMode: options.creationMode,
            personIncluded: options.personIncluded
        });
        console.log('📝 Full Prompt:', finalPrompt.substring(0, 500) + '...');

        return finalPrompt;
    }

    /**
     * Get individual components for debugging
     */
    getComponents(options: PromptOptions): Record<string, string> {
        const constraintsSection = this.constraintsBuilder.build(options);
        const identitySection =
            options.personIncluded && options.contentStyle !== 'product'
                ? this.identityBuilder.build(options)
                : '';
        const narrativeSections = this.narrativeBuilder.build(options, {
            identity: identitySection,
            constraints: constraintsSection
        });
        const finalizeSection = this.finalizeBuilder.build(options);

        return {
            Narrative: [
                narrativeSections.creationIntent,
                narrativeSections.creationMode,
                narrativeSections.ugcRealMode,
                narrativeSections.formulationStory ?? '',
                narrativeSections.ecommerceBuilder ?? '',
                narrativeSections.cameraFraming,
                narrativeSections.environmentLightingMood,
                finalizeSection
            ]
                .filter(Boolean)
                .join(' '),
            Identity: identitySection,
            Constraints: constraintsSection,
            Finalize: finalizeSection
        };
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
