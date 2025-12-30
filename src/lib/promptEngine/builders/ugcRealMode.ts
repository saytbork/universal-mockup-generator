/**
 * UGC Real Mode Builder (OPTIMIZED)
 * Enforces authentic user-generated content rules
 * Consolidated redundant blocks for performance
 */

import type { PromptOptions, PromptBuilder } from '../types';

// ============================================================================
// CONSOLIDATED DEVICE & CAPTURE RULES
// ============================================================================

const UGC_DEVICE_CONTRACT = `
DEVICE: Front-facing smartphone camera only, tiny sensor, cheap glass.
CAPTURE: Flat focus across frame, no depth separation, no bokeh, no blur.
QUALITY: Hand wobble, compression noise, clipped highlights, crushed shadows.
FOCUS: Everything in mediocre focus 0-3m, no artistic falloff.
`.trim().replace(/\s+/g, ' ');

const UGC_COMPOSITION_RULES = `
FRAMING: Off-center, 1-5° camera roll, awkward headroom, partial crop.
POSE: Unposed, distracted, mid-gesture, never rehearsed.
CAPTURE: Imprecise selfie composition, casual low-intent.
`.trim().replace(/\s+/g, ' ');

const UGC_LIGHTING_RULES = `
LIGHTING: Accidental domestic fixtures, mixed color temperatures.
QUALITY: Overexposed areas, crushed shadows, uneven skin tones.
RULE: No correction, no fill, no diffusion.
`.trim().replace(/\s+/g, ' ');

const UGC_APPEARANCE_RULES = `
SKIN: Unfiltered, real texture, pores, minor blemishes, no retouching.
HAIR: Imperfect, stray flyaways, irregular density, no styling.
CLOTHING: Worn, muted, domestic—tees, hoodies, stretched collars.
ACCESSORIES: Incidental, worn-in, matte metals, casual piercings.
`.trim().replace(/\s+/g, ' ');

const UGC_PRODUCT_RULE = `
PRODUCT: Casually held, fingers may cover label, label skewed.
Never hero prop or influencer demo. If PDP-ready, mode has failed.
`.trim().replace(/\s+/g, ' ');

const UGC_ENVIRONMENT_RULE = `
BACKGROUND: Incidental domestic clutter, readable but secondary.
Lower contrast, visually tired, no scenic framing.
Face and product must hold highest local contrast.
`.trim().replace(/\s+/g, ' ');

const UGC_VALIDATION = `
VALIDATION: Does this look like a careless front-camera selfie at home with no intent to look good?
If no, reject immediately.
`.trim().replace(/\s+/g, ' ');

const BLOCKED_VOCABULARY = `
BLOCKED: "hero shot", "editorial", "studio", "commercial", "luxury", "premium", "perfectly composed", "balanced lighting", "soft lighting", "portrait", "showcase".
`.trim().replace(/\s+/g, ' ');

// ============================================================================
// CAPTURE STYLE DETAILS
// ============================================================================

const CAPTURE_STYLE_DETAILS: Record<string, string> = {
    'torso-level-handheld': 'Phone at torso height, slight downward tilt, relaxed grip.',
    'high-angle': 'Phone overhead looking down, casual selfie tilt.',
    'close-face': 'Phone inches from face, cheeks/nose/forehead dominate, cramped.',
    'propped-surface': 'Phone resting on counter, wobbling between breaths.'
};

const CAMERA_OPERATOR_DETAILS: Record<string, string> = {
    'self-held': 'Creator holds phone, fingers near glass.',
    'friend-held': 'Someone else holds phone nearby.',
    'mirror-shot': 'Mirror reflection shows person and phone.',
    'surface-staged': 'Phone staged on shelf, hands-free.'
};

const BODY_PHONE_DETAILS: Record<string, string> = {
    'arm-extended': 'Arm fully extended, product toward lens.',
    'chest-rest': 'Phone pressed to chest, elbows tucked.',
    'shoulder-peek': 'Phone peeks over shoulder, face turns away.',
    'tilted-angle': 'Phone twisted from wrist flick.'
};

const MOTION_DETAILS: Record<string, string> = {
    'walking-motion': 'Walking handheld with natural bounce.',
    'hand-shake': 'Subtle shake from tired grip.',
    'static-drift': 'Mostly stationary, framing drifts.',
    'tilt-shift': 'Phone tilts mid-capture.'
};

const FRAMING_DETAILS: Record<string, string> = {
    'partial-face-cut': 'Face cropped at edge.',
    'off-center': 'Subject leans to one side.',
    'finger-lens': 'Fingers partially cover lens.',
    'tight-headroom': 'Scalp pressed against top border.'
};

const AWKWARD_CONTEXT_DETAILS: Record<string, string> = {
    'bathroom-set': 'Bathroom clutter: towels, toiletries, reflections.',
    'car-interior': 'Car elements: seatbelts, dashboard, reflections.',
    'bedroom-corner': 'Bedroom clutter: pillows, sheets, bedside items.',
    'cluttered-desk': 'Desk mess: snacks, cables, packaging.'
};

// ============================================================================
// BACKGROUND CLUTTER
// ============================================================================

const BACKGROUND_CLUSTERS = [
    { label: 'Bathroom', items: ['toothbrush', 'soap', 'towel', 'razor'] },
    { label: 'Skincare', items: ['moisturizer', 'serum', 'cotton pads'] },
    { label: 'Kitchen', items: ['dish rack', 'mug', 'cereal box'] },
    { label: 'Daily', items: ['keys', 'mail', 'hoodie', 'cables', 'water bottle'] }
];

// ============================================================================
// BUILDER CLASS
// ============================================================================

export class UGCRealModeBuilder implements PromptBuilder {
    private lastClusterLabel?: string;

    private injectLayer(parts: string[], label: string, entries?: string[]) {
        if (!entries?.length) return;
        entries.forEach(entry => {
            const trimmed = entry?.trim();
            if (trimmed) parts.push(`${label}: ${trimmed}`);
        });
    }

    private describeLayer(entries: string[] | undefined, map: Record<string, string>): string[] | undefined {
        if (!entries) return entries;
        return entries.map(e => map[e] || e);
    }

    private getRandomTiltAngle(): number {
        const negative = Math.random() < 0.5;
        const min = negative ? -10 : 6;
        const max = negative ? -6 : 10;
        return Number((min + Math.random() * (max - min)).toFixed(1));
    }

    private pickBackgroundClutter(): string {
        const available = BACKGROUND_CLUSTERS.filter(c => c.label !== this.lastClusterLabel);
        const pool = available.length > 0 ? available : BACKGROUND_CLUSTERS;
        const chosen = pool[Math.floor(Math.random() * pool.length)];
        this.lastClusterLabel = chosen.label;
        const count = 2 + Math.floor(Math.random() * 2);
        const items = [...chosen.items].sort(() => Math.random() - 0.5).slice(0, count);
        return `Background clutter (${chosen.label}): ${items.join(', ')}.`;
    }

    build(options: PromptOptions): string {
        const { ugcRealModeActive, personDetails, personIncluded, rawDomesticUgcActive } = options;

        if (!ugcRealModeActive) return '';

        const layers = options.ugcRealModeLayers ?? {
            captureBase: options.ugcCaptureStyleBase,
            cameraOperator: options.ugcCameraOperator,
            bodyPhonePosition: options.ugcBodyPhonePosition,
            motionStability: options.ugcMotionStability,
            framingImperfections: options.ugcFramingImperfections,
            awkwardContext: options.ugcAwkwardContext
        };

        const captureBase = layers.captureBase?.[0];
        const cameraOperator = layers.cameraOperator?.[0];
        const hasPhysicalCapture = Boolean(captureBase || cameraOperator);
        const isPropped = captureBase === 'propped-surface' || cameraOperator === 'surface-staged';

        // Delete conflicting options
        const overrideTarget = options as any;
        delete overrideTarget.backgroundBlur;
        delete overrideTarget.depthOfField;
        delete overrideTarget.lensEmulation;
        delete overrideTarget.focusFalloff;

        const tiltAngle = this.getRandomTiltAngle();
        const parts: string[] = [];

        // ====================================================================
        // CORE RULES (consolidated)
        // ====================================================================
        parts.push(UGC_DEVICE_CONTRACT);
        parts.push(UGC_COMPOSITION_RULES);
        parts.push(`Camera tilt: ${tiltAngle}° off-level, handheld wobble.`);
        parts.push(UGC_LIGHTING_RULES);
        parts.push(UGC_APPEARANCE_RULES);
        parts.push(UGC_PRODUCT_RULE);
        parts.push(UGC_ENVIRONMENT_RULE);

        // Background clutter
        if (rawDomesticUgcActive) {
            parts.push(this.pickBackgroundClutter());
        }

        // Gender-specific background rules
        const gender = (personDetails?.gender || '').toLowerCase();
        if (gender.includes('male') && !gender.includes('female')) {
            parts.push('Male background: neutral/utilitarian only, no makeup or vanity items.');
        } else if (gender.includes('female')) {
            parts.push('Female background: cosmetic items as incidental clutter only, never staged.');
        }

        // ====================================================================
        // AGE OVERRIDES
        // ====================================================================
        const age = personDetails?.age || 0;
        if (age >= 70) {
            parts.push(`Age ${age} realism: Advanced age must remain visually dominant. No beautification or rejuvenation.`);
        }
        if (age >= 80) {
            parts.push('Age 80+: Uneven lighting, no balanced illumination. Hair gray/white unless specified.');
        }

        // ====================================================================
        // HUMAN COMPOSITION
        // ====================================================================
        if (personIncluded) {
            if (isPropped) {
                parts.push('Human-first: Person anchors scene, phone propped nearby with wobble.');
            } else {
                parts.push('Human-first: Person is accidental main subject, no hero staging.');
            }
        }

        // ====================================================================
        // LAYER INJECTIONS
        // ====================================================================
        this.injectLayer(parts, 'Capture style', this.describeLayer(layers.captureBase, CAPTURE_STYLE_DETAILS));
        this.injectLayer(parts, 'Camera operator', this.describeLayer(layers.cameraOperator, CAMERA_OPERATOR_DETAILS));
        this.injectLayer(parts, 'Body position', this.describeLayer(layers.bodyPhonePosition, BODY_PHONE_DETAILS));
        this.injectLayer(parts, 'Motion', this.describeLayer(layers.motionStability, MOTION_DETAILS));
        this.injectLayer(parts, 'Framing', this.describeLayer(layers.framingImperfections, FRAMING_DETAILS));
        this.injectLayer(parts, 'Context', this.describeLayer(layers.awkwardContext, AWKWARD_CONTEXT_DETAILS));

        // ====================================================================
        // HANDHELD CONSTRAINTS
        // ====================================================================
        if (hasPhysicalCapture && !isPropped) {
            parts.push('Arm holding phone must never be visible. Only product-holding hand may show.');
        } else if (isPropped) {
            parts.push('Stationary surface capture, no human arm enters frame for phone.');
        }

        // Mirror selfie
        if (cameraOperator === 'mirror-shot') {
            parts.push('Mirror selfie: Phone visible in hand, mirror smudges/streaks, overhead lighting.');
        }

        // ====================================================================
        // HUMAN REALISM
        // ====================================================================
        parts.push('Person must look like real smartphone capture of real human. No CGI, mannequin, or synthetic appearance.');
        parts.push('Face shows real fatigue: subtle under-eye bags, natural expression lines, tired or distracted expression.');

        // ====================================================================
        // BLOCKED VOCABULARY & VALIDATION
        // ====================================================================
        parts.push(BLOCKED_VOCABULARY);
        parts.push(UGC_VALIDATION);

        // Ecommerce placement
        if (options.ecommerceSidePlacementFlag && options.ecommerceSidePlacementDescriptor) {
            parts.push(`Ecommerce placement: ${options.ecommerceSidePlacementDescriptor}`);
        }

        // Scene order
        if (options.sceneOrderChaosDescriptor) {
            parts.push(`Scene order: ${options.sceneOrderChaosDescriptor}`);
        }

        // Delete conflicting options when physical capture active
        if (hasPhysicalCapture) {
            const prompt = options as any;
            delete prompt.cameraShot;
            delete prompt.cameraAngle;
            delete prompt.perspective;
            delete prompt.compositionMode;
        }

        const result = parts.filter(Boolean).join(' ').trim();
        console.log('[UGC REAL MODE OUTPUT]', result.substring(0, 200) + '...');
        return result;
    }
}
