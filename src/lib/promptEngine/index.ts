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
import type { PromptOptions } from './types';
import { buildMasterPrompt, MasterPromptSections } from './masterPrompt';

// ============================================================================
// NEGATIVE PROMPT - Quality anchors and artifact prevention
// ============================================================================
const RAW_DOMESTIC_NEGATIVE_APPEND =
    'No studio lighting, no cinematic look, no professional photography, no centered composition, no passport photo, no fashion editorial, no shallow depth of field, no background bokeh, no HDR look, no perfect symmetry, no influencer styling, no product hero shot.';
function negativePrompt(options?: PromptOptions) {
    const entries = [
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
        "over-smoothed skin", "plastic skin", "CGI human", "synthetic human",
        "mannequin", "waxy skin", "artificial face",

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

        // Depth of field suppression for UGC
        "background blur", "portrait blur", "bokeh", "cinematic focus", "cinematic blur", "shallow depth of field", "soft background",
        "blurred background", "soft focus", "portrait mode effect", "depth effect", "background separation", "subject separation", "lens blur",

        // Wardrobe consistency
        "altered outfit", "invented clothing", "incorrect fabric",
        "incorrect outfit color", "wrong clothing texture"
    ];
    if (options?.rawDomesticUgcActive) {
        entries.push(RAW_DOMESTIC_NEGATIVE_APPEND);
    }
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

const DEPTH_DETECTION_REGEX = /(depth of field|portrait mode|portrait blur|bokeh|bokeh effect|background blur|blurred background|lens blur|lens emulation|cinematic focus|cinematic blur|subject separation|background separation|subject isolation|shallow depth|shallow focus|soft background|soft focus|depth cues|depth effect|spatial depth|defocused background)/gi;
const FOCUS_OVERRIDE_APPEND =
    'flat focus across the entire frame, small sensor, fixed wide lens, everything sharp foreground to background.';
const UGC_DEPTH_LOCK_APPEND =
    'no background separation, no portrait mode, no bokeh, no shallow depth of field, no cinematic blur.';

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
        if (!options.setting && !allowMissingEnvironment) {
            throw new Error('UGC environment missing or overridden. Please select or provide an environment.');
        }
    }
}

function enforceUgcFocusGuard(prompt: string, options: PromptOptions): string {
    const ugcActive =
        options.contentStyle === 'ugc' ||
        options.creationIntent === 'ugc' ||
        options.ugcRealModeActive ||
        options.rawDomesticUgcActive ||
        isUgcSelfieCaptureActive(options);
    if (!ugcActive) {
        return prompt;
    }

    // Split positive and negative prompt (negative can have depth terms as blockers)
    const negativeMarker = ' Negative prompt: ';
    const negativeIndex = prompt.indexOf(negativeMarker);
    let positivePrompt = negativeIndex >= 0 ? prompt.substring(0, negativeIndex) : prompt;
    const negativePrompt = negativeIndex >= 0 ? prompt.substring(negativeIndex) : '';

    const allowDepthMention = (before: string, withinBlockedList: boolean): boolean => {
        const snippet = before.toLowerCase();
        // Allow negations like "no background blur", "no shallow depth of field", etc.
        if (/\bno\b[\s\w-]{0,20}$/.test(snippet)) return true;
        if (withinBlockedList) return true;
        if (/\bblocked[:\s,]*$/.test(snippet)) return true;
        if (snippet.includes('blocked:')) return true;
        if (snippet.includes('blocked')) return true;
        return false;
    };

    // Do not mutate prompt content; only enforce that any depth terms are negated/blocked.
    if (!/flat focus across the entire frame/i.test(positivePrompt)) {
        positivePrompt = `${positivePrompt} ${FOCUS_OVERRIDE_APPEND}`;
    }
    if (!/no background separation/i.test(positivePrompt)) {
        positivePrompt = `${positivePrompt} ${UGC_DEPTH_LOCK_APPEND}`;
    }

    // Check only positive prompt for remaining depth terms
    DEPTH_DETECTION_REGEX.lastIndex = 0;
    let match: RegExpExecArray | null = null;
    while ((match = DEPTH_DETECTION_REGEX.exec(positivePrompt))) {
        const offset = match.index ?? 0;
        const before = positivePrompt.slice(Math.max(0, offset - 25), offset);
        const prefix = positivePrompt.slice(0, offset).toLowerCase();
        const lastBlocked = prefix.lastIndexOf('blocked:');
        const withinBlockedList = lastBlocked !== -1 && offset - lastBlocked < 400;
        if (allowDepthMention(before, withinBlockedList)) {
            continue;
        }
        throw new Error(
            `UGC depth conflict detected: "${match[0]}" language present in positive prompt. Re-run generation.`
        );
    }

    // Rejoin with negative prompt
    return `${positivePrompt}${negativePrompt}`.replace(/\s+/g, ' ').trim();
}

const isSelfieActive = (options: PromptOptions): boolean => {
    const captureBase =
        options.ugcCaptureStyleBase ??
        options.ugcRealModeLayers?.captureBase ??
        [];
    const knownSelfieCaptureBaseIds = new Set([
        'torso-level-handheld',
        'high-angle',
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
        // STEP 1: Modes (handled in narrativeBuilder.buildCreationIntent/Mode)
        // ====================================================================
        console.log('[PROMPT ENGINE] Step 1: Modes -', options.creationMode, options.creationIntent);

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
            finalPrompt = enforceUgcFocusGuard(finalPrompt, options);
            finalPrompt = `${finalPrompt} Negative prompt: ${negative}`.replace(/\s+/g, ' ').trim();
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

        finalPrompt = enforceUgcFocusGuard(finalPrompt, options);

        // ====================================================================
        // PRODUCT MODE HARD BLOCK: no lifestyle/UGC/human language in positive prompt
        // ====================================================================
        const isProductOnly =
            options.contentStyle === 'product' ||
            options.creationIntent === 'product' ||
            options.sceneIntent === 'ecommerce';
        if (isProductOnly) {
            const forbidden = /\b(lifestyle|ugc|user-generated|selfie|phone|creator|person|people|human|identity|ethnicity|age|face)\b/i;
            const negativeMarker = ' Negative prompt: ';
            const negativeIndex = finalPrompt.indexOf(negativeMarker);
            const positivePrompt = negativeIndex >= 0 ? finalPrompt.substring(0, negativeIndex) : finalPrompt;
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
