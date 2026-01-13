/**
 * Selfie Capture Builder - UGC front-camera hard constraints
 */

import type { PromptBuilder, PromptOptions } from '../types';

const UGC_SELFIE_CAPTURE_BLOCK = `
UGC SELFIE CAPTURE (FRONT CAMERA — HARD CONSTRAINT):

This image must be captured using a front-facing smartphone camera.
One arm is extended holding the phone. The phone itself is NOT visible, but the framing clearly indicates an outstretched arm.

	Camera quality is basic and limited:
	- small front sensor
	- flat depth
	- no background separation
	- no cinematic blur
	- no bokeh
	- no shallow depth of field
	- NO portrait mode blur
	- background must NOT be defocused

Angle must be imperfect and human:
- pitch between +6° to +10° OR −6° to −10°
- never level
- never centered
- never symmetrical

This is a careless, domestic selfie.
The framing feels accidental, slightly awkward, and unplanned.
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
Torso-level handheld
Torso-level handheld selfie.
Camera held at torso height with slight downward drift.
Never centered.
Arm extension implied.
`.trim(),
    'high-angle': `
High-angle vantage
High-angle front camera selfie.
Camera is clearly above forehead height, angled downward across the face and shoulders.
Eyes sit below the horizontal centerline of the frame.
Headroom is awkward and imperfect; slight head crop is allowed.
Awkward tilt is present (never level).
Arm extension implied.
Not a mid shot. No torso framing.
`.trim(),
    'close-face': `
Close face framing
Close front-camera selfie.
Framing is too tight and imperfect.
Crops part of forehead, cheek, or chin.
Feels uncomfortably close.
`.trim(),
    'propped-surface': `
Propped on surface
Front camera propped on a domestic surface.
Subtle wobble from breathing.
Angle is imperfect and slightly tilted.
Feels unstable and incidental.
`.trim()
};

const SELFIE_CAPTURE_BLOCKERS = `
BLOCKED: professional framing, rule of thirds centered, cinematic look, background separation, background blur, hero shots, studio composition.
`.trim();

const SELFIE_IMPERFECTION_LEVEL_RULES: Record<'low' | 'medium' | 'high', string> = {
    low: `
IMPERFECTIONS (LOW): Subtle phone flaws only: mild sensor noise, slight white-balance mismatch, light compression.
`.trim(),
    medium: `
IMPERFECTIONS (MEDIUM): Noticeable phone flaws: JPEG compression blocks, oversharpen halos, uneven white balance, clipped highlights, crushed shadows, minor motion blur.
`.trim(),
    high: `
IMPERFECTIONS (HIGH): Strong, ugly phone flaws: heavy compression artifacts, aggressive oversharpen halos, slight missed autofocus, rolling-shutter wobble, fingerprint haze on lens, harsh mixed lighting.
`.trim()
};

const SELFIE_PHYSICAL_CONTACT_BLOCK = `
SELFIE PHYSICAL CONTACT (HARD CONSTRAINT):
Product must touch skin. Fingers compress slightly against the product.
Contact shadows MUST exist between fingers and object.
Micro-occlusion at finger contact points.
Product cannot float. Hands cannot be symmetrical or posed.
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
            SELFIE_IMPERFECTION_LEVEL_RULES[imperfectionLevel],
            needsContactBlock ? SELFIE_PHYSICAL_CONTACT_BLOCK : '',
            SELFIE_CAPTURE_BLOCKERS
        ].join('\n\n').trim();
    }
}
