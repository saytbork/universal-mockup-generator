/**
 * Scene Builder - Scene composition and environment
 */

import type { PromptOptions, PromptBuilder } from '../types';
import { parameterMap } from '../parameterMap';

const uniqueParts = (parts: (string | undefined)[]) =>
    Array.from(new Set(parts.filter(Boolean) as string[])).join(", ");

export function buildScene(params: any): string {
    const setting =
        parameterMap.setting?.[params.setting || params.sceneSetting] ??
        params.setting ??
        params.sceneSetting ??
        "";
    const perspective =
        (parameterMap as any).perspective?.[params.perspective || params.scenePerspective] ??
        params.perspective ??
        params.scenePerspective ??
        "";

    // Prevent duplication in mapped styling
    delete params.setting;
    delete params.sceneSetting;
    delete params.perspective;
    delete params.scenePerspective;

    return uniqueParts([setting, perspective]);
}

export class SceneBuilder implements PromptBuilder {
    build(options: PromptOptions): string {
        const {
            isHeroLandingMode,
            setting,
            lighting,
            environmentOrder,
            perspective,
            productPlane,
        } = options;

        // Hero mode has its own scene logic (handled in SpecialModesBuilder)
        if (isHeroLandingMode) {
            return '';
        }

        const cleanSetting = this.cleanText(setting);
        const cleanLighting = this.cleanText(lighting);
        const cleanEnvironment = this.cleanText(environmentOrder);
        const cleanPerspective = this.cleanText(perspective);
        const cleanProductPlane = this.cleanText(productPlane);

        return `
      The scene is a ${cleanSetting}, illuminated by ${cleanLighting}.
      The overall environment has a ${cleanEnvironment} feel.
      The photo is shot from a ${cleanPerspective}, embracing the chosen camera style and its natural characteristics.
      Frame the composition so the product lives in ${cleanProductPlane}.
    `.trim().replace(/\s+/g, ' ');
    }

    private cleanText(text: string): string {
        return text?.trim() || '';
    }
}
