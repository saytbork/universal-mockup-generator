/**
 * UGC Real Mode Builder
 * Enforces authentic user-generated content rules
 * HIGHEST PRIORITY when ugcRealModeActive === true
 *
 * HARD OVERRIDES:
 * - Human-first composition (person is main subject)
 * - Force lifestyle mode
 * - Block studio/editorial vocabulary
 * - Mandatory product interaction
 */

import type { PromptOptions, PromptBuilder } from '../types';

const ECOM_SIDE_TEXT: Record<string, string> = {
    left: 'Product anchored along the left edge, leaving intentional copy space to the right.',
    center: 'Product centered with equal copy space on both sides.',
    right: 'Product anchored along the right edge, leaving intentional copy space to the left.'
};
const PROPPED_SURFACE_CAPTURE_ID = 'propped-surface';
const SURFACE_OPERATOR_ID = 'surface-staged';
const WALKING_MOTION_ID = 'walking-motion';
const CAPTURE_STYLE_DETAILS: Record<string, string> = {
    'torso-level-handheld': 'Phone held at torso height with a slight downward tilt and relaxed grip.',
    'high-angle': 'Phone lifted overhead looking down across shoulders in a casual selfie tilt.',
    'close-face': 'Phone pushed close to the face so shoulders crop out and the lens feels near skin.',
    'propped-surface': 'Phone resting on a counter or towel stack, wobbling lightly between breaths.'
};
const CAMERA_OPERATOR_DETAILS: Record<string, string> = {
    'self-held': 'Creator holds the phone themselves with fingers visible near the glass.',
    'friend-held': 'Someone else stands nearby holding the phone while the creator interacts.',
    'mirror-shot': 'Mirror reflection shows both the person and the phone partially covering their face.',
    'surface-staged': 'Phone is staged on a shelf or object capturing the scene hands-free.'
};
const BODY_PHONE_DETAILS: Record<string, string> = {
    'arm-extended': 'Arm fully extended forward, product reaching toward the lens, slight shoulder strain.',
    'chest-rest': 'Phone pressed close to chest or collarbone, elbows tucked in tight.',
    'shoulder-peek': 'Phone peeks over a shoulder while the face turns partly away.',
    'tilted-angle': 'Phone twists up or down from a wrist flick, giving an irregular angle.'
};
const MOTION_DETAILS: Record<string, string> = {
    'walking-motion': 'Walking handheld motion with natural bounce in the frame.',
    'hand-shake': 'Subtle hand shake from tired grip or wrist fatigue.',
    'static-drift': 'Mostly stationary but the framing slowly drifts or tilts.',
    'tilt-shift': 'Phone tilts and shifts mid-capture, never fully locked.'
};
const FRAMING_DETAILS: Record<string, string> = {
    'partial-face-cut': 'Top or bottom of the face is cropped at the edge of frame.',
    'off-center': 'Subject leans to one side leaving empty space elsewhere.',
    'finger-lens': 'Holding fingers partially cover the lens creating soft obstructions.',
    'tight-headroom': 'Very little headroom with the scalp pressed against the top border.'
};
const AWKWARD_CONTEXT_DETAILS: Record<string, string> = {
    'bathroom-set': 'Bathroom sink or mirror clutter shows towels, toiletries, or reflections in frame.',
    'car-interior': 'Car interior elements like seatbelts, dashboards, or windshield reflections creep in.',
    'bedroom-corner': 'Bedroom corner clutter with pillows, sheets, or bedside items crowding the shot.',
    'cluttered-desk': 'Messy desk or table with snacks, cables, and packaging encroaching on the frame.'
};

export class UGCRealModeBuilder implements PromptBuilder {
    private injectLayer(parts: string[], label: string, entries?: string[]) {
        if (!entries || entries.length === 0) return;
        entries.forEach(entry => {
            const trimmed = entry?.trim();
            if (trimmed) {
                parts.push(`${label}: ${trimmed}`);
            }
        });
    }

    private assertSingleEntry(label: string, entries?: string[]) {
        if (entries && entries.length > 1) {
            throw new Error(`[UGC REAL MODE] ${label} received multiple selections (${entries.join(', ')}). This layer is single-select only.`);
        }
    }

    private describeLayer(entries: string[] | undefined, detailMap: Record<string, string>): string[] | undefined {
        if (!entries) return entries;
        return entries.map(entry => detailMap[entry] || entry);
    }

    build(options: PromptOptions): string {
        const { ugcRealModeActive, personDetails, personIncluded } = options;

        if (!ugcRealModeActive) {
            return '';
        }

        const layers = options.ugcRealModeLayers ?? {
            captureBase: options.ugcCaptureStyleBase,
            cameraOperator: options.ugcCameraOperator,
            bodyPhonePosition: options.ugcBodyPhonePosition,
            motionStability: options.ugcMotionStability,
            framingImperfections: options.ugcFramingImperfections,
            awkwardContext: options.ugcAwkwardContext
        };

        this.assertSingleEntry('UGC capture style', layers.captureBase);
        this.assertSingleEntry('Camera & operator', layers.cameraOperator);
        this.assertSingleEntry('Body & phone position', layers.bodyPhonePosition);
        this.assertSingleEntry('Motion & stability', layers.motionStability);
        this.assertSingleEntry('Framing imperfections', layers.framingImperfections);
        this.assertSingleEntry('Awkward context', layers.awkwardContext);

        const captureBase = layers.captureBase?.[0];
        const cameraOperator = layers.cameraOperator?.[0];
        const hasPhysicalCaptureLayer = Boolean(captureBase || cameraOperator);
        const isProppedSurfaceCapture = captureBase === PROPPED_SURFACE_CAPTURE_ID;
        const isSurfaceOperator = cameraOperator === SURFACE_OPERATOR_ID;
        const includeHandheldConstraints = hasPhysicalCaptureLayer && !isProppedSurfaceCapture && !isSurfaceOperator;
        const includesWalkingMotion = (layers.motionStability || []).includes(WALKING_MOTION_ID);

        const overrideTarget = options as any;
        if (hasPhysicalCaptureLayer) {
            delete overrideTarget.perspective;
            delete overrideTarget.personPose;
            delete overrideTarget.pose;
            delete overrideTarget.mediumShot;
        }
        console.log('[UGC REAL MODE] Building with layered overrides');

        const parts: string[] = [];

        parts.push(`
UGC REAL MODE OVERRIDE - HIGHEST PRIORITY:
This image must follow authentic user-generated content rules.
Prioritize realism over aesthetics.
Avoid editorial, hero, luxury, studio, or polished compositions.
Natural human imperfections are REQUIRED.
Smartphone-quality aesthetic with computational photography characteristics.
        `.trim().replace(/\s+/g, ' '));

        parts.push(`
UGC HUMAN STATE OVERRIDE:
The person must appear casually present, not performing or posing.
Posture may be slightly slouched, uneven, or asymmetrical.
Body alignment should feel unbalanced or relaxed, not upright or confident.
Hands may look tense, uncertain, or imperfectly positioned.
The person should not look camera-ready or appear to be presenting to the viewer.
        `.trim().replace(/\s+/g, ' '));

        if (personIncluded) {
            if (isProppedSurfaceCapture || isSurfaceOperator) {
                parts.push(`
HUMAN-FIRST COMPOSITION (MANDATORY):
The person still anchors the scene, but the phone may sit propped on a countertop, towel stack, or improvised support.
Hands can reposition or steady the product, yet there is no requirement to keep gripping it.
Allow the product to rest on the same surface or adjacent prop—surface placement is intentional and expected.
Keep the setup grounded in believable household clutter, never a floating or hero-framed product.
                `.trim().replace(/\s+/g, ' '));
            } else {
                parts.push(`
HUMAN-FIRST COMPOSITION (MANDATORY):
The person is the main subject of the image.
Person takes visual priority over product.
Person MUST be holding the product with their hand - natural grip, relaxed fingers.
NO table placement. NO surface placement. NO floating product.
NO hero product framing. NO editorial product showcase.
Frame the scene as if captured by the person or a friend with a smartphone.
                `.trim().replace(/\s+/g, ' '));
            }
        }

        const age = personDetails?.age || 0;
        if (age >= 70) {
            parts.push(`
AGE REALISM OVERRIDE (70+):
The subject's advanced age of ${age} must remain visually dominant even in casual UGC style.
Do NOT beautify, rejuvenate, or smooth skin.
Do NOT use youthful proportions or middle-aged features.
Age-appropriate skin texture, posture, and presence REQUIRED.
Smartphone camera characteristics must adapt to the age, not the opposite.
            `.trim().replace(/\s+/g, ' '));
        }

        if (options.heroPersona || personDetails?.heroPersona) {
            const persona = options.heroPersona || personDetails?.heroPersona;
            parts.push(`
CREATOR PERSONA: ${persona}
            `.trim().replace(/\s+/g, ' '));
        }

        parts.push(`
BLOCKED VOCABULARY (DO NOT USE):
- "hero shot", "hero framing", "product hero"
- "editorial", "editorial lighting", "editorial composition"
- "studio", "studio lighting", "controlled studio"
- "commercial", "advertising", "campaign"
- "luxury", "premium", "high-end" (in composition context)
- "perfectly composed", "precise arrangement"
        `.trim().replace(/\s+/g, ' '));

        parts.push(`
REQUIRED UGC CHARACTERISTICS:
- Authentic, candid, real-world feeling
- Slight imperfections in framing or lighting
- Natural hand positioning (not posed)
- Smartphone-like depth of field
- Real environment (not styled set)
        `.trim().replace(/\s+/g, ' '));

        parts.push(`
SMARTPHONE CAPTURE FAILURE:
Framing stays slightly crooked or off-center with imperfect headroom.
Depth of field feels computational and a little shallow.
Minor focus inconsistencies, autofocus hunting, and subtle motion softness are expected.
No perfect framing, no pristine focus, and no optical lens precision.
        `.trim().replace(/\s+/g, ' '));

        parts.push(`
LIGHTING REALISM:
Lighting must feel accidental and uneven with mixed color temperatures if needed.
No balanced key-fill setup, no studio softness, no commercial exposure.
If the light looks styled or intentional, override it toward imperfect window spill or interior ambient.
        `.trim().replace(/\s+/g, ' '));

        parts.push(`
HOUSEHOLD LIGHTING MANDATE:
Treat lighting like casual home illumination—window daylight colliding with warm kitchen bulbs, creating patchy highlights, falloff, and color shifts. Nothing should look like professional fixtures or studio rigs.
        `.trim().replace(/\s+/g, ' '));

        parts.push(`
CROP + DEPTH OVERRIDE:
Keep the person physically close to the lens, as if the phone were at arm's length. Backgrounds should collapse into soft clutter with barely legible details—no deliberate second plane, no hero environment, no wide depth. Everything beyond the subject can smear, clip, or fall into noise like a real smartphone snapshot.
        `.trim().replace(/\s+/g, ' '));

        if (options.sceneOrderChaosDescriptor) {
            parts.push(`Scene order: ${options.sceneOrderChaosDescriptor}.`);
        }

        if (options.ecommerceSidePlacementFlag) {
            const placementCopy =
                options.ecommerceSidePlacementDescriptor ||
                ECOM_SIDE_TEXT[options.ecommerceSidePlacement || ''] ||
                (options.sidePlacement ? `Product placed to the ${options.sidePlacement} side.` : '');
            if (placementCopy) {
                parts.push(`Ecommerce placement: ${placementCopy}`);
            }
        }

        const captureDescriptions = this.describeLayer(layers.captureBase, CAPTURE_STYLE_DETAILS);
        const operatorDescriptions = this.describeLayer(layers.cameraOperator, CAMERA_OPERATOR_DETAILS);
        const bodyPhoneDescriptions = this.describeLayer(layers.bodyPhonePosition, BODY_PHONE_DETAILS);
        const motionDescriptions = this.describeLayer(layers.motionStability, MOTION_DETAILS);
        const framingDescriptions = this.describeLayer(layers.framingImperfections, FRAMING_DETAILS);
        const awkwardDescriptions = this.describeLayer(layers.awkwardContext, AWKWARD_CONTEXT_DETAILS);

        this.injectLayer(parts, 'UGC capture style', captureDescriptions);
        this.injectLayer(parts, 'Camera & operator', operatorDescriptions);
        this.injectLayer(parts, 'Body & phone position', bodyPhoneDescriptions);
        this.injectLayer(parts, 'Motion & stability', motionDescriptions);
        this.injectLayer(parts, 'Framing imperfections', framingDescriptions);
        this.injectLayer(parts, 'Awkward context', awkwardDescriptions);

        if (hasPhysicalCaptureLayer) {
            parts.push(
                'All camera angle, shot type, framing, and composition rules are invalid. The selected capture layers fully define the geometry of the image.'
            );
        }

        const constraintsText = `
This image is a real smartphone capture.
The phone is held at arm’s length.
The arm holding the phone must never be visible.
The hand holding the product may be visible with a small portion of forearm.
Only one arm may be partially visible, and only to support the product.
`.trim();
        if (includeHandheldConstraints) {
            parts.push(constraintsText);
        } else if (isProppedSurfaceCapture || isSurfaceOperator) {
            parts.push(
                'This is a stationary, surface-supported smartphone capture. The phone remains propped on a counter or leaning object, wobbling slightly between breaths. No human arm enters frame to hold the phone; treat it like a self-timer resting shot.'
            );
        }

        const humanText = `
The person must look like a real human captured by a smartphone.
No mannequin, doll, CGI, avatar, or synthetic appearance.
Natural skin texture is required, soft and even with minimal pore emphasis, gentle tonal variation, and honest asymmetry.
This must not look like a render, stock photo, studio portrait, or AI-generated human.
`.trim();
        parts.push(humanText);

        const humanStateText = `
UGC HUMAN STATE:
The face shows real fatigue and lived-in details such as subtle under-eye bags, soft eye shadows, and natural expression lines around the eyes and mouth.
Expressions feel tired, distracted, or slightly drained instead of posed.
Do NOT exaggerate pores, harsh texture, or macro-style skin detail—keep the skin continuous and smartphone-smooth while the fatigue sells the realism.
        `.trim().replace(/\s+/g, ' ');
        parts.push(humanStateText);

        parts.push(`
FACIAL REALISM RULES:
No perfect smiles, no symmetrical big grins, and no bright promotional expressions.
Expression should sit between emotions—neutral, distracted, tired, or mildly present.
Mouth may be slightly open, uneven, or relaxed.
Eye contact feels incidental or slightly off-axis, never piercing or promotional.
If the person looks happy to be photographed, override and dull the expression.
        `.trim().replace(/\s+/g, ' '));

        parts.push(`
GAZE OVERRIDE:
Eyes may look slightly unfocused, mid-blink, or looking just past the camera.
No locked-on, confident brand-ready eye contact.
Gaze must feel casual, imperfect, and unintentional.
        `.trim().replace(/\s+/g, ' '));

        const smartphoneFailureText = `
SMARTPHONE FAILURE CHARACTERISTICS:
Slight softness from low-resolution capture, minor focus bleed from autofocus hunting, and uneven or mixed lighting are expected.
Framing may be off-center or slightly crooked, with imperfect headroom and in-the-moment composition.
These optical flaws must replace any attempt to add heavy skin texture or polished studio control.
        `.trim().replace(/\s+/g, ' ');
        parts.push(smartphoneFailureText);

        if (age >= 80) {
            parts.push(
                'AGE 80+ LIGHTING OVERRIDE: Turn off any notion of graduated or balanced illumination. Lighting must stay uneven, mixed-temperature, and imperfect so age realism outweighs aesthetic polish.'
            );
        }

        if (age >= 85) {
            parts.push(
                'AGE 85+ GEOMETRY OVERRIDE: Capture stays handheld-only with asymmetrical framing cues. Hair should lean gray/white unless the request explicitly specifies another color, and no balanced/even composition language may appear.'
            );
        }

        parts.push(`
AESTHETIC SUPPRESSION RULE:
If any qualities feel polished, confident, commercial, lifestyle-perfect, stock-photo-like, influencer-ready, or brand-friendly, override them with more awkwardness and imperfection until it feels like a candid personal capture.
        `.trim().replace(/\s+/g, ' '));

        const walkingText = `
Walking, handheld motion is a selfie perspective while walking.
Slight camera instability and imperfect crop.
Smartphone capture with the arm holding the phone remaining completely outside the frame.
`.trim();
        if (includeHandheldConstraints && includesWalkingMotion) {
            parts.push(walkingText);
        }

        if (options.ugcRealModeActive && hasPhysicalCaptureLayer) {
            const prompt = options as any;
            delete prompt.cameraShot;
            delete prompt.cameraAngle;
            delete prompt.framing;
            delete prompt.perspective;
            delete prompt.placementStyle;
            delete prompt.placementCamera;
            delete prompt.proLens;
            delete prompt.proLightingRig;
            delete prompt.proPostTreatment;
            delete prompt.compositionMode;
        }

        const result = parts.filter(Boolean).join(' ').trim();
        console.log('[UGC REAL MODE OUTPUT]', result.substring(0, 200) + '...');
        return result;
    }
}
