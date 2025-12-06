import type { PromptOptions, PromptBuilder } from "../types";
import { parameterMap } from "../parameterMap";

export class ClothingBuilder implements PromptBuilder {
    build(options: PromptOptions): string {
        const {
            clothingReference,
            clothingPreset,
            clothingQuickPreset,
            clothingCustomImage,
            ugcRealityPreset,
        } = options;

        // User uploaded an outfit image
        if (clothingCustomImage || clothingReference) {
            const referenceUrl = clothingCustomImage || clothingReference;
            return `
            The person is wearing the exact outfit shown in the uploaded reference image.
            Match the same color, texture, fabric, silhouette, folds, and overall fit.
            Do not invent or modify clothing elements.
            Clothing reference image URL: ${referenceUrl}
            `.trim().replace(/\s+/g, " ");
        }

        // User selected a preset
        if (clothingPreset && parameterMap.clothingPresets?.[clothingPreset]) {
            return parameterMap.clothingPresets[clothingPreset];
        }

        if (clothingQuickPreset && parameterMap.clothingPresets?.[clothingQuickPreset]) {
            return parameterMap.clothingPresets[clothingQuickPreset];
        }

        if (ugcRealityPreset) {
            return `Using UGC reality preset: ${ugcRealityPreset}`;
        }

        return "";
    }
}
