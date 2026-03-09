import type { PromptOptions } from '../types';
import { ProductBuilder } from './product';
import { ClothingBuilder } from './clothing';
import { buildCamera } from './camera';
import { buildEnvironment } from './environment';
import { buildLighting } from './lighting';
import { FormulationStoryBuilder } from './formulationStory';

export interface SceneNarrativeSections {
    creationIntent: string;
    creationMode: string;
    ugcRealMode: string;
    formulationStory?: string;
    ecommerceBuilder?: string;
    cameraFraming: string;
    environmentLightingMood: string;
    identity?: string;
}

interface SceneNarrativeExtras {
    identity?: string;
    constraints?: string;
    lifestyleProfessionalBias?: string;
}

const creationModeCopy: Record<string, string> = {
    // Keep lifestyle wording free of explicit "human" to avoid leaking into product-mode guards
    lifestyle: 'Lifestyle environment with the product integrated naturally into the scene.',
    studio: 'Studio-style hero shot. Controlled lighting and composition.',
    aesthetic: 'Aesthetic-focused composition. Design-forward styling.',
    'bg-replace': 'Background replaced while preserving subject realism.',
    'ecom-blank': 'Ecommerce blank-space composition. Designed for PDP and paid ads.'
};

const sidePlacementCopy: Record<string, string> = {
    left: 'Product anchored on the left side of the frame, leaving the right side open for copy.',
    center: 'Product centered with balanced copy space on both sides.',
    right: 'Product anchored on the right side of the frame, leaving the left side open for copy.'
};

const INDOOR_ENVIRONMENTS = new Set([
    'Kitchen',
    'Living Room',
    'Bedroom',
    'Bathroom',
    'Workspace',
    'Hallway',
    'Home Gym',
    'Balcony / Indoor Terrace'
]);

const OUTDOOR_ENVIRONMENTS = new Set([
    'Urban Exterior',
    'Natural Exterior',
    'Parking Lot',
    'Backyard / Patio',
    'Street Corner'
]);

const formatEnvironmentPhrase = (environmentText?: string): string => {
    if (!environmentText?.trim()) {
        return '';
    }
    const normalized = environmentText.trim();
    const lower = normalized.toLowerCase();
    if (INDOOR_ENVIRONMENTS.has(normalized)) {
        return `inside a ${lower}`;
    }
    if (OUTDOOR_ENVIRONMENTS.has(normalized)) {
        return `outdoors on a ${lower}`;
    }
    return `in ${lower}`;
};

const HUMAN_REALISM_GUARD =
    'Human realism guard (non-negotiable): real human face and skin only. Preserve pores, micro-texture, natural asymmetry, realistic eyelids, believable lip texture, and authentic facial structure. No doll face, no mannequin features, no porcelain skin, no waxy highlights, no CGI facial rendering, and no beauty-filter smoothing.';

const shouldApplyHumanRealismGuard = (options: PromptOptions): boolean => {
    const isNonUGC = !options.ugcRealModeActive && options.contentStyle !== 'ugc';
    return isNonUGC && options.personIncluded === true && (options.creationMode === 'lifestyle' || options.creationMode === 'aesthetic' || Boolean(options.formulationExpertEnabled));
};

export class SceneNarrativeBuilder {
    private productBuilder = new ProductBuilder();
    private clothingBuilder = new ClothingBuilder();

    build(
        options: PromptOptions,
        extras: SceneNarrativeExtras = {}
    ): SceneNarrativeSections {
        const creationIntent = this.buildCreationIntent(options);
        const creationMode = this.buildCreationMode(options);
        const ugcRealMode = this.buildUgcRealMode(options);
        const formulationStory = this.buildFormulationStory(options);
        const ecommerceBuilder = this.buildEcommerceBuilder(options);
        const cameraFraming = this.buildCameraFraming(options, extras.constraints);
        const environmentLightingMood = this.buildEnvironmentLightingMood(
            options,
            extras.lifestyleProfessionalBias
        );

        return {
            creationIntent,
            creationMode,
            ugcRealMode,
            formulationStory,
            ecommerceBuilder,
            cameraFraming,
            environmentLightingMood,
            identity: extras.identity
        };
    }

    private buildCreationIntent(options: PromptOptions): string {
        const clothingCopy = this.clothingBuilder.build(options);
        const productCopy = this.productBuilder.build(options);
        const ritualCopy = this.buildRitualMode(options);
        const parts: string[] = [];

        const isProductMode =
            options.creationIntent === 'product' ||
            options.contentStyle === 'product' ||
            options.sceneIntent === 'ecommerce';

        switch (options.creationIntent) {
            case 'product':
                parts.push(
                    'Product-focused commercial image.',
                    'Clean composition designed for ecommerce and ads.',
                    'No narrative context.'
                );
                break;
            case 'brand':
                if (options.formulationExpertEnabled === true) {
                    parts.push(
                        'Expert-led product narrative.',
                        'Scientific credibility and formulation trust.',
                        'The expert remains the primary subject.'
                    );
                } else {
                    parts.push(
                        'Brand-led product narrative.',
                        'Commercial credibility with real human presence.',
                        'The product remains the primary commercial subject.'
                    );
                }
                break;
        default:
            if (isProductMode) {
                parts.push(
                    'Product-focused commercial image.',
                    'Clean composition designed for ecommerce and ads.',
                    'No narrative context.'
                );
            } else {
                const ugcStyle = String(options.ugcStyle || 'optimized').toLowerCase();
                const isUgcReal =
                    Boolean(options.realModeActive) ||
                    Boolean(options.ugcRealModeActive) ||
                    Boolean(options.rawDomesticUgcActive);
                const wantsUgcLook = isUgcReal || ugcStyle === 'raw' || ugcStyle === 'natural';
                const isLifestyleCampaign =
                    options.creationMode === 'lifestyle' && Boolean(options.personIncluded);

                if (isLifestyleCampaign) {
                    parts.push(
                        'Lifestyle advertising campaign photo with real models and curated luxury styling.',
                        options.lifestyleAdvertisingProfile ||
                            'The person must appear as a real advertising model with polished presentation, natural believable features, and campaign-ready grooming; not casual, not domestic, not documentary.',
                        options.lifestyleWardrobeRules ||
                            'Wardrobe must be premium, clean, intact, and well-fitted; fabrics must look new, structured, and high-quality; no torn, worn, distressed, frayed, stretched, damaged, or aged garments; no casual homewear or sloppy knits; styling must resemble a luxury brand advertising campaign.',
                        options.lifestyleEnvironmentInterpretation ||
                            'The environment feels like a curated editorial luxury interior with clean surfaces, intentional styling, and no clutter.',
                        options.lifestyleHardRestrictions ||
                            'Hard restrictions (Lifestyle Advertising): Do NOT depict damaged clothing, distressed fabrics, domestic realism, casual everyday appearance, or UGC/documentary visuals; any of these makes the generation invalid.'
                    );
                } else if (wantsUgcLook) {
                    parts.push(
                        'UGC-style lifestyle scene.',
                        'Authentic, casual, real-world feeling.',
                        'Natural imperfections are acceptable.',
                        'Allowed creator presence.'
                    );
                } else {
                    parts.push(
                        'High-end lifestyle campaign photo.',
                        'Professional advertising/editorial quality with clean, intentional styling.',
                        'Spotless environment: no crumbs, stains, dust, clutter, or random mess.',
                        'Art-directed but natural: curated props only, brand-safe, premium look.'
                    );
                }
            }
        }

        if (clothingCopy) {
            parts.push(clothingCopy);
        }

        if (ritualCopy) {
            parts.push(ritualCopy);
        }

        if (productCopy) {
            parts.push(productCopy);
        }

        return parts.filter(Boolean).join(' ');
    }

    private buildRitualMode(options: PromptOptions): string {
        if (!options.ritualModeActive) return '';
        const activities = Array.isArray(options.ritualActivities) ? options.ritualActivities : [];
        const custom = String(options.ritualCustom || '').trim();
        const all = [...activities, ...(custom ? [custom] : [])]
            .map(item => item.trim())
            .filter(Boolean);
        const ritualList = all.length ? all.join(', ') : 'meditation, yoga, breathwork, or a wellness routine';

        const normalize = (value: string) => value.trim().toLowerCase();
        const noObjects = options.ritualNoObjects === true;
        const heroCanvasActive =
            options.creationMode === 'bg-replace' || options.ecommerceSidePlacementFlag === true;
        const isCouple = options.personCount === 'couple';
        const coupleStaging = String(options.ritualCoupleStaging || '').trim();
        const posture = String(options.ritualPosture || '').trim();
        const postureCopy =
            posture && posture !== 'Auto'
                ? isCouple
                    ? `POSTURE: Both subjects are ${posture.toLowerCase()} (coordinated, not mirrored).`
                    : `POSTURE: Subject is ${posture.toLowerCase()}.`
                : '';
        const coupleStagingCopy = (() => {
            if (!isCouple) return '';
            switch (coupleStaging) {
                case 'Together (one behind the other)':
                    return 'COUPLE STAGING: Together with one person slightly behind the other (stacked depth), both clearly visible.';
                case 'Facing each other':
                    return 'COUPLE STAGING: Facing each other, interacting naturally while performing the ritual.';
                case 'Separated (different areas)':
                    return 'COUPLE STAGING: Separated within the same environment (different areas), both performing the ritual simultaneously; keep both clearly visible.';
                case 'Together (side-by-side)':
                default:
                    return 'COUPLE STAGING: Together side-by-side, both clearly visible.';
            }
        })();

        const coupleRitualCopy = isCouple
            ? [
                'COUPLE RITUAL: Both subjects must be actively performing the ritual.',
                'They should be coordinated and similar (same ritual theme), but not identical: vary micro-poses, timing, gaze, or hand placement so it feels natural and not mirrored.',
                'Both actions must be readable in-frame at the same time.'
            ].join(' ')
            : '';
        const actionHintsByRitual: Record<string, string> = {
            'meditation':
                noObjects
                    ? 'Show a clear meditation posture (seated cross-legged or on a chair), relaxed shoulders, hands resting on knees; empty hands, no props.'
                    : 'Show a clear meditation posture (seated cross-legged or on a chair), relaxed shoulders, hands resting on knees; keep the setting minimal and calm.',
            'breathwork':
                noObjects
                    ? 'Show an obvious breathwork action: seated posture, one hand on belly and one on chest, slow exhale; no props, empty hands.'
                    : 'Show an obvious breathwork action: seated posture, one hand on belly and one on chest, slow exhale, calm focused breathing.',
            'yoga':
                noObjects
                    ? 'Show a recognizable yoga pose (sun salutation, downward dog, warrior pose); body posture must read as actively practicing; no props.'
                    : 'Show a recognizable yoga pose (sun salutation, downward dog, warrior pose); body posture must read as actively practicing.',
            'running':
                noObjects
                    ? 'Show a running moment (mid-stride) with athletic wear; no handheld items.'
                    : 'Show a running moment (mid-stride) or a pre/post-run action (stretching calves) with athletic wear.',
            'strength training':
                noObjects
                    ? 'Show a clear strength training action using bodyweight only (squats, lunges, push-ups) with visible exertion and proper form; no equipment.'
                    : 'Show a clear strength training action: dumbbells/kettlebell, squat/lunge/press, or resistance bands; visible exertion and proper form.',
            'stretching':
                noObjects
                    ? 'Show a visible stretching action (hamstring stretch, quad stretch, shoulder stretch); body position must read as actively stretching; no props.'
                    : 'Show a visible stretching action (hamstring stretch, quad stretch, shoulder stretch); body position must read as actively stretching.',
            'morning routine':
                noObjects
                    ? 'Show a morning routine action without props: opening curtains, stretching, or preparing to leave the house; warm morning light; no items in hands.'
                    : 'Show a morning routine action: making coffee/tea, opening curtains, journaling at a table, or preparing breakfast; warm morning light and tidy setting.',
            'journaling':
                noObjects
                    ? 'Show a reflective journaling moment without props: seated posture, thoughtful pause, hands relaxed; no notebook/pen.'
                    : 'Show an obvious journaling action: notebook open, pen in hand, writing mid-sentence at a table; soft morning/afternoon light.',
            'hydration / water intake':
                noObjects
                    ? 'Show a hydration-focused lifestyle moment without props: post-workout breathing and reset; no bottles or cups.'
                    : 'Show a hydration action: person actively drinking water or filling a glass; natural casual moment.',
            'smoothie prep':
                noObjects
                    ? 'Show a wellness kitchen moment without props: moving through the kitchen, preparing for a routine; no blender, no food items.'
                    : 'Show smoothie prep action: blender on counter, ingredients visible, pouring into a glass; hands mid-action.',
            'meal prep':
                noObjects
                    ? 'Show a wellness kitchen routine without props: moving through a tidy kitchen, setting intentions; no food items, no tools.'
                    : 'Show meal prep action: chopping vegetables, assembling bowls, using cutting board; kitchen counter with ingredients in-use (tidy but active).',
            'nature walk':
                'Show an outdoor nature walk action: walking on a trail/park path, casual pace; environment clearly outdoors and green; no handheld items.',
            'cold plunge':
                noObjects
                    ? 'Show a cold plunge action: stepping into a cold tub, visible cold breath; no props.'
                    : 'Show a cold plunge action: stepping into a cold tub, visible cold breath; the action must read as cold immersion.',
            'sauna':
                noObjects
                    ? 'Show a sauna action: warm wood sauna setting, subtle sweat/steam; relaxing seated posture; no props.'
                    : 'Show a sauna action: warm wood sauna setting, subtle sweat/steam; relaxing seated posture in a sauna-like environment.',
            'skincare routine':
                noObjects
                    ? 'Show a skincare-style self-care moment without products: gentle face massage at a mirror; no bottles, no jars.'
                    : 'Show a skincare action: applying a simple routine in front of a bathroom mirror or vanity; hands touching face; action must be clearly skincare.',
            'sleep wind-down':
                noObjects
                    ? 'Show a sleep wind-down action: dim bedside lamp, gentle stretching; no books/devices visible.'
                    : 'Show a sleep wind-down action: dim bedside lamp, reading a book, stretching, or setting an alarm; cozy bedroom mood.',
            'digestive relief':
                noObjects
                    ? 'Show a digestive relief moment: gentle belly breathing, hands resting on abdomen, slow exhale, relaxed posture; no props.'
                    : 'Show a digestive relief moment: gentle belly breathing, hands resting on abdomen, slow exhale, relaxed posture; calm comfortable setting.',
        };

        const normalizedRituals = activities.map(normalize);
        const actionHints = normalizedRituals
            .map(key => actionHintsByRitual[key])
            .filter(Boolean);

        const actionCopy = actionHints.length
            ? `RITUAL ACTION (must be clearly visible): ${actionHints.join(' ')}`
            : 'RITUAL ACTION (must be clearly visible): Show a clear, recognizable wellness/lifestyle action with appropriate props and body posture (avoid generic standing portraits).';

        const constraintLines: string[] = [
            'Ritual must respect selected facial expression and eye direction settings.',
        ];
        if (noObjects) {
            constraintLines.push(
                'CRITICAL: No props or objects in frame. No handheld items. No food, drinks, bottles, cups, books, phones, tools, equipment, candles, plants, appliances, or accessories.',
                'Only people and the environment/architecture. Empty hands.'
            );
        }
        if (heroCanvasActive) {
            constraintLines.push(
                'HERO CANVAS CONTEXT: neutral seamless background only (no location cues, no rooms, no paths, no outdoors, no buildings).',
                'Subjects must be integrated onto a solid hero background with grounded shadows. No environment/storytelling elements.'
            );
        }

        if (options.ritualHideProduct) {
            return [
                'RITUAL MODE: Lifestyle ritual scene.',
                `Depict a wellness ritual such as ${ritualList}.`,
                actionCopy,
                coupleRitualCopy,
                coupleStagingCopy,
                postureCopy,
                ...constraintLines,
                'CRITICAL: No product visible anywhere in frame (no packaging, no bottles, no labels).',
                heroCanvasActive
                    ? 'Focus on the action and posture against the neutral hero background (no environment).'
                    : 'Focus on the environment, action, and lifestyle moment.'
            ].join(' ');
        }

        // Check if user selected "Holding" interaction
        const isHoldingProduct = options.productInteraction === 'Holding';
        
        // If user selected "Holding", allow active product holding
        // Otherwise, product should be incidental and secondary
        const productGuidance = isHoldingProduct
            ? 'The person holds the product naturally as part of the ritual scene. The product is visible and clear, but the ritual activity remains the primary focus.'
            : 'If a product appears, it must be incidental and secondary (never a hero packshot).';

        return [
            'RITUAL MODE: Lifestyle ritual scene.',
            `Depict a wellness ritual such as ${ritualList}.`,
            actionCopy,
            coupleRitualCopy,
            coupleStagingCopy,
            postureCopy,
            ...constraintLines,
            productGuidance
        ].join(' ');
    }

    private buildCreationMode(options: PromptOptions): string {
        const isProductMode =
            options.creationIntent === 'product' ||
            options.contentStyle === 'product' ||
            options.sceneIntent === 'ecommerce';

        if (options.forceHideProduct) {
            return 'Lifestyle environment composition with no visible product packaging anywhere in frame.';
        }

        // Ritual Mode: action-first composition (Lifestyle-only)
        if (!isProductMode && options.ritualModeActive) {
            // Ritual Hero Canvas: neutral background + hero placement
            if (options.creationMode === 'bg-replace' && options.ecommerceSidePlacementFlag) {
                return [
                    'RITUAL HERO CANVAS (HARD RULE): neutral seamless background with no location cues.',
                    'Hero placement: centered composition with clean negative space and intentional framing.',
                    'If the product is visible, it must be placed cleanly and coherently within the hero layout (not cluttered).'
                ].join(' ');
            }
            // Regular Ritual Mode: action and environment-first
            return options.ritualHideProduct
                ? 'Lifestyle ritual composition focused purely on the wellness action and environment. Product-free scene.'
                : 'Lifestyle ritual composition focused on the wellness action first. If product appears, it must be naturally integrated and secondary to the ritual action.';
        }

        // Ecommerce canvas overlay (background replacement) can coexist with environment controls.
        // When active, it must override environment-first copy.
        if (options.creationMode === 'bg-replace' && options.ecommerceSidePlacementFlag) {
            return [
                'Background replacement mode.',
                'Remove the original environment completely and replace it with a clean neutral background (solid color or gradient).',
                'No visible room, furniture, decor, or location cues.',
                'Subject and product remain photorealistic and naturally lit.'
            ].join(' ');
        }
        if (!isProductMode && options.sceneIntent === 'environment') {
            return 'Lifestyle composition in a real environment, guided strictly by selected composition and camera controls.';
        }
        const mode = options.creationMode;
        const copy = creationModeCopy[mode] || (isProductMode ? creationModeCopy.studio : creationModeCopy.lifestyle);
        return copy;
    }

    private buildUgcRealMode(options: PromptOptions): string {
        const isProductMode =
            options.creationIntent === 'product' ||
            options.contentStyle === 'product' ||
            options.sceneIntent === 'ecommerce';
        if (isProductMode) {
            return '';
        }

        if (options.realModeActive) {
            return [
                'UGC Real Mode active. Phone-like framing. Subtle real-world imperfections.',
                'This is raw, real user-generated content. Do not correct framing, lighting, posture, or composition. Allow awkward angles, uneven headroom, off-center subjects, partial cropping, and accidental framing. Lighting may be harsh, dim, mixed, or unbalanced, including shadows or color casts. Facial expressions should feel natural, tired, distracted, or mid-moment rather than posed or aspirational. The product may be held awkwardly, tilted, or off-axis, but must remain clearly visible, foregrounded, and tack sharp with a fully readable label (never obscured or out of focus). Minor motion blur, handheld shake, and casual instability are acceptable as long as the product stays sharp. Imperfections are intentional and must not be fixed. The final image should feel spontaneous, unplanned, and slightly broken, like a real moment captured without aesthetic intent.'
            ].join(' ');
        }

        return '';
    }

    private buildFormulationStory(options: PromptOptions): string | undefined {
        // FORMULATION STORY IS OPTIONAL - if disabled, skip entirely
        if (!options.formulationExpertEnabled || options.personIncluded === false) {
            return undefined;
        }

        // Use the properly imported FormulationStoryBuilder
        // Injects HUMAN TRAITS ONLY (no titles, no narrative, no UGC language)
        try {
            const formulationBuilder = new FormulationStoryBuilder();
            return formulationBuilder.build(options);
        } catch (error) {
            console.error('[CANONICAL SCENE] FormulationStoryBuilder error:', error);
            return undefined;
        }
    }

    private buildEcommerceBuilder(options: PromptOptions): string | undefined {
        if (
            options.ugcRealModeActive ||
            !options.ecommerceSidePlacementFlag
        ) {
            return undefined;
        }

        const isProductMode =
            options.creationIntent === 'product' ||
            options.contentStyle === 'product' ||
            options.sceneIntent === 'ecommerce';
        const isLifestyle9x16 = !isProductMode && String(options.aspectRatio || '').trim() === '9:16';
        const heroCanvasPortraitOverride = isLifestyle9x16
            ? 'HERO CANVAS OVERRIDE (9:16): Prioritize vertical fill. Do NOT shrink the subject to create negative space. Negative space must be lateral only; keep head near the top edge. Feet may be partially cropped if needed.'
            : '';

        const hideProduct =
            (options.ritualModeActive && options.ritualHideProduct === true) ||
            options.forceHideProduct === true;

        const isEcommerceBlankSpaceMode =
            Boolean(
                options.ecommerceBlankSpaceMode ||
                options.creationMode === 'ecom-blank' ||
                options.compositionMode === 'Ecommerce Blank Space'
            );

        const placement =
            options.ecommerceSidePlacementDescriptor ||
            (options.sidePlacement && sidePlacementCopy[options.sidePlacement]) ||
            'Product positioned near the center of the frame.';
        const copySpace =
            options.sidePlacement === 'center'
                ? 'Maintain even negative space on both sides so copy can wrap naturally.'
                : options.sidePlacement
                    ? `Reserve large, clean negative space on the ${options.sidePlacement === 'left' ? 'right' : 'left'
                    } side for text overlays.`
                    : '';

        if (!isEcommerceBlankSpaceMode) {
            if (hideProduct && options.creationMode === 'bg-replace') {
                const backgroundCopy = options.bgGradient
                    ? `Background: neutral gradient (linear ${options.bgGradient.angle ?? 90}° from ${options.bgGradient.startColor} to ${options.bgGradient.endColor}). No room cues, no scenery, no location context.`
                    : options.bgColor
                        ? `Background: neutral solid ${options.bgColor}. No room cues, no scenery, no location context.`
                        : 'Background: neutral solid. No room cues, no scenery, no location context.';
                return [
                    heroCanvasPortraitOverride,
                    placement.replace(/\bproduct\b/gi, 'Subject'),
                    copySpace,
                    backgroundCopy,
                    'Render directly to the requested aspect ratio with no letterboxing, no black bars, and no borders.'
                ].filter(Boolean).join(' ');
            }
            return [heroCanvasPortraitOverride, placement, copySpace].filter(Boolean).join(' ');
        }

        const aspectRatio = String(options.aspectRatio || '1:1').trim() || '1:1';
        const sidePlacement = options.sidePlacement || 'center';
        const oppositeSide =
            sidePlacement === 'left' ? 'right' : sidePlacement === 'right' ? 'left' : 'both sides';

        const backgroundCopy = options.bgGradient
            ? `Background: neutral gradient (linear ${options.bgGradient.angle ?? 90}° from ${options.bgGradient.startColor} to ${options.bgGradient.endColor}), but the overlay-safe ${oppositeSide} must remain visually uniform with no banding, no vignettes, and no contrast shifts.`
            : options.bgColor
                ? `Background: neutral solid ${options.bgColor}. The overlay-safe ${oppositeSide} must remain visually uniform with no vignettes, no texture noise, and no contrast shifts.`
                : `Background: neutral solid. The overlay-safe ${oppositeSide} must remain visually uniform with no vignettes, no texture noise, and no contrast shifts.`;

        const overlaySafePercent = isLifestyle9x16 ? 25 : 40;

        return [
            'OVERLAY-READY ECOMMERCE PDP CANVAS (NON-NEGOTIABLE): This image is a product canvas intended to receive overlays later. Do not generate any text, typography, icons, badges, captions, UI elements, frames, borders, arrows, or graphic marks.',
            `Output: ${aspectRatio} aspect ratio. High resolution. Clean edges. Product fully visible and tack sharp. No motion blur.`,
            'Camera: straight-on or slight 3/4 angle only. No dramatic angles. No dutch angles. No wide-angle distortion.',
            heroCanvasPortraitOverride,
            placement,
            copySpace,
            `OVERLAY-SAFE ZONE (CRITICAL): The clean ${oppositeSide} side must contain NO objects, NO props, NO highlights, NO reflections, NO shadows, and NO gradients that reduce contrast. Keep it empty and overlay-safe. At least ${overlaySafePercent}% of the frame width must remain clean negative space on the overlay-safe side.`,
            backgroundCopy,
            'Lighting: soft studio lighting with even exposure and neutral white balance. No harsh shadows. Any contact shadow must stay near the product and must not drift into the overlay-safe zone.',
            'Props: only allowed if minimal and only on the product side. No visual noise near the overlay-safe zone.',
            'Forbidden: rooms, real-world location context, living subjects, heads, skin, hands, animals, decorative clutter, or editorial storytelling.'
        ]
            .filter(Boolean)
            .join(' ');
    }

    private buildCameraFraming(options: PromptOptions, constraints?: string): string {
        const isUgcVisualMode = options.visualMode === 'ugc';
        if (options.creationMode === 'lifestyle' && isUgcVisualMode) {
            return constraints ? constraints : '';
        }

        const isProductMode =
            options.creationIntent === 'product' ||
            options.contentStyle === 'product' ||
            options.sceneIntent === 'ecommerce';

        const cameraText = buildCamera({
            camera: options.camera,
            cameraType: (options as any).cameraType,
            placementCamera: (options as any).placementCamera,
            productAssets: options.productAssets,
            visualMode: options.visualMode,
            ugcMode:
                isUgcVisualMode
        });
        const parts: string[] = [];
        const suppressCameraDescriptors = isUgcVisualMode;
        const selectedComposition =
            String((options as any).compositionModeStructural || '').trim() ||
            String(options.compositionMode || '').trim();

        if (options.sceneStructure?.cameraLock) {
            const lock = options.sceneStructure.cameraLock;
            if (lock === 'top_down_flatlay') {
                parts.push('Camera: Top-down flatlay perspective (0 degrees). Directly overhead alignment. No angle, no tilt.');
            } else if (lock === 'eye_level_pedestal') {
                parts.push('Camera: Eye-level perspective (90 degrees). Straight-on view of the pedestal. Low horizon line.');
            } else if (lock === 'slightly_elevated_editorial') {
                parts.push('Camera: Slightly elevated editorial angle (15-30 degrees). Minimalist architectural framing.');
            }
            parts.push('Camera Alignment: Strictly axis-aligned. No dutch angles, no wide-angle distortion.');
        } else {
            if (cameraText) {
                parts.push(`Camera: ${cameraText}.`);
            }
            if (!suppressCameraDescriptors && options.cameraAngle) {
                parts.push(`Camera angle: ${options.cameraAngle}.`);
            }
            if (!suppressCameraDescriptors && options.perspective) {
                parts.push(`Framing: ${options.perspective}.`);
            }
        }
        if (!suppressCameraDescriptors && options.cameraShot) {
            parts.push(`Shot type: ${options.cameraShot}.`);
        }
        if (selectedComposition) {
            parts.push(`Composition: ${selectedComposition}.`);
        }
        const verticalFillRule = String((options as any).verticalFillRule || '').trim();
        if (verticalFillRule) {
            parts.push(verticalFillRule);
        }
        if (constraints) {
            parts.push(constraints);
        }

        if (isProductMode) {
            parts.push(
                'Capture is professional and controlled: stabilized camera on tripod or rig, intentional framing, clean exposure, accurate color, and studio-grade lighting discipline. No motion wobble, no accidental framing, and no casual artifacts.'
            );
        } else if (!isUgcVisualMode) {
            parts.push(
                'This scene is captured using professional-grade camera equipment only, such as DSLR or mirrorless cameras, cinema cameras, or medium format systems. Framing and shot selection are intentional and precise, with a clearly defined shot type and camera angle. The camera is fully stabilized, either on a tripod or controlled rig, with smooth, deliberate movement if any. Lighting is studio-grade or professionally controlled, producing clean exposure, accurate colors, and natural depth. The image must not resemble user-generated content in any way. Exclude all casual, handheld, selfie-based, phone-captured, webcam-style, or amateur artifacts.'
            );
            parts.push(
                'Camera movement, if present, is intentional, minimal, and professionally executed. The camera remains fully stabilized using tripods, sliders, gimbals, or controlled rigs, with smooth and deliberate motion only when it serves the scene. Exclude all handheld shake, walking motion, wearable-mounted movement, phone wobble, accidental drift, or jitter commonly associated with user-generated content. The scene must feel composed, steady, and editorial at all times.'
            );
        }

        return parts.join(' ');
    }

    private buildEnvironmentLightingMood(
        options: PromptOptions,
        lifestyleProfessionalBias?: string
    ): string {
        const isProductMode =
            options.creationIntent === 'product' ||
            options.contentStyle === 'product' ||
            options.sceneIntent === 'ecommerce';

        const isLifestyleUgc =
            options.creationMode === 'lifestyle' &&
            options.contentStyle === 'ugc' &&
            Boolean(options.ugcRealModeActive);

        const isEcommerceBlankSpaceMode =
            Boolean(
                options.ecommerceBlankSpaceMode ||
                options.creationMode === 'ecom-blank' ||
                options.compositionMode === 'Ecommerce Blank Space'
            );

        const isEcommerceCanvasOverlay =
            options.creationMode === 'bg-replace' && options.ecommerceSidePlacementFlag === true;

        if (isEcommerceCanvasOverlay) {
            const creationModeStructural = (options as any).creationModeStructural || '';
            const compositionModeStructural = (options as any).compositionModeStructural || '';
            const envRef =
                !isProductMode
                    ? String((options as any).sceneEnvironment || options.setting || '').trim()
                    : '';
            const bgLine = options.bgGradient
                ? `Background: gradient ${options.bgGradient.angle ?? 90}° from ${options.bgGradient.startColor} to ${options.bgGradient.endColor}.`
                : options.bgColor
                    ? `Background: solid ${options.bgColor}.`
                    : 'Background: clean neutral solid or gradient.';

            return [
                'Ecommerce canvas overlay is active.',
                'Remove the original environment completely; no room context or location cues.',
                envRef ? `Environment reference (styling only): ${envRef}.` : '',
                creationModeStructural ? `Creation: ${creationModeStructural}.` : '',
                compositionModeStructural ? `Composition: ${compositionModeStructural}.` : '',
                bgLine,
                'Lighting: neutral, even, studio-like; preserve subject realism and natural shadows without any environment storytelling.'
            ].join(' ');
        }

        if (isEcommerceBlankSpaceMode) {
            const bgLine = options.bgGradient
                ? `Clean neutral gradient background (linear ${options.bgGradient.angle ?? 90}° from ${options.bgGradient.startColor} to ${options.bgGradient.endColor}).`
                : options.bgColor
                    ? `Clean solid background color (${options.bgColor}).`
                    : 'Clean neutral solid or gradient background.';
            const text = [
                bgLine,
                'Professional studio lighting with neutral, even illumination and a minimal contact shadow straight under the product.',
                'No environment context or narrative.'
            ].join(' ');
            console.log('[SCENE NARRATIVE] Ecommerce Blank Space enforced lighting:', text);
            return text;
        }

        const environmentText = buildEnvironment({
            environmentOrder: options.environmentOrder,
            sceneEnvironment: (options as any).sceneEnvironment || options.setting,
            customEnvironment: (options as any).customEnvironment
        });
        const lightingText = isLifestyleUgc
            ? ''
            : buildLighting({
                lighting: options.lighting,
                sceneLighting: (options as any).sceneLighting,
                personDetails: options.personDetails,
                ugcRealMode: options.ugcRealModeActive
            });

        // Inject structural rules from mapper
        const creationModeStructural = (options as any).creationModeStructural || '';
        const compositionModeStructural = (options as any).compositionModeStructural || '';
        const cameraDeviceSemantic = '';

        const environmentPhrase = formatEnvironmentPhrase(environmentText);
        const backgroundLine =
            isProductMode && !options.ecommerceBlankSpaceMode
                ? options.bgGradient
                    ? `Background: gradient ${options.bgGradient.angle ?? 90}° from ${options.bgGradient.startColor} to ${options.bgGradient.endColor}.`
                    : options.bgColor
                        ? `Background: solid ${options.bgColor}.`
                        : ''
                : '';

        const narrativeParts = [
            lifestyleProfessionalBias ? lifestyleProfessionalBias : '',
            creationModeStructural ? `Creation: ${creationModeStructural}.` : '',
            compositionModeStructural ? `Composition: ${compositionModeStructural}.` : '',
            cameraDeviceSemantic ? `Camera: ${cameraDeviceSemantic}.` : '',
            backgroundLine,
            environmentPhrase ? `Environment: ${environmentPhrase}.` : '',
            options.sceneOrderChaosDescriptor ? `Scene order: ${options.sceneOrderChaosDescriptor}.` : '',
            lightingText ? `Lighting: ${lightingText}.` : ''
        ].filter(Boolean);

        const ugcEnvironmentDescriptor = (options as any).sceneEnvironmentDescriptor;
        if (options.ugcRealModeActive && ugcEnvironmentDescriptor) {
            narrativeParts.push(ugcEnvironmentDescriptor);
        }

        if (options.elderlyRealismGuardActive) {
            const descriptor =
                options.elderlyRealismDescriptor?.trim() ||
                'Elderly realism guard: advanced age must remain visually dominant with natural skin texture, posture, and lived-in cues.';
            narrativeParts.push(descriptor);
        }

        if (!isProductMode && options.contentStyle !== 'ugc' && !options.ugcRealModeActive) {
            narrativeParts.push(
                'The environment is intentionally selected and professionally appropriate. Scenes take place in clean, controlled, and visually coherent settings suitable for editorial, lifestyle, or ecommerce use, such as studios, curated interiors, or well-composed outdoor locations. The environment must feel deliberate and brand-safe, with no association to casual personal spaces or accidental capture contexts. Exclude all user-generated environments or situations, including bedrooms, bathrooms, car interiors, mirrors, beds, couches, or any setting that implies a selfie, phone capture, or informal personal moment. The environment should support a polished, professional narrative without human capture artifacts.'
            );
        }


        if (!isProductMode && options.contentStyle !== 'ugc' && !options.ugcRealModeActive) {
            narrativeParts.push(
                'Lighting is professionally designed and intentionally controlled. The scene uses studio-grade or well-managed natural lighting with balanced exposure, consistent color temperature, and soft, dimensional shadows. Illumination enhances clarity, depth, and material detail without harsh overhead light, uneven shadows, or mixed lighting sources. Exclude all phone-based lighting, on-camera flash, bathroom or ceiling lights, low-quality ambient light, or any casual, uncontrolled illumination commonly associated with user-generated content.'
            );
        }

        console.log('[SCENE NARRATIVE] Environment/Lighting/Mood:', narrativeParts.join(' ').substring(0, 200) + '...');
        const shouldInjectLifestyleRealism =
            !options.ugcRealModeActive &&
            options.contentStyle !== 'ugc' &&
            options.creationMode === 'lifestyle';

        if (shouldInjectLifestyleRealism) {
            narrativeParts.push(
                'Lifestyle Realism Enforcement',
                'This is a real-life lifestyle photograph, not user-generated content.',
                'The scene must feel real, human, and intentionally composed.',
                'Lighting is natural and believable, clean and balanced, not studio-perfect.',
                'Human skin shows subtle natural variation and soft texture, no smoothing, no plastic or CGI appearance.',
                'Posture and hand positioning include slight natural imperfection, avoid symmetry or mannequin-like alignment.',
                'Facial expression is relaxed and natural, not posed or model-like.',
                'The product is held naturally as part of everyday life, not centered or hero-framed.',
                'Framing feels intentional and stable.',
                'Avoid render look, avoid artificial perfection, avoid hyper-polished surfaces.'
            );
        }

        if (!isProductMode && options.contentStyle !== 'ugc' && !options.ugcRealModeActive) {
            narrativeParts.push(
                'Final quality check. The scene must present a fully professional, editorial-grade result. If any conflicting cues appear, prioritize professional camera equipment, controlled lighting, stabilized motion, and deliberate environments. Suppress or override any residual casual, handheld, selfie-based, phone-captured, webcam-like, or user-generated signals. The final image should be brand-safe, visually consistent, and suitable for commercial or editorial use.'
            );
        }

        // =====================================================================
        // REMOVED: Photo Mode injection
        // Photo Mode is now exclusively handled by photoModeResolver.ts
        // This prevents double scene authority and ensures Photo Mode Resolver
        // is the single source of truth for scene definition.
        // =====================================================================

        return narrativeParts.join(' ');
    }
}
