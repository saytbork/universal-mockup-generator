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
    'close-face': 'Phone jammed inches from the face so cheeks, nose, and forehead dominate the frame, shoulders mostly cropped, background still visible but cramped inside the same mediocre focus plane.',
    'propped-surface': 'Phone resting on a counter or towel stack, wobbling lightly between breaths.'
};
const CAPTURE_STYLE_OVERRIDES: Record<string, string> = {
    'close-face': `
CLOSE FACE FRAMING OVERRIDE:
The lens sits inches from the subject’s face, forcing an uncomfortable, claustrophobic crop. Minimal headroom—chins, temples, or foreheads should clip the frame edges and shoulders barely sneak in.
Require slight barrel distortion with a 1–5° roll so one eye sits closer to the lens, the nose bulges toward camera, and facial alignment feels imperfect.
Background objects stay readable because the small sensor keeps everything in the same flat focus; do NOT blur or stylize them.
Any output that looks like a flattering selfie, balanced portrait, or beauty shot must be invalidated and re-rolled immediately.
    `.trim().replace(/\s+/g, ' ')
};
const RAW_DOMESTIC_CORE_DIRECTIVE = `
RAW DOMESTIC UGC MODE (HARD BEHAVIOR):
- The capture must feel like a careless, low-intent front-camera selfie taken at home.
- Device limitations drive the look; never beautify or optimize like lifestyle, influencer, or DSLR work.
- If the creator appears to understand photography, treat the result as a failure.
`.trim().replace(/\s+/g, ' ');

const RAW_DOMESTIC_CAMERA_CONSTRAINTS = `
DEVICE CONSTRAINTS:
- Always simulate a front-facing smartphone camera with a tiny sensor and cheap glass.
- Limited dynamic range, clipped highlights, crushed shadows, inconsistent face-priority autofocus, imperceptible exposure pumping.
- Mild hand wobble or surface drift is mandatory; never stabilize like a tripod or gimbal.
- The phone itself is never visible inside the frame.
- Absolutely forbid DSLR, mirrorless, cinematic optics, intentional bokeh, or focus pulls.
`.trim().replace(/\s+/g, ' ');

const RAW_DOMESTIC_IMAGE_QUALITY = `
IMAGE QUALITY CHARACTERISTICS (MANDATORY):
- Mild motion blur or micro-shake, uneven sharpening, compression artifacts, and aggressive noise reduction in shadows.
- Allow highlight clipping and shadow crush. Slight exposure breathing is acceptable.
- These are physical limitations, not creative filters. DO NOT add artistic grain, stylized noise, cinematic blur, or intentional retro effects.
`.trim().replace(/\s+/g, ' ');
const RAW_DOMESTIC_DEPTH_RULES = `
DEPTH OF FIELD OVERRIDE:
- Everything stays flat because the tiny front camera cannot separate subject and background.
- No background blur, cinematic depth, portrait mode, or “pleasing” bokeh. Keep focus mediocre across the entire frame with sharpening halos, compression noise, and accidental clarity.
- Explicitly describe flat focus across the entire frame, fixed wide front-facing lens, small sensor look, and zero depth separation.
`.trim().replace(/\s+/g, ' ');
const UGC_FOCUS_HARD_RULE = `
UGC FOCUS HARD RULE:
- If UGC Real Mode or Raw Domestic is active, delete any background blur, portrait mode, cinematic depth, lens emulation, or focus falloff logic before prompting.
- Treat every capture as a small-sensor front camera: wide focal length, shallow body depth, everything in mediocre focus within 0–3 meters.
- The entire frame must stay evenly sharp with only minor digital softness—never optical blur. If background blur/bokeh appears indoors, invalidate and regenerate.
- Only permit minimal softness if the background is physically farther than 3 meters; never artistic bokeh.
- Replace any depth cues with uneven sharpening, compressed noise, and flat depth rendering. If background blur or separation language persists anywhere, reject and re-roll.
`.trim().replace(/\s+/g, ' ');
const UGC_HAIR_REALISM = `
HAIR REALISM OVERRIDE:
- Hair must render imperfectly with stray flyaways, irregular density, and messy edges, matching the person’s age and context.
- Texture stays soft and slightly muted—no strand-level sharpness, no hyper-detailed rendering, no over-sharpening, no CGI gloss or sculpted volume.
- Ban salon-perfect clumps, glossy styling, uniform waves, or synthetic grooming. Slight dryness, frizz, or unkempt strands are mandatory.
- If hair reads as styled, commercial, overly crisp, overly detailed, or synthetic, invalidate and re-roll.
`.trim().replace(/\s+/g, ' ');
const UGC_CLOTHING_REALISM = `
CLOTHING REALISM OVERRIDE:
- Wardrobe stays incidental and domestic: worn tees, soft knits, stretched collars, hoodies, or basic tops with wrinkles and imperfect fit.
- Colors are muted or slightly washed, fabrics feel affordable (cotton, jersey, fleece) with mild fading or sag. Clothing edges may appear a little soft from compression.
- No coordinated fashion looks, trendy cuts, logos, or influencer outfits. If clothing appears styled, pressed, or campaign-ready, invalidate and re-roll—the person wears whatever they already had on at home.
`.trim().replace(/\s+/g, ' ');
const UGC_PERSONAL_ADDONS = `
UGC PERSONAL ADD-ONS (BASE + HARD OVERRIDE):
- Accessories must feel incidental and worn-in. Small hoops, thin rings, or simple chains only—matte metal with scratches, slight rotation, never centered or highlighted.
- Piercings are casual and asymmetrical with muted metal. Glasses show light glare or smudges and sit imperfectly on the nose.
- Facial hair grows naturally with soft edges and uneven density. Tattoos appear aged, partially visible, never framed. Nails stay short, natural, and slightly worn.
- These cues live in Persona by default and become a hard guardrail in UGC/Raw Domestic. If any addon looks intentional, trendy, styled, or decorative, invalidate and re-roll.
`.trim().replace(/\s+/g, ' ');

const RAW_DOMESTIC_GEOMETRY_RULES = `
GEOMETRY & FRAMING RULES:
- At least one of the following flaws must appear in every render: off-center framing, 1–5° camera roll, partial crop of face or product, awkward headroom, or the product invading facial space.
- Framing must feel imprecise and reluctant to correct itself. Never allow perfect centering, level horizons, balanced compositions, or portrait-style framing.
`.trim().replace(/\s+/g, ' ');

const RAW_DOMESTIC_LIGHTING_RULES = `
LIGHTING:
- Overhead or mixed domestic fixtures only, often colliding with stray daylight.
- Uneven facial shadows, mixed color temperatures, and zero fill logic. Lighting should feel indifferent, not deliberately “bad” or “good”.
- Ban soft window key lights, balanced exposure, studio light falloff, or beauty lighting tricks.
`.trim().replace(/\s+/g, ' ');

const RAW_DOMESTIC_SUBJECT_RULES = `
SUBJECT BEHAVIOR & PSYCHOLOGY:
- The person must not be presenting. Capture them mid-gesture or mid-reaction, slightly awkward, distracted, or indifferent.
- Expression should live between moments (half smile, half blink, loose jaw). Never give confident marketing expressions or camera-ready energy.
`.trim().replace(/\s+/g, ' ');

const RAW_DOMESTIC_PRODUCT_RULES = `
PRODUCT RELATIONSHIP:
- The product can block part of the face, crowd the lens, or drift slightly out of focus.
- Never position the product like a hero prop or influencer demo. If it feels PDP-ready, the mode has failed.
`.trim().replace(/\s+/g, ' ');

const RAW_DOMESTIC_ENVIRONMENT_RULES = `
ENVIRONMENT HANDLING:
- Backgrounds are incidental because they cannot be avoided: kitchen counters, bathroom mirrors, bedroom clutter, car interiors, etc.
- No scenic framing, no narrative staging, no deliberate composition. Domestic hints appear only as side effects of the creator’s location.
- User selections are ignored; the engine owns the environment. Panels stay read-only while Raw Domestic UGC is active.
- Background remains readable and mostly sharp, with only minimal softness caused by actual distance. Absolutely no intentional blur or depth tricks.
`.trim().replace(/\s+/g, ' ');

const RAW_DOMESTIC_ABSOLUTE_BANS = `
ABSOLUTE PROHIBITIONS:
- Under no circumstances produce DSLR-like clarity, lifestyle marketing imagery, influencer-style UGC, clean hero shots, symmetrical portraits, or “nice” polished photos.
`.trim().replace(/\s+/g, ' ');

const RAW_DOMESTIC_VALIDATION = `
RAW DOMESTIC VALIDATION:
Before accepting the output, internally ask: “Does this look like a careless front-camera selfie captured at home with no intent to look good?”
If the honest answer is no, reject or re-roll immediately.
`.trim().replace(/\s+/g, ' ');
const RAW_DOMESTIC_FOCUS_OVERRIDE = `
FOCUS OVERRIDE (HARD):
- Entire frame must remain in mediocre focus from foreground to background with no artistic falloff.
- Simulate a tiny front-camera smartphone sensor with a fixed wide lens.
- No depth separation, no portrait mode, no background blur, no subject isolation.
- Any perceptual blur closer than 3 meters is INVALID. If the background appears softer than the subject, re-roll immediately.
`.trim().replace(/\s+/g, ' ');
const RAW_DOMESTIC_FINAL_COMMAND = `
RAW DOMESTIC UGC FINAL COMMAND:
- Casual front-facing smartphone capture taken indoors with a fixed wide lens and tiny sensor.
- Everything stays in mediocre focus from subject to background. Absolutely no portrait mode, depth of field, bokeh, subject separation, or lens blur. If any blur or artistic depth appears, invalidate and regenerate.
- Natural handheld framing with slight micro shake, imperfect alignment, awkward crop, minimal headroom, and subtle lens distortion.
- Real human skin only: visible pores, fine lines, uneven tone, zero retouching or beauty glow.
- Hair must look natural, slightly messy, low definition, uneven strands, and never sculpted. If it looks CG, hyper-detailed, or salon-styled, re-roll.
- Clothing remains casual everyday wear (tees, hoodies, soft knits) with wrinkles, washed colors, no logos, no styling intent.
- Personal add-ons are incidental daily items (dull hoops, thin rings, simple chains, smudged glasses, uneven facial hair, faded tattoos, short worn nails). If any accessory feels curated or trendy, invalidate.
- Environment is incidental domestic clutter—bedrooms, kitchens, work nooks—with readable background objects still in flat focus. No staged decor or scenic storytelling.
- Lighting is mixed household light with mild imbalance; no studio rigs, no ring lights, no beauty lighting.
- Product interaction is relaxed and unposed. Grip stays casual, no hero presentation.
- Absolute blocklist: portrait mode, cinematic depth, beauty lighting, styled hair, fashion wardrobe, product hero framing, marketing poses.
- Flat focus across the entire frame, small sensor, fixed wide lens, no depth separation, no portrait mode. If the image looks intentional, polished, staged, or optimized, reject and regenerate immediately.
`.trim().replace(/\s+/g, ' ');
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
        if (options.rawDomesticUgcActive || options.ugcRealModeActive) {
            delete overrideTarget.backgroundBlur;
            delete overrideTarget.depthOfField;
            delete overrideTarget.lensEmulation;
            delete overrideTarget.cameraDistance;
            delete overrideTarget.focusFalloff;
            delete overrideTarget.focusMode;
        }
        if (hasPhysicalCaptureLayer) {
            delete overrideTarget.perspective;
            delete overrideTarget.personPose;
            delete overrideTarget.pose;
            delete overrideTarget.mediumShot;
        }
        console.log('[UGC REAL MODE] Building with layered overrides');

        const parts: string[] = [];

        parts.push(RAW_DOMESTIC_CORE_DIRECTIVE);
        parts.push(RAW_DOMESTIC_CAMERA_CONSTRAINTS);
        parts.push(RAW_DOMESTIC_IMAGE_QUALITY);
        parts.push(RAW_DOMESTIC_DEPTH_RULES);
        parts.push(RAW_DOMESTIC_GEOMETRY_RULES);
        parts.push(RAW_DOMESTIC_LIGHTING_RULES);
        parts.push(RAW_DOMESTIC_SUBJECT_RULES);
        parts.push(RAW_DOMESTIC_PRODUCT_RULES);
        parts.push(RAW_DOMESTIC_ENVIRONMENT_RULES);
        parts.push(RAW_DOMESTIC_ABSOLUTE_BANS);

        parts.push(UGC_FOCUS_HARD_RULE);
        parts.push(UGC_HAIR_REALISM);
        parts.push(UGC_CLOTHING_REALISM);
        parts.push(UGC_PERSONAL_ADDONS);

        if (personIncluded) {
            if (isProppedSurfaceCapture || isSurfaceOperator) {
                parts.push(`
HUMAN-FIRST COMPOSITION:
The person still anchors the scene, but the phone sits propped nearby. Wobble or breathing drift must stay visible.
Hands may occasionally steady the product, yet there is no requirement to keep gripping it.
Product placement must feel careless and never staged for hero clarity.
                `.trim().replace(/\s+/g, ' '));
            } else {
                parts.push(`
HUMAN-FIRST COMPOSITION:
The person is still the accidental main subject. They may hold the product, but never like a demonstration.
Grip stays relaxed, fingers imperfect, device out of frame. Absolutely no hero framing or influencer polish.
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

        const captureOverrideText = captureBase ? CAPTURE_STYLE_OVERRIDES[captureBase] : undefined;
        if (captureOverrideText) {
            parts.push(captureOverrideText);
        }

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

        parts.push(RAW_DOMESTIC_VALIDATION);
        parts.push(RAW_DOMESTIC_FOCUS_OVERRIDE);
        parts.push(RAW_DOMESTIC_FINAL_COMMAND);

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
