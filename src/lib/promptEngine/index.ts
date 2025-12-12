/**
 * PromptEngine v2 - Main Orchestrator
 * Modular, professional, and reliable prompt generation system
 */

import { BaseBuilder } from './builders/base';
import { ProductBuilder } from './builders/product';
import { IdentityBuilder } from './builders/identity';
import { SceneBuilder } from './builders/scene';
import { ModesBuilder } from './builders/modes';
import { ClothingBuilder } from "./builders/clothing";
import { SpecialModesBuilder } from './builders/special';
import { FinalizeBuilder } from './builders/finalize';
import { parameterMap, cameraPresets } from './parameterMap';
import type { PromptOptions, PromptBuilder } from './types';
import type { CameraAngleKey, CameraDistanceKey, CameraMovementKey } from './parameterMap.types';
import { buildMasterPrompt } from './masterPrompt';

function formatPersonDetails(d: any) {
    if (!d) return "";

    const parts: string[] = [];
    const personMap: any = (parameterMap as any).personDetails || {};
    const lookup = (section: string, key: string) =>
        personMap?.[section]?.[key] ?? (parameterMap as any)?.[section]?.[key] ?? key;

    if (d.ageGroup) parts.push(lookup('ageGroup', d.ageGroup));
    if (d.gender) parts.push(lookup('gender', d.gender));
    if (d.ethnicity) parts.push(lookup('ethnicity', d.ethnicity));
    if (d.skinTone) parts.push(lookup('skinTone', d.skinTone));
    if (d.hairColor) parts.push(lookup('hairColor', d.hairColor));
    if (d.hairStyle) parts.push(lookup('hairStyle', d.hairStyle));
    if (d.personAppearance) parts.push(d.personAppearance);
    if (d.personPose) parts.push(lookup('personPose', d.personPose));
    if (d.personMood) parts.push(lookup('personMood', d.personMood));
    if (d.personExpression) parts.push(lookup('personExpression', d.personExpression));
    if (d.microLocation) parts.push(lookup('microLocation', d.microLocation));
    if (d.productInteraction) parts.push(lookup('productInteraction', d.productInteraction));
    if (d.wardrobeStyle) parts.push(lookup('wardrobeStyle', d.wardrobeStyle));
    if (d.personProps) parts.push(lookup('personProps', d.personProps));
    if (d.selfieType) parts.push(lookup('selfieType', d.selfieType));
    if (d.eyeDirection) parts.push((parameterMap as any).eyeDirection?.[d.eyeDirection]);

    return parts.filter(Boolean).join(", ");
}

function formatScene(o: any) {
    if (!o) return "";
    const map: any = parameterMap as any;
    return [
        map.setting?.[o.setting] ?? o.setting,
        map.lighting?.[o.lighting] ?? o.lighting,
        map.perspective?.[o.perspective] ?? o.perspective,
        map.camera?.[o.camera] ?? map.cameraType?.[o.camera] ?? o.camera,
        map.compositionMode?.[o.compositionMode] ?? o.compositionMode,
    ]
        .filter(Boolean)
        .join(", ");
}

function cameraRules(options: any) {
    const selfieType = options?.selfieType ?? options?.personDetails?.selfieType;
    const eyeDirection = options?.eyeDirection ?? options?.personDetails?.eyeDirection;
    const { personIncluded, contentStyle } = options || {};
    const rules: string[] = [];

    if (contentStyle === "product") {
        rules.push("no person visible", "focus on product only");
        return rules.join(", ");
    }

    if (!personIncluded) {
        rules.push("no human presence");
        return rules.join(", ");
    }

    // Selfie logic
    if (selfieType === "mirror_selfie") {
        rules.push(
            "mirror selfie",
            "phone visible in the reflection",
            "frontal framing",
            "shoulders and face visible"
        );
    }

    if (selfieType === "front_camera_selfie") {
        rules.push(
            "selfie from front camera",
            "phone not visible",
            "arm extended",
            "face centered"
        );
    }

    if (selfieType === "one_hand_product_selfie") {
        rules.push(
            "close up of product in hand",
            "phone hidden",
            "focus on hand and product"
        );
    }

    if (selfieType === "hands_only") {
        rules.push(
            "hands only",
            "no face visible",
            "clean framing of hands and product"
        );
    }

    if (selfieType === "back_camera_pov") {
        rules.push(
            "over the shoulder pov",
            "phone slightly visible from behind",
            "face not visible",
            "focus on product subject"
        );
    }

    // Eye direction
    if (eyeDirection) {
        rules.push((parameterMap as any).eyeDirection?.[eyeDirection]);
    }

    return rules.filter(Boolean).join(", ");
}

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

function handAppearanceRules(options: PromptOptions): string {
    if (!options.personIncluded) {
        return "";
    }

    const pose =
        options.personDetails?.personPose ||
        (options as any).personPose ||
        "";
    const normalizedPose = pose.toString().toLowerCase();
    const hideHands =
        normalizedPose.includes("no hand") ||
        normalizedPose.includes("without hands") ||
        normalizedPose.includes("sin manos") ||
        normalizedPose.includes("hands-free") ||
        normalizedPose.includes("hands free") ||
        normalizedPose.includes("hands out of frame") ||
        normalizedPose.includes("hands off frame") ||
        normalizedPose.includes("hands hidden") ||
        normalizedPose.includes("hide hands") ||
        normalizedPose.includes("hands not visible");

    if (hideHands) {
        return "do not show hands, focus only on the product with natural placement.";
    }

    return [
        "render hands with anatomically correct positioning and natural finger alignment",
        "avoid extra fingers, avoid distorted hands, avoid disembodied limbs",
        "clean and realistic grip on the product, correct finger count",
        "no floating fingers, no deformed fingertips",
        "ensure hand is fully connected and natural in the frame"
    ].join(", ") + ".";
}

export class PromptEngine {
    private builders: PromptBuilder[];

    constructor() {
        // Order matters: Base → Identity → Scene → Product → Modes → Special → Finalize
        this.builders = [
            new BaseBuilder(),
            new IdentityBuilder(),
            new SceneBuilder(),
            new ProductBuilder(),
            new ModesBuilder(),
            new ClothingBuilder(),     // <-- ADD HERE
            new SpecialModesBuilder(),
            new FinalizeBuilder(),
        ];
    }

    private applyCameraAngle(parts: string[], key?: CameraAngleKey) {
        if (!key) return;
        const preset =
            parameterMap.cameraAngles?.[key] ||
            cameraPresets.cameraAngles[key]?.prompt;
        if (preset) {
            parts.push(preset);
        }
    }

    private applyCameraMovement(parts: string[], key?: CameraMovementKey) {
        if (!key) return;
        const preset = cameraPresets.cameraMovements[key];
        if (preset?.prompt) {
            parts.push(preset.prompt);
        }
    }

    private applyCameraDistance(parts: string[], key?: CameraDistanceKey) {
        if (!key) return;
        const mapped = parameterMap.cameraDistance?.[key];
        if (mapped) {
            parts.push(mapped);
        }
    }

    /**
     * Build complete prompt from options
     */
    build(options: PromptOptions): string {
        const baseBuilder = this.builders.find(
            (builder): builder is BaseBuilder => builder instanceof BaseBuilder
        );
        const productBuilder = this.builders.find(
            (builder): builder is ProductBuilder => builder instanceof ProductBuilder
        );
        const identityBuilder = this.builders.find(
            (builder): builder is IdentityBuilder => builder instanceof IdentityBuilder
        );
        const modesBuilder = this.builders.find(
            (builder): builder is ModesBuilder => builder instanceof ModesBuilder
        );
        const finalizeBuilder = this.builders.find(
            (builder): builder is FinalizeBuilder => builder instanceof FinalizeBuilder
        );

        const baseSection = baseBuilder ? baseBuilder.build(options) : '';
        const identitySection =
            options.personIncluded && options.contentStyle !== 'product'
                ? (identityBuilder ? identityBuilder.build(options) : '')
                : '';
        const modeSection = modesBuilder ? modesBuilder.build(options) : '';
        const productSection = productBuilder ? productBuilder.build(options) : '';
        const finalizeSection = finalizeBuilder ? finalizeBuilder.build(options) : '';

        const finalPrompt = buildMasterPrompt(
            {
                base: baseSection,
                identity: identitySection,
                mode: modeSection,
                product: productSection,
                finalize: finalizeSection,
                includeIdentity: options.personIncluded && options.contentStyle !== 'product',
            },
            negativePrompt()
        );

        console.log('🚀 PromptEngine v2:', {
            segments: 5,
            length: finalPrompt.length,
            mode: options.creationMode,
        });

        return finalPrompt;
    }

    /**
     * Get individual components for debugging
     */
    getComponents(options: PromptOptions): Record<string, string> {
        return this.builders.reduce((acc, builder) => {
            const name = builder.constructor.name.replace('Builder', '');
            acc[name] = builder.build(options);
            return acc;
        }, {} as Record<string, string>);
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
