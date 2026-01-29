/**
 * Selfie Capture Builder - UGC front-camera hard constraints
 */

import type { PromptBuilder, PromptOptions } from '../types';

const UGC_SELFIE_CAPTURE_BLOCK = `
UGC SELFIE CAPTURE (FRONT CAMERA — HARD CONSTRAINT):

Front-facing smartphone camera only (tiny sensor). Flat focus across entire frame; no background blur, no portrait mode blur.
Framing is accidental and imperfect; never level, never centered, never symmetrical.

PROCESSING (ANTI-PRO):
No HDR. No "clarity". No deliberate sharpening. No beauty retouch.
Cheap phone auto-processing only: uneven white balance, slight green/magenta cast, mild motion smear, compression.
Lens artifacts allowed: slight wide-angle barrel distortion, mild rolling-shutter wobble, slight chromatic aberration.
`.trim();

const CLOSE_FACE_SELFIE_BLOCK = `
MODE: UGC SELFIE — FRONT CAMERA
PRIORITY: GEOMETRY + PHYSICAL CONTACT (ABSOLUTE)

This image is a REAL front-camera smartphone selfie.
Not a portrait. Not a posed photo. Not a product demo.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CLOSE-FACE SELFIE (MANDATORY)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Camera distance: 10–20 cm from the face.
The phone is inches from the face.

The FACE dominates the frame.
Face occupies 75–90% of the image.

MANDATORY CROPPING:
At least ONE must be cropped:
- top of forehead
- side of cheek
- bottom of chin

No full head visible.
No shoulders.
No chest.
No torso.
No waist.

If shoulders or torso are visible, the image is INVALID.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CAMERA & OPTICS (LOCKED)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Front-facing smartphone camera ONLY.
Tiny sensor. Cheap optics.

Flat focus across the entire frame.
Everything is equally mediocre in focus.

PROCESSING (ANTI-PRO):
No HDR. No clarity. No deliberate sharpening. No "clean" commercial look.
Uneven white balance, mixed indoor lighting with a slight green cast is allowed.
Minor motion smear and rolling-shutter wobble are allowed (but the product label must remain readable).
Slight wide-angle barrel distortion and mild chromatic aberration are allowed.

Angle is imperfect and human:
- pitch between +6° to +10° OR −6° to −10°
- never level
- never centered
- never symmetrical

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HAND + PRODUCT (CRITICAL PHYSICS)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The product is held CLOSE to the face.
Distance between product and face: less than 5 cm.

ONLY ONE HAND holds the product.
The other hand (phone hand) is NOT visible.

The product is NOT centered.
The product is NOT presented.
The product is NOT symmetrical.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONTACT SHADOW ENFORCEMENT (NON-NEGOTIABLE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Where fingers touch the product, there MUST be:

- dark contact shadows
- occlusion at fingertips
- shadow under finger pads
- compression shadows where skin presses the object

Fingers must visually sink into the object.
No visible air gaps.
No floating fingers.

If fingers appear to float or lack shadow → INVALID IMAGE.

Product must cast:
- a shadow onto the fingers
- AND fingers must cast shadows onto the product

These shadows must be directional and imperfect.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LIGHTING (REAL DOMESTIC ONLY)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Lighting is accidental.
Uneven.
Mixed temperature.
Slight green tint from indoor fixtures is allowed.

NO fill light.
NO beauty light.
NO studio balance.
NO shadowless lighting.

Harsh highlights and ugly shadows are allowed.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ABSOLUTE BLOCKERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BLOCKED:
portrait
medium shot
arm-length selfie
two hands symmetrically holding product
product presentation
product demo
hero shot
editorial
commercial
studio
balanced framing
rule of thirds
centered composition
professional photography
clean shadows
floating objects
perfect hands
perfect skin
cinematic look
premium look
beauty lighting
skin retouch
airbrushed skin
makeup look
hdr
clarity
over-sharpened

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FINAL VALIDATION (FAIL CHECK)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Ask:

“Does this look like a cramped, uncomfortable, badly-framed,
front-camera selfie taken inches from the face,
with ugly shadows and real finger pressure on the object?”

If the answer is NO → REJECT AND REGENERATE.
`.trim();

const SELFIE_POSITION_MODES: Record<string, string> = {
    'torso-level-handheld': `
CAPTURE: Torso-level handheld front-camera selfie. Camera around torso/upper-chest height with slight downward drift. Never centered. Noticeable random tilt/roll (±6–15°). Arm extension implied.
`.trim(),
    'high-angle': `
CAPTURE: Obvious high-angle front-camera selfie. Camera clearly above forehead height angled downward. Headroom awkward; slight head crop allowed. Noticeable random tilt/roll (±6–15°). Arm extension implied.
`.trim(),
    'low-angle': `
CAPTURE: Obvious low-angle front-camera selfie. Camera clearly below face level angled upward. Unflattering under-chin angle is visible. Noticeable random tilt/roll (±6–15°). Arm extension implied.
`.trim(),
    'close-face': `
CAPTURE: Close front-camera selfie. Framing too tight and imperfect; crop forehead/cheek/chin. Phone inches from face. Noticeable random tilt/roll (±6–15°).
`.trim(),
    'propped-surface': `
CAPTURE: Front camera propped on a domestic surface. Slight wobble from breathing; framing drifts. Noticeable random tilt/roll (±6–15°). Feels incidental and unstable.
`.trim()
};

const SELFIE_CAPTURE_BLOCKERS = `
BLOCKED: professional framing, rule of thirds centered, cinematic look, background separation, background blur, hero shots, studio composition.
`.trim();

const SELFIE_IMPERFECTION_LEVEL_RULES: Record<'low' | 'medium' | 'high', string> = {
    low: `
IMPERFECTIONS (LOW): Subtle phone flaws only: mild sensor noise, slight white-balance mismatch, light compression. No HDR/clarity.
`.trim(),
    medium: `
IMPERFECTIONS (MEDIUM): Noticeable phone flaws: JPEG compression blocks, uneven white balance with slight green cast, clipped highlights, crushed shadows, minor motion smear. No HDR/clarity or clean sharpening.
`.trim(),
    high: `
IMPERFECTIONS (HIGH): Strong, ugly phone flaws: heavy compression artifacts, rolling-shutter wobble, fingerprint haze on lens, harsh mixed lighting with a slight green cast, uneven noise reduction. No HDR/clarity or clean sharpening.
`.trim()
};

const SELFIE_PHYSICAL_CONTACT_BLOCK = `
SELFIE PHYSICAL CONTACT (HARD CONSTRAINT):
Product must touch skin. Fingers compress slightly against the product.
Contact shadows MUST exist between fingers and object.
Micro-occlusion at finger contact points.
Product cannot float. Hands cannot be symmetrical or posed.

HANDS (CRITICAL):
The product is held by EXACTLY ONE HAND.
Only the product-holding hand may be visible.
The phone-holding hand MUST NOT appear in frame.
If two hands are visible → INVALID IMAGE.
`.trim();

const CLOSE_FACE_BLOCKERS = `
BLOCKED:
portrait,
medium shot,
arm-length selfie,
two hands symmetrically holding product,
product presentation,
product demo,
hero shot,
editorial,
commercial,
studio,
balanced framing,
rule of thirds,
centered composition,
professional photography,
clean shadows,
floating objects,
perfect hands,
perfect skin,
cinematic look,
premium look
`.trim();

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

const isUgcMode = (options: PromptOptions): boolean => {
    return (
        options.contentStyle === 'ugc' ||
        options.creationIntent === 'ugc' ||
        Boolean(options.ugcRealModeActive) ||
        Boolean(options.rawDomesticUgcActive)
    );
};

export class SelfieCaptureBuilder implements PromptBuilder {
    private getNoticeableAngle(modeId: string): { pitchDeg: number; rollDeg: number } {
        const rand = (min: number, max: number) => min + Math.random() * (max - min);
        const signed = (min: number, max: number) => (Math.random() < 0.5 ? -1 : 1) * rand(min, max);
        const isHighAngle = modeId === 'high-angle';
        const isLowAngle = modeId === 'low-angle';
        const pitchMagnitude = rand(isHighAngle || isLowAngle ? 18 : 6, isHighAngle || isLowAngle ? 35 : 15);
        const pitchSign = isHighAngle ? 1 : isLowAngle ? -1 : (Math.random() < 0.5 ? -1 : 1);
        const pitchDeg = Number((pitchSign * pitchMagnitude).toFixed(1));
        const rollDeg = Number(signed(isHighAngle || isLowAngle ? 8 : 4, isHighAngle || isLowAngle ? 18 : 14).toFixed(1));
        return { pitchDeg, rollDeg };
    }

    private resolveSelfiePositionId(options: PromptOptions): string {
        const captureBase =
            options.ugcRealModeLayers?.captureBase?.[0] ||
            options.ugcCaptureStyleBase?.[0] ||
            '';

        if (captureBase && SELFIE_POSITION_MODES[captureBase]) {
            return captureBase;
        }

        const selfieText =
            options.selfieMode ||
            options.personDetails?.selfieMode ||
            options.personDetails?.selfieType ||
            '';
        const normalized = selfieText.toLowerCase();

        if (normalized.includes('propped') || normalized.includes('table') || normalized.includes('surface')) {
            return 'propped-surface';
        }
        if (normalized.includes('close') || normalized.includes('face') || normalized.includes('tight')) {
            return 'close-face';
        }
        if (normalized.includes('high-angle') || normalized.includes('overhead') || normalized.includes('above') || normalized.includes('angled')) {
            return 'high-angle';
        }
        if (normalized.includes('low-angle') || normalized.includes('from below') || normalized.includes('below') || normalized.includes('bottom-up')) {
            return 'low-angle';
        }
        if (normalized.includes('upper body') || normalized.includes("arm's length") || normalized.includes('arm length') || normalized.includes('torso')) {
            return 'torso-level-handheld';
        }

        return 'torso-level-handheld';
    }

    build(options: PromptOptions): string {
        if (!isUgcMode(options) || !isSelfieActive(options)) {
            return '';
        }

        const overrideTarget = options as any;
        const selectedModeId = this.resolveSelfiePositionId(options);
        const isCloseFace =
            options.ugcCaptureStyleBase?.includes('close-face') ||
            options.ugcRealModeLayers?.captureBase?.includes('close-face') ||
            selectedModeId === 'close-face';
        const selectedMode = SELFIE_POSITION_MODES[selectedModeId] || SELFIE_POSITION_MODES['torso-level-handheld'];
        const { pitchDeg, rollDeg } = this.getNoticeableAngle(selectedModeId);
        const angleDirective = `ANGLE: noticeable random pitch ${pitchDeg}°, roll ${rollDeg}° (never level).`;

        delete overrideTarget.backgroundBlur;
        delete overrideTarget.depthOfField;
        delete overrideTarget.lensEmulation;
        delete overrideTarget.focusFalloff;
        delete overrideTarget.shotType;
        delete overrideTarget.cameraDistance;
        delete overrideTarget.cameraShot;
        delete overrideTarget.cameraAngle;
        delete overrideTarget.perspective;
        delete overrideTarget.framing;
        delete overrideTarget.ruleOfThirds;
        delete overrideTarget.sidePlacement;
        delete overrideTarget.compositionMode;
        delete overrideTarget.compositionModeStructural;
        delete overrideTarget.cameraDeviceSemantic;
        delete overrideTarget.cameraType;
        delete overrideTarget.placementCamera;
        delete overrideTarget.creationModeStructural;
        overrideTarget.allowSceneComposition = false;

        if (isCloseFace) {
            delete overrideTarget.shotType;
            delete overrideTarget.cameraDistance;
            delete overrideTarget.cameraShot;
            delete overrideTarget.cameraAngle;
            delete overrideTarget.perspective;
            delete overrideTarget.framing;
            delete overrideTarget.ruleOfThirds;
            delete overrideTarget.sidePlacement;
            delete overrideTarget.placementStyle;
            delete overrideTarget.productPlane;
            delete overrideTarget.sceneIntent;
            delete overrideTarget.creationMode;
            delete overrideTarget.creationModeStructural;
            delete overrideTarget.compositionMode;
            delete overrideTarget.compositionModeStructural;
            delete overrideTarget.productInteraction;
            overrideTarget.cameraDistance = 'extreme-close';
            overrideTarget.framing = 'forced_crop';
            overrideTarget.allowHeadroom = false;
            overrideTarget.allowTorso = false;
            overrideTarget.allowEnvironmentProminence = false;
            overrideTarget.productInteraction = 'pressed against face with one hand';
            if (options.personDetails) {
                options.personDetails.productInteraction = 'pressed against face with one hand';
            }
            options.ugcRealModeLayers = {
                ...(options.ugcRealModeLayers || {}),
                captureBase: ['close-face'],
            };
            options.ugcCaptureStyleBase = ['close-face'];
            overrideTarget.allowSceneComposition = false;
        }

        if (isCloseFace) {
            const forbiddenTerms = ['medium', 'torso', 'portrait', 'lifestyle', 'rule of thirds'];
            const relevantFields = [
                options.cameraDistance,
                options.cameraShot,
                options.cameraAngle,
                options.perspective,
                options.framing,
                options.personPose,
                options.personDetails?.personPose,
                options.creationMode,
                options.creationIntent
            ];

            const checkString = relevantFields
                .filter(f => typeof f === 'string' && f !== 'ugc_selfie' && f !== 'ugc')
                .join(' ')
                .toLowerCase();

            if (forbiddenTerms.some(term => checkString.includes(term))) {
                const leaked = forbiddenTerms.find(term => checkString.includes(term));
                throw new Error(`[CLOSE_FACE_VIOLATION] Framing leakage detected: "${leaked}" present in photography fields. String: ${checkString}`);
            }

            const imperfectionLevel =
                (options.ugcImperfectionLevel as 'low' | 'medium' | 'high' | undefined) ||
                (options.rawDomesticUgcActive ? 'high' : 'medium');
            return [
                CLOSE_FACE_SELFIE_BLOCK,
                angleDirective,
                SELFIE_IMPERFECTION_LEVEL_RULES[imperfectionLevel],
                CLOSE_FACE_BLOCKERS
            ].join('\n\n').trim();
        }

        const imperfectionLevel =
            (options.ugcImperfectionLevel as 'low' | 'medium' | 'high' | undefined) ||
            (options.rawDomesticUgcActive ? 'high' : 'medium');

        const productInteraction = String(options.personDetails?.productInteraction || '').toLowerCase();
        const hasProductAssets = (options.productAssets?.length || 0) > 0;
        const needsContactBlock = hasProductAssets || productInteraction.includes('hold');

        return [
            UGC_SELFIE_CAPTURE_BLOCK,
            selectedMode,
            angleDirective,
            SELFIE_IMPERFECTION_LEVEL_RULES[imperfectionLevel],
            needsContactBlock ? SELFIE_PHYSICAL_CONTACT_BLOCK : '',
            SELFIE_CAPTURE_BLOCKERS
        ].join('\n\n').trim();
    }
}
