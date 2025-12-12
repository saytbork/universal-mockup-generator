/**
 * Product Builder - Product insertion and fidelity
 */

import type { PromptOptions, PromptBuilder } from '../types';
import { parameterMap } from '../parameterMap';

export class ProductBuilder implements PromptBuilder {
    build(options: PromptOptions): string {
        const {
            productAssets = [],
            heightNotes,
            isMultiProductPackaging,
            bundleLabels = [],
            productMaterial,
        } = options;

        let prompt = this.buildProductInsertion();

        const mappedMaterial = productMaterial
            ? parameterMap.productMaterial?.[productMaterial] ?? productMaterial
            : '';
        if (mappedMaterial) {
            prompt += ` Material and finish: ${mappedMaterial}.`;
        }

        if (heightNotes) {
            prompt += ` Respect real-world scale: ${heightNotes}. Adjust hands, props, and camera distance so the item visibly matches that measurement.`;
        }

        if (productAssets.length > 1) {
            prompt += ' There are multiple distinct product cutouts supplied. Arrange every unique product in the final scene, keeping each one fully visible and recognizable while avoiding any invented packaging. Treat them as a cohesive collection in the same frame.';
        } else if (isMultiProductPackaging) {
            prompt += ' This product photo shows a packaging kit that contains several items. Keep the box, lid, and every interior product fully visible—never crop away the inserts or swap them for a single bottle. Preserve the real-world packaging layout exactly as photographed.';
        }

        if (bundleLabels.length > 0) {
            prompt += ` Treat this as a curated bundle featuring ${bundleLabels.join(', ')}. Arrange every uploaded product cutout to mimic that assortment so shoppers immediately read it as a kit.`;
        }

        return prompt;
    }

    private buildProductInsertion(): string {
        return `
      Use the uploaded product image as the exact product to place in the scene.
      Preserve:
      - exact colors,
      - exact label design,
      - exact typography,
      - exact cap shape,
      - exact material,
      - exact geometry,
      - exact proportions.
      
      Do not redesign, replace, or reinterpret the product.
      
      Integrate it physically into the environment using "Active Insert Mode":
      - match lighting to the room,
      - adjust reflections on glass/plastic,
      - add realistic soft shadows on surfaces,
      - maintain physically correct highlights,
      - preserve all printed elements clearly and accurately,
      - keep edges and silhouette identical to the uploaded object.
      
      The product must look naturally photographed inside this environment, not pasted or floating.
      
      Integrate the product physically into the environment:
      - match real lighting direction,
      - match color temperature and contrast,
      - generate accurate shadow casting under the jar/bottle,
      - apply micro-occlusion where the hand touches the product,
      - generate correct reflections on glass, plastic, or metal,
      - preserve the exact design, size, colors, and branding of the uploaded product.
    `.trim().replace(/\s+/g, ' ');
    }
}
