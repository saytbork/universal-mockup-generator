/**
 * PromptEngine v2 - Orchestrator
 * ARREGLADO + NORMALIZADO + PRODUCT MODE FIX + CAMERA FIX
 */

import { BaseBuilder } from "./builders/base";
import { ProductBuilder } from "./builders/product";
import { IdentityBuilder } from "./builders/identity";
import { SceneBuilder } from "./builders/scene";
import { ModesBuilder } from "./builders/modes";
import { ClothingBuilder } from "./builders/clothing";
import { SpecialModesBuilder } from "./builders/special";
import { FinalizeBuilder } from "./builders/finalize";
import { parameterMap } from "./parameterMap";
import type { PromptOptions, PromptBuilder } from "./types";

/* ---------------------------------------- */
/* NORMALIZADOR UNIVERSAL */
/* ---------------------------------------- */
function normalizeKey(str = "") {
    return str
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .split(/\s+/)
        .map((word, index) =>
            index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
        )
        .join("");
}

/* ---------------------------------------- */
/* PERSON DETAILS FORMATTER */
/* ---------------------------------------- */
function formatPersonDetails(d: any) {
    if (!d) return "";

    const parts: string[] = [];
    const map: any = parameterMap as any;

    const add = (section: string, value: string) => {
        const key = normalizeKey(value);
        if (map[section]?.[key]) parts.push(map[section][key]);
    };

    // Age fix (Gemini tiende a rejuvenecer)
    if (d.ageGroup) {
        const key = normalizeKey(d.ageGroup);

        if (key === "75") {
            parts.push(
                "an elderly person age 75 to 95 with deep wrinkles, realistic aged skin, gray or white hair, unmistakably old"
            );
        } else {
            add("ageGroup", d.ageGroup);
        }
    }

    add("gender", d.gender);
    add("ethnicity", d.ethnicity);
    add("skinTone", d.skinTone);
    add("hairColor", d.hairColor);
    add("hairStyle", d.hairStyle);
    add("personAppearance", d.personAppearance);
    add("pose", d.personPose);
    add("mood", d.personMood);
    add("expression", d.personExpression);
    add("microLocation", d.microLocation);
    add("interaction", d.productInteraction);
    add("wardrobe", d.wardrobeStyle);
    add("props", d.personProps);

    return parts.filter(Boolean).join(", ");
}

/* ---------------------------------------- */
/* SCENE FORMATTER */
/* ---------------------------------------- */
function formatScene(o: any) {
    if (!o) return "";
    const map: any = parameterMap as any;

    const normalizeAndMap = (section: string, key: string) => {
        const nk = normalizeKey(key);
        return map[section]?.[nk] ?? key;
    };

    return [
        normalizeAndMap("setting", o.setting),
        normalizeAndMap("lighting", o.lighting),
        normalizeAndMap("compositionMode", o.compositionMode),
        normalizeAndMap("cameraType", o.camera),
    ]
        .filter(Boolean)
        .join(", ");
}

/* ---------------------------------------- */
/* CAMERA RULES */
/* ---------------------------------------- */
function cameraRules(options: any) {
    const map: any = parameterMap as any;

    const selfieType = options?.selfieType ?? options?.personDetails?.selfieType;
    const { personIncluded, contentStyle } = options || {};

    const rules: string[] = [];

    /* PRODUCT MODE → NO PERSON */
    if (contentStyle === "product") {
        return "no person visible, focus entirely on product, studio-quality clarity";
    }

    /* NO PERSON */
    if (!personIncluded) {
        return "no human presence";
    }

    /* SELFIE OVERRIDES */
    const selfieOverride = [
        "mirrorselfie",
        "frontcamerapov",
        "backcamerapov",
    ].includes(normalizeKey(selfieType));

    if (!selfieOverride) {
        /* Camera Shot */
        if (options.cameraShot) {
            const key = normalizeKey(options.cameraShot);
            if (map.cameraShot?.[key]) rules.push(map.cameraShot[key]);
        }

        /* Camera Angle */
        if (options.cameraAngle) {
            const key = normalizeKey(options.cameraAngle);
            if (map.cameraAngle?.[key]) rules.push(map.cameraAngle[key]);
        }

        /* Camera Distance */
        if (options.cameraDistance) {
            const key = normalizeKey(options.cameraDistance);
            if (map.cameraDistance?.[key]) rules.push(map.cameraDistance[key]);
        }
    }

    return rules.filter(Boolean).join(", ");
}

/* ---------------------------------------- */
/* NEGATIVE PROMPT */
/* ---------------------------------------- */
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
        "mutated body",
        "cartoon style",
        "text",
        "logo",
        "watermark",
        "ai artifacts",
        "floating objects",
        "cut-off head",
        "cut-off body",
    ].join(", ");
}

/* ---------------------------------------- */
/* PROMPT ENGINE CLASS */
/* ---------------------------------------- */
export class PromptEngine {
    private builders: PromptBuilder[] = [];

    build(options: PromptOptions): string {
        /* PRODUCT MODE → FORZAR SIN PERSONA */
        if (options.contentStyle === "product") {
            options.personIncluded = false;
            options.personDetails = {};
        }

        /* BUILDERS PIPELINE */
        this.builders = [
            new BaseBuilder(),
            ...(options.contentStyle === "lifestyle" ? [new IdentityBuilder()] : []),
            new SceneBuilder(),
            new ProductBuilder(),
            new ModesBuilder(),
            new ClothingBuilder(),
            new SpecialModesBuilder(),
            new FinalizeBuilder(),
        ];

        const productBuilder = this.builders.find(
            (b): b is ProductBuilder => b instanceof ProductBuilder
        );

        const productSection = productBuilder ? productBuilder.build(options) : "";

        /* FINAL PROMPT */
        const finalPrompt = `
Ultra realistic photo, cinematic lighting.

Scene details:
${formatScene(options)}

Camera rules:
${cameraRules(options)}

Person details:
${options.contentStyle === "product"
                ? "no person"
                : options.personIncluded
                    ? formatPersonDetails(options.personDetails)
                    : "no person"
            }

Product details:
${productSection}

Negative prompt:
${negativePrompt()}
`.trim();

        return finalPrompt;
    }
}

export const promptEngine = new PromptEngine();
export { PromptEngine as PromptEngineClass };
export type { PromptOptions } from "./types";
