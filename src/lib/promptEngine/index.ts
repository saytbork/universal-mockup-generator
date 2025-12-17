/**
 * PromptEngine v2 - Main Orchestrator
 * CANONICAL SEMANTIC PIPELINE
 * 
 * ============================================================================
 * CANONICAL BUILDER ORDER (PRECEDENCE - LATER OVERRIDES EARLIER)
 * ============================================================================
 * 
 * 1. ModesBuilder (creationIntent, creationMode)
 *    → Establishes structural context: UGC vs Product vs Brand
 * 
 * 2. IdentityBuilder
 *    → Injects person physical traits (age, ethnicity, expression, pose)
 *    → SUPPRESSED if hasModelReference === true
 * 
 * 3. UGCRealModeBuilder
 *    → DOMINANT MODIFIER when active
 *    → Suppresses: studio, editorial, cinematic, luxury vocabulary
 *    → Injects: imperfections, casual composition, smartphone optics
 * 
 * 4. CanonicalSceneBuilder
 *    → Unifies camera, environment, lighting, mood
 *    → Resolves conflicts (UGC > Scene defaults)
 * 
 * 5. SpecialBuilders (Formulation, Ecommerce, Bundles)
 *    → Conditional activation
 *    → FormulationStory: human credibility, NOT marketing
 *    → Ecommerce: BLOCKED if UGC active
 * 
 * 6. FinalizeBuilder
 *    → Constraints, output format, quality anchors
 * 
 * ============================================================================
 * ILLEGAL COMBINATIONS (validated with warnings in DEV mode)
 * ============================================================================
 * 
 * - UGC + cinematic/studio/editorial language → Warning
 * - UGC + Ecommerce Blank Space → Conflict
 * - Age >= 70 + smooth skin preset → Age integrity warning
 * - Product Mode + person descriptors → Mode conflict
 * 
 * ============================================================================
 */

import { IdentityBuilder } from './builders/identity';
import { ConstraintsBuilder } from './builders/constraints';
import { FinalizeBuilder } from './builders/finalize';
import { SceneNarrativeBuilder } from './builders/canonicalScene';
import { UGCRealModeBuilder } from './builders/ugcRealMode';
import type { PromptOptions } from './types';
import { buildMasterPrompt } from './masterPrompt';

// ============================================================================
// NEGATIVE PROMPT - Quality anchors and artifact prevention
// ============================================================================
function negativePrompt() {
    return [
        // Anatomical integrity
        "deformed hands", "extra fingers", "missing fingers", "long fingers",
        "broken fingers", "distorted limbs", "extra limbs", "extra arms",
        "extra legs", "mutated body", "mangled hands", "disconnected arms",

        // Face integrity
        "blurry face", "distorted face", "face artifacts", "asymmetric face",
        "doll-like face", "cut-off head",

        // Body integrity
        "cut-off body", "partial person", "double body",

        // Skin issues
        "overexposed skin", "underexposed skin", "grainy skin texture",
        "over-smoothed skin",

        // Product integrity
        "warped product", "stretched product", "deformed bottle",
        "incorrect label", "fake reflections", "deformed label",
        "warped text", "curved typography", "melted text",
        "incorrect font", "missing letters", "extra letters",
        "blurry label", "smudged label", "redrawn packaging",
        "ai-generated label", "fake branding", "incorrect logo",
        "distorted bottle", "wrong proportions", "incorrect cap",
        "invented graphics",

        // General artifacts
        "text", "logo", "watermark", "signature", "caption",
        "cartoon style", "3d cartoon", "plush toy",
        "ai artifacts", "floating objects", "framing issues",
        "duplicate objects",

        // Wardrobe consistency
        "altered outfit", "invented clothing", "incorrect fabric",
        "incorrect outfit color", "wrong clothing texture"
    ].join(", ");
}

// ============================================================================
// VALIDATION GUARDS - Illegal combination detection
// ============================================================================
interface ValidationWarning {
    type: 'conflict' | 'semantic' | 'age-integrity';
    message: string;
}

function validateSemanticCombinations(options: PromptOptions): ValidationWarning[] {
    const warnings: ValidationWarning[] = [];

    // GUARD 1: UGC + Ecommerce Blank Space
    if (options.ugcRealModeActive && options.creationMode === 'ecom-blank') {
        warnings.push({
            type: 'conflict',
            message: '⚠️ CONFLICT: UGC Real Mode active + Ecommerce Blank Space. UGC takes precedence.'
        });
    }

    // GUARD 2: UGC + Studio/Editorial vocabulary (check in final prompt)
    if (options.ugcRealModeActive && options.creationMode === 'studio') {
        warnings.push({
            type: 'conflict',
            message: '⚠️ CONFLICT: UGC Real Mode active + Studio mode. UGC overrides studio semantics.'
        });
    }

    // GUARD 3: Age >= 70 + smooth skin
    const age = options.personDetails?.age || 0;
    const skinRealism = options.personDetails?.skinRealism || '';
    if (age >= 70 && (skinRealism.includes('smooth') || skinRealism.includes('editorial'))) {
        warnings.push({
            type: 'age-integrity',
            message: `⚠️ AGE INTEGRITY: Age ${age} with smooth/editorial skin may reduce age visibility.`
        });
    }

    // GUARD 4: Product Mode + person descriptors
    if (options.contentStyle === 'product' && options.personIncluded) {
        warnings.push({
            type: 'semantic',
            message: '⚠️ SEMANTIC: Product mode with person included. Consider UGC mode instead.'
        });
    }

    // GUARD 5: FormulationStory + UGC should respect expert credibility
    if (options.formulationExpertEnabled && options.ugcRealModeActive) {
        warnings.push({
            type: 'semantic',
            message: '⚠️ SEMANTIC: Formulation Expert + UGC active. Expert maintains credibility with UGC imperfections.'
        });
    }

    return warnings;
}

// ============================================================================
// PROMPT ENGINE - Main Orchestrator
// ============================================================================

// ============================================================================
// CUSTOM ERRORS
// ============================================================================
export class InvalidSceneCombinationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'InvalidSceneCombinationError';
    }
}

export class PromptEngine {
    // CANONICAL BUILDER ORDER
    private constraintsBuilder = new ConstraintsBuilder();    // Priority 6
    private identityBuilder = new IdentityBuilder();          // Priority 2
    private ugcBuilder = new UGCRealModeBuilder();            // Priority 3 (DOMINANT)
    private narrativeBuilder = new SceneNarrativeBuilder();   // Priority 4
    private finalizeBuilder = new FinalizeBuilder();          // Priority 6

    /**
     * Build complete prompt from options
     * 
     * CANONICAL ORDER:
     * 1. Modes (creationIntent/Mode)
     * 2. Identity (person traits)
     * 3. UGC Real Mode (DOMINANT modifier)
     * 4. Canonical Scene (camera, environment, lighting)
     * 5. Special Builders (formulation, ecommerce)
     * 6. Finalize (constraints, output)
     */

    build(options: PromptOptions): string {
        console.log('[PROMPT ENGINE] Starting canonical build pipeline');

        // ====================================================================
        // RULE 4: MANDATORY SAFETY GUARD - Fail early
        // ====================================================================
        const isSelfie = options.selfieMode && options.selfieMode !== 'None';
        const productCount = options.productAssets?.length || 0;

        if (isSelfie && productCount > 1) {
            console.error('❌ CRITICAL: Attempted to build prompt with Selfie Mode + Multiple Products');
            throw new InvalidSceneCombinationError(
                'Selfie mode cannot be used with multiple products. Please switch to Standard Camera or Single Product.'
            );
        }

        // ====================================================================
        // VALIDATION - Check for illegal combinations
        // ====================================================================
        const warnings = validateSemanticCombinations(options);
        if (warnings.length > 0) {
            console.warn('[PROMPT ENGINE] Validation warnings:', warnings);
            warnings.forEach(w => console.warn(`  ${w.message}`));
        }

        // ====================================================================
        // STEP 1: Modes (handled in narrativeBuilder.buildCreationIntent/Mode)
        // ====================================================================
        console.log('[PROMPT ENGINE] Step 1: Modes -', options.creationMode, options.creationIntent);

        // ====================================================================
        // STEP 2: Identity
        // ====================================================================
        const shouldIncludeIdentity =
            options.personIncluded &&
            !options.hasModelReference &&
            options.contentStyle !== 'product';

        const constraintsSection = this.constraintsBuilder.build(options);
        const identitySection = shouldIncludeIdentity
            ? this.identityBuilder.build(options)
            : '';

        console.log('[PROMPT ENGINE] Step 2: Identity -',
            shouldIncludeIdentity ? `${identitySection.length} chars` : 'SUPPRESSED');

        // ====================================================================
        // STEP 3: UGC Real Mode (DOMINANT MODIFIER)
        // ====================================================================
        const ugcSection = this.ugcBuilder.build(options);
        console.log('[PROMPT ENGINE] Step 3: UGC Real Mode -',
            options.ugcRealModeActive ? 'ACTIVE (dominant)' : 'inactive');

        // ====================================================================
        // STEP 4: Canonical Scene
        // ====================================================================
        const narrativeSections = this.narrativeBuilder.build(options, {
            identity: identitySection,
            constraints: constraintsSection
        });
        console.log('[PROMPT ENGINE] Step 4: Canonical Scene - built');

        // ====================================================================
        // STEP 5: Special Builders (Formulation, Ecommerce handled in narrativeBuilder)
        // ====================================================================
        console.log('[PROMPT ENGINE] Step 5: Special Builders -',
            options.formulationExpertEnabled ? 'Formulation ACTIVE' : '',
            options.creationMode === 'ecom-blank' ? 'Ecommerce ACTIVE' : '');

        // ====================================================================
        // STEP 6: Finalize
        // ====================================================================
        const finalizeSection = this.finalizeBuilder.build(options);
        console.log('[PROMPT ENGINE] Step 6: Finalize -', `${finalizeSection.length} chars`);

        // ====================================================================
        // ASSEMBLE MASTER PROMPT (canonical order)
        // ====================================================================
        const finalPrompt = buildMasterPrompt(
            {
                creationIntent: narrativeSections.creationIntent,
                creationMode: narrativeSections.creationMode,
                ugcRealMode: ugcSection || narrativeSections.ugcRealMode,
                formulationStory: narrativeSections.formulationStory,
                ecommerceBuilder: narrativeSections.ecommerceBuilder,
                cameraFraming: narrativeSections.cameraFraming,
                environmentLightingMood: narrativeSections.environmentLightingMood,
                identity: narrativeSections.identity || identitySection,
                finalize: finalizeSection
            },
            negativePrompt()
        );

        // ====================================================================
        // MANDATORY DEBUG LOGGING
        // ====================================================================
        console.log('🚀 PromptEngine v2 - Build Complete:', {
            length: finalPrompt.length,
            creationIntent: options.creationIntent,
            creationMode: options.creationMode,
            personIncluded: options.personIncluded,
            ugcRealModeActive: options.ugcRealModeActive,
            hasModelReference: options.hasModelReference,
            warnings: warnings.length
        });

        // [FINAL PROMPT STRING] - MANDATORY for debugging
        console.log('[FINAL PROMPT STRING]', finalPrompt);

        return finalPrompt;
    }

    /**
     * Get individual components for debugging
     */
    getComponents(options: PromptOptions): Record<string, string> {
        const shouldIncludeIdentity =
            options.personIncluded &&
            !options.hasModelReference &&
            options.contentStyle !== 'product';

        const constraintsSection = this.constraintsBuilder.build(options);
        const identitySection = shouldIncludeIdentity
            ? this.identityBuilder.build(options)
            : '';
        const ugcSection = this.ugcBuilder.build(options);
        const narrativeSections = this.narrativeBuilder.build(options, {
            identity: identitySection,
            constraints: constraintsSection
        });
        const finalizeSection = this.finalizeBuilder.build(options);

        return {
            Narrative: [
                narrativeSections.creationIntent,
                narrativeSections.creationMode,
                ugcSection || narrativeSections.ugcRealMode,
                narrativeSections.formulationStory ?? '',
                narrativeSections.ecommerceBuilder ?? '',
                narrativeSections.cameraFraming,
                narrativeSections.environmentLightingMood,
                finalizeSection
            ]
                .filter(Boolean)
                .join(' '),
            Identity: identitySection,
            UGC: ugcSection,
            Constraints: constraintsSection,
            Finalize: finalizeSection
        };
    }

    /**
     * Validate options with semantic checks
     */
    validate(options: PromptOptions): { valid: boolean; errors: string[]; warnings: ValidationWarning[] } {
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

        const warnings = validateSemanticCombinations(options);

        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }
}

// Export singleton instance for convenience
export const promptEngine = new PromptEngine();

// Export class for testing
export { PromptEngine as PromptEngineClass };

// Re-export types
export type { PromptOptions } from './types';
