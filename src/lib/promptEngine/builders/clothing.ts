import type { PromptOptions, PromptBuilder, CustomClothes } from "../types";
import { parameterMap } from "../parameterMap";

function buildClothingSentence(clothes: CustomClothes): string {
    if (!clothes.enabled) {
        return "";
    }
    const garmentType = clothes.garmentType || "";
    const primaryColorRaw = clothes.primaryColor || "";
    const primaryColor = /^#[0-9a-f]{6}$/i.test(primaryColorRaw.trim())
        ? `custom color ${primaryColorRaw.trim().toUpperCase()}`
        : primaryColorRaw;
    const fit = clothes.fit || "";
    const style = clothes.style || "";
    const material = clothes.material || "";
    const customDetail = clothes.customDetail || "";

    const hasContent =
        garmentType ||
        primaryColor ||
        fit ||
        style ||
        material ||
        customDetail;
    if (!hasContent) {
        return "";
    }

    let sentence = "";
    if (garmentType) {
        const descriptorParts = [];
        if (primaryColor) {
            descriptorParts.push(primaryColor);
        }
        if (fit) {
            descriptorParts.push(fit);
        }
        descriptorParts.push(garmentType);
        sentence = `The person is wearing ${descriptorParts.join(" ")}`;
    } else {
        const descriptorParts = [primaryColor, fit, style].filter(Boolean);
        sentence = descriptorParts.length
            ? `The person is wearing ${descriptorParts.join(" ")} clothing`
            : "The person is wearing clothing";
    }

    if (style && garmentType) {
        sentence += ` in a ${style} style`;
    } else if (style && !garmentType) {
        sentence = sentence.replace("clothing", `${style} clothing`);
    }

    if (material) {
        sentence += `, made of ${material}`;
    }

    if (customDetail) {
        sentence += ` Custom detail: ${customDetail}`;
    }

    return sentence.trim();
}

export class ClothingBuilder implements PromptBuilder {
    build(options: PromptOptions): string {
        const { clothingPreset, clothingQuickPreset, customClothes } = options;

        if (customClothes) {
            const customClothesSentence = buildClothingSentence(customClothes);
            if (customClothesSentence) {
                return customClothesSentence;
            }
        }

        if (clothingPreset && parameterMap.clothingPresets?.[clothingPreset]) {
            return parameterMap.clothingPresets[clothingPreset];
        }

        if (clothingQuickPreset && parameterMap.clothingPresets?.[clothingQuickPreset]) {
            return parameterMap.clothingPresets[clothingQuickPreset];
        }

        return "";
    }
}
