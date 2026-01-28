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
import { SelfieCaptureBuilder } from './builders/selfieCapture';
import { FormulationStoryInjectionBuilder } from './builders/formulationStoryInjection';
import { CompositionDetailsBuilder } from './builders/compositionDetails';
import { SceneStructureBuilder } from './builders/sceneStructure';
import { VisualGrammarBuilder } from './builders/visualGrammar';
import { PromptSanitizer } from './sanitizer';
import { buildStudioPrompt, PRODUCT_STUDIO_CANONICAL_PROMPT } from './studioPresets';
import type { PromptOptions } from './types';
import { buildMasterPrompt, MasterPromptSections } from './masterPrompt';

// ============================================================================
// NEGATIVE PROMPT - Quality anchors and artifact prevention
// ============================================================================
function negativePrompt(options?: PromptOptions) {
    const entries = [
        // Anatomical integrity
        "deformed hands", "extra fingers", "missing fingers", "long fingers",
        "broken fingers", "distorted limbs", "extra limbs", "extra arms",
        "extra legs", "mutated anatomy", "mangled hands", "disconnected arms",

        // Face integrity
        "blurry face", "distorted face", "face artifacts", "asymmetric face",
        "doll-like face", "cut-off head",

        // Torso integrity
        "cut-off torso", "partial person", "duplicate torso",

        // Skin issues
        "overexposed skin", "underexposed skin", "grainy skin texture",
        "over-smoothed skin", "plastic skin", "CGI human", "synthetic human",
        "mannequin", "waxy skin", "artificial face",

        // Product integrity
        "warped product", "stretched product", "deformed bottle",
        "giant bottle", "huge bottle", "oversized bottle",
        "giant jar", "huge jar", "oversized jar",
        "oversized product", "giant product", "product too large",
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
    ];
    const shouldGuardIdentity =
        options?.ugcRealModeActive ||
        ['natural', 'raw'].includes((options?.ugcStyle ?? '').toLowerCase());
    if (shouldGuardIdentity) {
        const additional = [
            'face consistency',
            'same face as reference',
            'matching facial features'
        ];
        additional.forEach(term => {
            if (!entries.includes(term)) {
                entries.push(term);
            }
        });
    }
    return entries.join(", ");
}

const generateRequestSeed = (): string => {
    if (typeof globalThis !== 'undefined') {
        const runtimeCrypto = (globalThis as typeof globalThis & { crypto?: Crypto }).crypto;
        if (runtimeCrypto?.randomUUID) {
            return runtimeCrypto.randomUUID();
        }
    }
    const randomComponent = Math.random().toString(36).slice(2, 10);
    return `${Date.now().toString(36)}-${randomComponent}`;
};

const MODE_RESOLUTION_GUARDRAIL = `
MODE RESOLUTION (MANDATORY)

If UGC, Raw Domestic UGC, or Lifestyle Real is enabled:
- Remove all camera terminology related to optics, lenses, focus, depth, bokeh, cinematic look, film look, or professional photography.
- Enforce flat, natural smartphone capture with no intentional depth or focus effects.
- Depth of field must be implicit, neutral, uncontrolled, and never described.
- Any conflicting camera or depth language must be ignored.
`.trim();

function prependModeResolutionGuardrail(prompt: string): string {
    if (prompt.trimStart().startsWith('MODE RESOLUTION (MANDATORY)')) return prompt.trim();
    return `${MODE_RESOLUTION_GUARDRAIL} ${prompt}`.replace(/\s+/g, ' ').trim();
}

function stripModeResolutionGuardrail(prompt: string): string {
    return prompt
        .replace(/^MODE RESOLUTION \(MANDATORY\).*?ignored\.\s*/i, '')
        .trim();
}

function isModeResolutionRestricted(options: PromptOptions): boolean {
    return (
        options.creationIntent === 'ugc' ||
        options.contentStyle === 'ugc' ||
        Boolean(options.ugcRealModeActive) ||
        Boolean(options.rawDomesticUgcActive) ||
        options.creationMode === 'lifestyle'
    );
}

function sanitizeCameraAestheticsForRestrictedModes(prompt: string, options: PromptOptions): string {
    if (!isModeResolutionRestricted(options)) return prompt;

    let sanitized = prompt;

    // Replace any explicit camera blocks with a fixed smartphone-safe description.
    sanitized = sanitized.replace(
        /\bCamera:\s*[^.]*\./gi,
        'Camera: Captured casually on a smartphone. Flat, natural image. Product and label are clearly visible and readable.'
    );

    // Remove optics / pro-camera terminology that can leak from older builders/mappings.
    sanitized = sanitized
        .replace(/\bdepth of field\b/gi, '')
        .replace(/\b(bokeh|cinematic|filmic|dslr|mirrorless|optics?|lenses?|lens|aperture|f-stop)\b/gi, '')
        .replace(/\bfilm look\b/gi, '')
        .replace(/\bprofessional photography\b/gi, '')
        .replace(/\b(professional lighting|studio lighting|controlled lighting)\b/gi, '')
        .replace(/\bf\/\d+(\s*[–-]\s*f\/\d+)?\b/gi, '')
        .replace(/\bportrait mode\b/gi, '')
        .replace(/\bfocus(ed|ing)?\b/gi, '')
        .replace(/\bsubject separation\b/gi, '')
        .replace(/\bbackground separation\b/gi, '')
        .replace(/\s+/g, ' ')
        .trim();

    return sanitized;
}

function isUgcSelfieCaptureActive(options: PromptOptions): boolean {
    const selfieActive = isSelfieActive(options);
    const ugcActive =
        options.contentStyle === 'ugc' ||
        options.creationIntent === 'ugc' ||
        Boolean(options.ugcRealModeActive) ||
        Boolean(options.rawDomesticUgcActive);
    return ugcActive && selfieActive;
}

function enforcePreflightGuards(options: PromptOptions) {
    const lock = options.identityLock;
    if (lock && options.personDetails) {
        const mismatches: string[] = [];
        const current = options.personDetails;
        if (lock.gender && current.gender && lock.gender !== current.gender) mismatches.push('gender');
        if (typeof lock.age === 'number' && typeof current.age === 'number' && lock.age !== current.age) mismatches.push('age');
        if (lock.skinTone && current.skinTone && lock.skinTone !== current.skinTone) mismatches.push('skinTone');
        if (lock.ethnicity && current.ethnicity && lock.ethnicity !== current.ethnicity) mismatches.push('ethnicity');
        if (lock.hairColor && current.hairColor && lock.hairColor !== current.hairColor) mismatches.push('hairColor');
        if (lock.hairTexture && current.hairTexture && lock.hairTexture !== current.hairTexture) mismatches.push('hairTexture');
        if (lock.hairLength && current.hairLength && lock.hairLength !== current.hairLength) mismatches.push('hairLength');
        if (mismatches.length > 0) {
            throw new Error(`[UGC IDENTITY LOCK] Mutated fields detected: ${mismatches.join(', ')}`);
        }
    }
    if (options.creationIntent === 'ugc') {
        const allowMissingEnvironment =
            options.creationMode === 'bg-replace' &&
            options.ecommerceSidePlacementFlag === true &&
            (Boolean(options.bgColor) || Boolean(options.bgGradient));
        const allowMissingEnvironmentForRitual = Boolean(options.ritualModeActive);
        if (!options.setting && !allowMissingEnvironment) {
            if (allowMissingEnvironmentForRitual) return;
            throw new Error('UGC environment missing or overridden. Please select or provide an environment.');
        }
    }
}

function applyModeResolution(prompt: string, options: PromptOptions): string {
    const sanitized = sanitizeCameraAestheticsForRestrictedModes(prompt, options);
    return prependModeResolutionGuardrail(sanitized);
}

const isSelfieActive = (options: PromptOptions): boolean => {
    const captureBase =
        options.ugcCaptureStyleBase ??
        options.ugcRealModeLayers?.captureBase ??
        [];
    const knownSelfieCaptureBaseIds = new Set([
        'torso-level-handheld',
        'high-angle',
        'low-angle',
        'close-face',
        'propped-surface'
    ]);
    if (captureBase.some(id => knownSelfieCaptureBaseIds.has(id))) {
        return true;
    }

    const selfieRaw =
        options.selfieMode ||
        options.personDetails?.selfieMode ||
        options.personDetails?.selfieType ||
        '';
    const normalized = String(selfieRaw).trim().toLowerCase();
    return normalized !== '' && normalized !== 'none';
};

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
    if (age >= 60 && (skinRealism.includes('soft retouch') || skinRealism.includes('smooth'))) {
        warnings.push({
            type: 'age-integrity',
            message: `⚠️ AGE INTEGRITY: Age ${age} with soft retouch may reduce age visibility. Consider Natural/Raw.`
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
    private selfieCaptureBuilder = new SelfieCaptureBuilder(); // Priority 3
    private ugcBuilder = new UGCRealModeBuilder();            // Priority 3 (DOMINANT)
    private narrativeBuilder = new SceneNarrativeBuilder();   // Priority 4
    private finalizeBuilder = new FinalizeBuilder();          // Priority 6
    private formulationStoryInjectionBuilder = new FormulationStoryInjectionBuilder();
    private compositionDetailsBuilder = new CompositionDetailsBuilder();
    private sceneStructureBuilder = new SceneStructureBuilder(); // NEW: Structure Layer
    private visualGrammarBuilder = new VisualGrammarBuilder();   // Priority 1.5: Grammar Layer

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

        // Identity variation must change on every render unless explicitly locked.
        // This prevents "same person" repeats when the user hits Generate multiple times without changing UI values.
        const shouldRandomizeIdentity =
            options.personIncluded === true &&
            options.contentStyle !== 'product' &&
            !options.hasModelReference &&
            options.sameCreatorAcrossScenes !== true &&
            options.identityMode !== 'locked';

	        if (shouldRandomizeIdentity) {
	            const timestamp = Date.now().toString(36).slice(-6);
	            const random = Math.random().toString(36).substring(2, 8);
	            options.identityVariationToken = `${timestamp}-${random}`.toUpperCase();
	            options.identityKey = undefined;
	            options.identityMode = 'auto';
	        }

        if (options.sameCreatorAcrossScenes === true && !options.hasModelReference) {
            options.identityMode = 'locked';
            if (!options.identityKey) {
                if (typeof globalThis !== 'undefined') {
                    const runtimeCrypto = (globalThis as typeof globalThis & { crypto?: Crypto }).crypto;
                    if (runtimeCrypto?.randomUUID) {
                        options.identityKey = runtimeCrypto.randomUUID();
                    }
                }
                if (!options.identityKey) {
                    const randomComponent = Math.random().toString(36).slice(2, 10);
                    options.identityKey = `${Date.now().toString(36)}-${randomComponent}`;
                }
            }
            options.identityVariationToken = undefined;
        }

        if (!options.identityLock) {
            options.seed = generateRequestSeed();
        }

        // ====================================================================
        // RULE 4: MANDATORY SAFETY GUARD - Fail early
        // ====================================================================
        const isSelfie = isSelfieActive(options);
        const productCount = options.productAssets?.length || 0;

        if (isSelfie && productCount > 1) {
            const errorMessage =
                'Selfie capture allows exactly one visible product. Multiple products are not permitted.';
            console.error(`❌ CRITICAL: ${errorMessage}`);
            throw new InvalidSceneCombinationError(errorMessage);
        }

        // ====================================================================
        // VALIDATION - Check for illegal combinations
        // ====================================================================
        const warnings = validateSemanticCombinations(options);
        if (warnings.length > 0) {
            console.warn('[PROMPT ENGINE] Validation warnings:', warnings);
            warnings.forEach(w => console.warn(`  ${w.message}`));
        }

        enforcePreflightGuards(options);

        // ====================================================================
        // CLEANUP INSTRUMENTATION — TEMPORARY (remove after usage mapping)
        // ====================================================================
        console.log('[CLEANUP-INSTRUMENT] ===== BUILD CALL START =====');
        console.log('[CLEANUP-INSTRUMENT] creationMode:', options.creationMode);
        console.log('[CLEANUP-INSTRUMENT] contentStyle:', options.contentStyle);
        console.log('[CLEANUP-INSTRUMENT] sceneType:', (options as any).sceneType);
        console.log('[CLEANUP-INSTRUMENT] setting/environment:', options.setting);
        console.log('[CLEANUP-INSTRUMENT] microLocation:', options.microLocation);
        console.log('[CLEANUP-INSTRUMENT] ugcRealModeActive:', options.ugcRealModeActive);
        console.log('[CLEANUP-INSTRUMENT] brandLook:', (options as any).brandLook);
        console.log('[CLEANUP-INSTRUMENT] editorialStyle:', (options as any).editorialStyle);
        console.log('[CLEANUP-INSTRUMENT] personIncluded:', options.personIncluded);

        // ====================================================================
        // STEP 1: Modes (handled in narrativeBuilder.buildCreationIntent/Mode)
        // ====================================================================
        console.log('[PROMPT ENGINE] Step 1: Modes -', options.creationMode, options.creationIntent);

        // ====================================================================
        // STUDIO MODE FAST-PATH (MEGA PROMPT V2)
        // ====================================================================
        if (options.creationMode === 'studio') {
            console.log('[CLEANUP-INSTRUMENT] BRANCH: 🟢 STUDIO FAST-PATH');
            console.log('[PROMPT ENGINE] Studio Mode FAST-PATH activated');

            // MUTUAL EXCLUSIVITY GUARD: Studio mode must not have environment data
            if (options.setting && options.setting !== '' && options.setting !== 'studio') {
                console.warn('[STUDIO GUARD] Environment detected in Studio mode - clearing:', options.setting);
                (options as any).setting = '';
                (options as any).environment = '';
                (options as any).microLocation = '';
            }

            // Log which Studio options are being used
            console.log('[CLEANUP-INSTRUMENT] Studio options:', {
                photoMode: (options as any).photoMode || (options as any).studioPhotoMode,
                surface: (options as any).studioSurface,
                composition: (options as any).studioComposition,
                lighting: (options as any).studioLighting,
                hasPalette: !!((options as any).paletteColor1 || (options as any).paletteColor2),
            });

            const studioPrompt = buildStudioPrompt({
                // Photo Mode
                photoMode: (options as any).photoMode || (options as any).studioPhotoMode,

                // Props / Ingredients (Ingredient Stack only)
                suggestedProps: (options as any).suggestedProps || (options as any).studioProps,
                ingredientLayout: (options as any).ingredientLayout || (options as any).studioIngredientLayout,

                // Auto Palette Extraction
                paletteColor1: (options as any).paletteColor1,
                paletteColor2: (options as any).paletteColor2,
                paletteColor3: (options as any).paletteColor3,

                // Background (fallback if no palette)
                backgroundColor: (options as any).heroBackground || options.bgColor,
                gradientStart: options.bgGradient?.startColor,
                gradientEnd: options.bgGradient?.endColor,

                // Surface
                surface: (options as any).studioSurface,
                surfaceHarmonizeWithPalette: (options as any).surfaceHarmonizeWithPalette,

                // Composition
                composition: (options as any).studioComposition,
                scale: (options as any).studioScale,
                spacing: (options as any).studioSpacing,
                negativeSpace: (options as any).studioNegativeSpace,

                // Camera
                lens: (options as any).studioLens,
                angle: (options as any).studioAngle,
                distance: (options as any).studioDistance,
                framing: (options as any).studioFraming,

                // Lighting & Finish
                lighting: (options as any).studioLighting,
                finish: (options as any).studioFinish,
                shadow: (options as any).studioShadow || (options as any).heroShadow,

                // Optional Interaction
                interaction: (options as any).studioInteraction
            });

            // Prepend the canonical prompt as the authoritative root contract
            const finalStudioPrompt = `${PRODUCT_STUDIO_CANONICAL_PROMPT}\n\n---\n\nGENERATION INSTRUCTIONS:\n${studioPrompt}`;

            console.log('[CLEANUP-INSTRUMENT] ===== BUILD CALL END (Studio) =====');
            console.log('[FINAL PROMPT STRING]', finalStudioPrompt);
            return finalStudioPrompt;
        }

        // If we reach here, we're in LEGACY branch
        console.log('[CLEANUP-INSTRUMENT] BRANCH: 🟡 LEGACY PIPELINE');

        const ugcSelfieDominant = options.contentStyle === 'ugc' && isSelfie;
        options.ugcSelfieDominant = ugcSelfieDominant;

        if (ugcSelfieDominant) {
            const overrideTarget = options as any;
            const isCloseFace =
                options.ugcCaptureStyleBase?.includes('close-face') ||
                options.ugcRealModeLayers?.captureBase?.includes('close-face');
            overrideTarget.creationMode = 'ugc_selfie';
            overrideTarget.compositionMode = null;
            overrideTarget.sceneIntent = null;
            overrideTarget.shotType = null;
            delete overrideTarget.cameraDistance;
            if (isCloseFace) {
                overrideTarget.cameraDistance = 'extreme_close';
            }
            overrideTarget.personPose = null;
            overrideTarget.camera = 'front-facing smartphone camera';
            overrideTarget.cameraDeviceSemantic = 'front-facing smartphone camera';
            overrideTarget.cameraType = null;
            overrideTarget.placementCamera = null;

            // Aggressive wipe of forbidden framing terms to prevent leakage violations
            const forbiddenKeys = ['shotType', 'cameraDistance', 'cameraShot', 'cameraAngle', 'perspective', 'framing', 'personPose', 'wardrobe', 'identityBlock'];
            const forbiddenTerms = ['lifestyle', 'portrait', 'medium', 'torso', 'rule of thirds'];

            const cleanValue = (val: any) => {
                if (typeof val !== 'string') return val;
                let cleaned = val;
                forbiddenTerms.forEach(term => {
                    const regex = new RegExp(term, 'gi');
                    cleaned = cleaned.replace(regex, '');
                });
                return cleaned.trim();
            };

            forbiddenKeys.forEach(key => {
                if (overrideTarget[key]) overrideTarget[key] = cleanValue(overrideTarget[key]);
                if (options.personDetails && (options.personDetails as any)[key]) {
                    (options.personDetails as any)[key] = cleanValue((options.personDetails as any)[key]);
                }
            });

            if (options.personDetails) {
                options.personDetails.personPose = undefined;
            }
        }

        // ====================================================================
        // STEP 2: Identity
        // ====================================================================
        const shouldIncludeIdentity =
            options.personIncluded &&
            options.contentStyle !== 'product';

        const identitySection = shouldIncludeIdentity
            ? this.identityBuilder.build(options)
            : '';
        const selfieCaptureSection = this.selfieCaptureBuilder.build(options);

        console.log('[PROMPT ENGINE] Step 2: Identity -',
            shouldIncludeIdentity ? `${identitySection.length} chars` : 'SUPPRESSED');

        if (ugcSelfieDominant) {
            const ugcSection = this.ugcBuilder.build(options);
            const finalizeSection = this.finalizeBuilder.build(options);
            const negative = negativePrompt(options);
            let finalPrompt = [
                identitySection,
                selfieCaptureSection,
                ugcSection,
                finalizeSection
            ]
                .filter(Boolean)
                .join(' ')
                .replace(/\s+/g, ' ')
                .trim();
            finalPrompt = `${finalPrompt} Negative prompt: ${negative}`.replace(/\s+/g, ' ').trim();
            finalPrompt = applyModeResolution(finalPrompt, options);
            console.log('[PROMPT ENGINE] Selfie-dominant pipeline ACTIVE');
            console.log('[FINAL PROMPT STRING]', finalPrompt);
            return finalPrompt;
        }

        // ====================================================================
        // STEP 3: UGC Real Mode (DOMINANT MODIFIER)
        // ====================================================================
        const ugcSection = this.ugcBuilder.build(options);
        console.log('[PROMPT ENGINE] Step 3: UGC Real Mode -',
            options.ugcRealModeActive ? 'ACTIVE (dominant)' : 'inactive');

        // ====================================================================
        // STEP 4: Canonical Scene
        // ====================================================================
        const constraintsSection = this.constraintsBuilder.build(options);
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
        const formulationStoryInjection = this.formulationStoryInjectionBuilder.build(options);
        const compositionDetailsSection = this.compositionDetailsBuilder.build(options);
        const finalizeSection = this.finalizeBuilder.build(options);
        console.log('[PROMPT ENGINE] Step 6: Finalize -', `${finalizeSection.length} chars`);

        // ====================================================================
        // ASSEMBLE MASTER PROMPT (canonical order)
        // ====================================================================
        const negative = negativePrompt(options);
        const masterSections: MasterPromptSections = {
            sceneStructure: this.sceneStructureBuilder.build(options),
            visualGrammar: this.visualGrammarBuilder.build(options),
            creationIntent: narrativeSections.creationIntent,
            creationMode: narrativeSections.creationMode,
            ugcRealMode: ugcSection || narrativeSections.ugcRealMode,
            formulationStory: [narrativeSections.formulationStory, formulationStoryInjection].filter(Boolean).join(' '),
            ecommerceBuilder: narrativeSections.ecommerceBuilder,
            cameraFraming: narrativeSections.cameraFraming,
            environmentLightingMood: narrativeSections.environmentLightingMood,
            compositionDetails: compositionDetailsSection,
            selfieCapture: selfieCaptureSection,
            identity: narrativeSections.identity || identitySection,
            finalize: finalizeSection
        };

        const resolvedUgcStyle = options.ugcStyle ?? 'optimized';
        let finalPrompt = buildMasterPrompt(masterSections, negative, resolvedUgcStyle);

        const bannedEnvironmentalTerms = /(luxury editorial|hero framing|cinema camera)/i;
        if (options.sceneIntent === 'environment' && options.creationIntent !== 'ugc' && bannedEnvironmentalTerms.test(finalPrompt)) {
            console.warn('[PROMPT ENGINE] Environment guard triggered - overriding to environment-safe placement');
            masterSections.creationMode = 'Environment-first lifestyle composition with natural surroundings and contextual product placement.';
            masterSections.ecommerceBuilder = undefined;
            masterSections.cameraFraming = 'Camera: handheld smartphone perspective capturing lived-in surroundings, avoiding cinematic hero angles.';
            finalPrompt = buildMasterPrompt(masterSections, negative, resolvedUgcStyle);
        }

        if (/data:image/i.test(finalPrompt)) {
            throw new Error('Base64 image data must not be included in prompt text');
        }

        if (finalPrompt.length > 30000) {
            throw new Error('Prompt too large, aborting build');
        }

        finalPrompt = applyModeResolution(finalPrompt, options);

        // ====================================================================
        // PRODUCT MODE HUMAN EXCLUSION (Legacy) -> Still valid
        // ====================================================================
        const isProductOnly = options.contentStyle === 'product';
        if (isProductOnly) {
            const forbidden = /\b(lifestyle|ugc|user-generated|selfie|phone|creator|person|people|human|identity|ethnicity|age|face)\b/i;
            const negativeMarker = ' Negative prompt: ';
            const negativeIndex = finalPrompt.indexOf(negativeMarker);
            const rawPositivePrompt = negativeIndex >= 0 ? finalPrompt.substring(0, negativeIndex) : finalPrompt;
            const positivePrompt = stripModeResolutionGuardrail(rawPositivePrompt);
            const match = forbidden.exec(positivePrompt);
            if (match) {
                const matchIndex = match.index ?? 0;
                const excerptStart = Math.max(0, matchIndex - 140);
                const excerptEnd = Math.min(positivePrompt.length, matchIndex + 140);
                console.error('[PRODUCT MODE BLOCK] Forbidden language detected in positive prompt', {
                    match: match[0],
                    excerpt: positivePrompt.slice(excerptStart, excerptEnd)
                });
                throw new InvalidSceneCombinationError(
                    `Product Step 3 cannot include lifestyle, UGC, phone/selfie, or human identity language. Found: "${match[0]}".`
                );
            }
        }

        // ====================================================================
        // NEW: SANITIZER & INTEGRITY ASSERTION
        // ====================================================================
        if (isProductOnly) {
            const sanitizer = new PromptSanitizer(); // Instantiate here or as class property
            finalPrompt = sanitizer.sanitize(finalPrompt);
            try {
                sanitizer.assertIntegrity(finalPrompt, options);
            } catch (e: any) {
                console.error('[PROMPT INTEGRITY FAILURE]', e.message);
                throw e; // Hard fail as requested
            }
        }

        // ====================================================================
        // STUDIO MODE ISOLATION GUARD (for sceneType-based Studio access)
        // ====================================================================
        // Note: creationMode === 'studio' is handled by the fast-path above.
        // This guard catches sceneType === 'studio_packshot' which may bypass the fast-path.
        const isStudioPackshotType = (options as any).sceneType === 'studio_packshot';

        if (isStudioPackshotType) {
            console.log('[STUDIO GUARD] Active (sceneType) - Enforcing strict product isolation');

            // 1. POSITIVE INJECTION: Prepend explicit Studio context
            const studioPositiveInjection =
                'Studio setting. ' +
                'No real environment. ' +
                'No lifestyle context. ' +
                'No home, kitchen, bathroom, vanity, counter, or room. ' +
                'Abstract studio backdrop or clean gradient only. ';

            // Insert after the first sentence of the prompt
            const periodIndex = finalPrompt.indexOf('. ');
            if (periodIndex > 0) {
                finalPrompt = finalPrompt.substring(0, periodIndex + 2) + studioPositiveInjection + finalPrompt.substring(periodIndex + 2);
            } else {
                finalPrompt = studioPositiveInjection + finalPrompt;
            }

            // 2. NEGATIVE INJECTION: Append extended anti-lifestyle negatives
            const studioNegativeExtension =
                ', no lifestyle scene, no home environment, no routine depiction, ' +
                'no daily-use context, no bathroom, no kitchen, no vanity, no counter, ' +
                'no morning routine, no wellness context, no product in use, no person using product';

            const negativeMarkerIdx = finalPrompt.indexOf('Negative prompt: ');
            if (negativeMarkerIdx >= 0) {
                // Append to existing negative
                finalPrompt = finalPrompt + studioNegativeExtension;
            }
        }

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
        const ugcSelfieDominant = options.contentStyle === 'ugc' && isSelfieActive(options);
        options.ugcSelfieDominant = ugcSelfieDominant;

        const shouldIncludeIdentity =
            options.personIncluded &&
            !options.hasModelReference &&
            options.contentStyle !== 'product';

        const identitySection = shouldIncludeIdentity
            ? this.identityBuilder.build(options)
            : '';
        const ugcSection = this.ugcBuilder.build(options);
        const selfieCaptureSection = this.selfieCaptureBuilder.build(options);
        const finalizeSection = this.finalizeBuilder.build(options);

        if (ugcSelfieDominant) {
            return {
                Narrative: [
                    identitySection,
                    selfieCaptureSection,
                    ugcSection,
                    finalizeSection
                ]
                    .filter(Boolean)
                    .join(' '),
                Identity: identitySection,
                UGC: ugcSection,
                Constraints: '',
                Finalize: finalizeSection
            };
        }

        const constraintsSection = this.constraintsBuilder.build(options);
        const narrativeSections = this.narrativeBuilder.build(options, {
            identity: identitySection,
            constraints: constraintsSection
        });
        const compositionDetailsSection = this.compositionDetailsBuilder.build(options);

        return {
            Narrative: [
                narrativeSections.creationIntent,
                narrativeSections.creationMode,
                ugcSection || narrativeSections.ugcRealMode,
                narrativeSections.formulationStory ?? '',
                narrativeSections.ecommerceBuilder ?? '',
                narrativeSections.cameraFraming,
                narrativeSections.environmentLightingMood,
                selfieCaptureSection,
                compositionDetailsSection,
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
