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

        const derivedHeightNotes = (() => {
            const parts: string[] = [];
            for (const asset of productAssets as any[]) {
                const label = (asset?.label || asset?.name || asset?.id || 'product') as string;
                const unit = (asset?.heightUnit as 'cm' | 'in' | undefined) ?? 'cm';
                const raw =
                    typeof asset?.heightValue === 'number'
                        ? asset.heightValue
                        : typeof asset?.heightCm === 'number'
                          ? asset.heightCm
                          : undefined;
                if (typeof raw !== 'number' || !Number.isFinite(raw) || raw <= 0) continue;
                const cm = unit === 'in' ? raw * 2.54 : raw;
                const rounded = Math.round(cm * 10) / 10;
                parts.push(`${label} ~${rounded} cm tall`);
            }
            return parts.length ? parts.join('. ') : '';
        })();
        const effectiveHeightNotes = (heightNotes || derivedHeightNotes).trim();

        // Ritual Mode can optionally generate product-free lifestyle images.
        // When enabled, we must not inject any product-related copy.
        if (options.ritualModeActive && options.ritualHideProduct) {
            return '';
        }
        if (options.forceHideProduct) {
            return '';
        }

        // If no product assets are present, avoid referencing an uploaded product.
        if (!Array.isArray(productAssets) || productAssets.length === 0) {
            return '';
        }

        const isEcommerceBlankSpaceMode = options.ecommerceBlankSpaceMode;
        const isEcommerceCanvasOverlay =
            options.creationMode === 'bg-replace' && options.ecommerceSidePlacementFlag === true;

        let prompt = isEcommerceBlankSpaceMode
            ? this.buildEcommerceBlankProductInsertion(options)
            : isEcommerceCanvasOverlay
              ? this.buildEcommerceCanvasProductInsertion(options)
              : this.buildProductInsertion();

        if (effectiveHeightNotes) {
            prompt += ` Respect real-world scale: ${effectiveHeightNotes}.`;
            prompt +=
                ' SCALE LOCK (CRITICAL): Enforce believable hand-to-product proportions. If the product is held, it must fit naturally in adult hands with realistic grip and finger wrap; do not scale it into an oversized jar or giant hero prop.';
            prompt +=
                ' If scale conflicts arise, prioritize the numeric real-world measurement over stylistic composition. Adjust camera distance and framing instead of enlarging the product beyond plausible real-world size.';
        }

        if (isEcommerceBlankSpaceMode) {
            return prompt;
        }

        // Product-first optics lock: the product must never be the blurred element.
        prompt +=
            ' FOCUS PRIORITY: lock focus on the product. The product must be the sharpest object in the frame and the label must be fully readable. Use deep depth of field (f/8–f/11) or focus stacking. Absolutely no portrait mode, bokeh, or shallow depth-of-field that blurs the product (if anything is softer, it must be the background or the face—not the product).';
        prompt +=
            ' SCALE RULE: Keep the product large enough that the label text is readable at a glance. Do not make the product small in the frame; avoid full-body-wide shots that shrink the product.';
        prompt +=
            ' PLACEMENT RULE: Product must be physically closer to the camera than the face/body. Do not place the product behind the person. The face must not occlude the product.';

        const mappedMaterial = productMaterial
            ? parameterMap.productMaterial?.[productMaterial] ?? productMaterial
            : '';
        if (mappedMaterial) {
            prompt += ` Material and finish: ${mappedMaterial}.`;
        }

        if (productAssets.length > 1) {
            prompt += ' There are multiple distinct product cutouts supplied. Arrange every unique product in the final scene, keeping each one fully visible and recognizable while avoiding any invented packaging. Treat them as a cohesive collection in the same frame.';
        } else if (isMultiProductPackaging) {
            prompt += ' This product photo shows a packaging kit that contains several items. Keep the box, lid, and every interior product fully visible—never crop away the inserts or swap them for a single bottle. Preserve the real-world packaging layout exactly as photographed.';
        }

        if (bundleLabels.length > 0) {
            prompt += ` Treat this as a curated bundle featuring ${bundleLabels.join(', ')}. Arrange every uploaded product cutout to mimic that assortment so shoppers immediately read it as a kit.`;
        }

        const structure = options.productStructure || 'single';
        if (structure !== 'single') {
            prompt += ' One product is held naturally in the hand while all remaining products rest on nearby surfaces like tables, counters, shelves, or bags; never place multiple products in one hand nor have multiple hands holding different items.';
        }

        return prompt;
    }

    private buildEcommerceBlankProductInsertion(options: PromptOptions): string {
        const bgLine = options.bgGradient
            ? `Place it on a ${options.bgGradient.angle ?? 90}° gradient background transitioning from ${options.bgGradient.startColor} to ${options.bgGradient.endColor}, with neutral studio lighting and a soft contact shadow.`
            : options.bgColor
              ? `Place it on a pure solid background with the exact color: ${options.bgColor}, with neutral studio lighting, flat even illumination, and only a subtle contact shadow directly beneath the product.`
              : 'Place it on a pure white background with neutral studio lighting, flat even illumination, and only a subtle contact shadow directly beneath the product.';

        return `
      Use the uploaded product asset exactly as provided. Do not redesign, restyle, recolor, or reinterpret its shape, label, or material.
      ${bgLine}
      Focus must prioritize the product: the product and its label are tack sharp, high-clarity, and fully readable. Do not blur the product.
      Preserve the exact proportions, textures, reflections, and printed graphics. Avoid any environmental or storytelling context; maintain the pixel-perfect look of the asset.
    `.trim().replace(/\s+/g, ' ');

    }

    private buildEcommerceCanvasProductInsertion(options: PromptOptions): string {
        const bgLine = options.bgGradient
            ? `Replace the background with a clean gradient background at ${options.bgGradient.angle ?? 90}° from ${options.bgGradient.startColor} to ${options.bgGradient.endColor}.`
            : options.bgColor
              ? `Replace the background with a clean solid background color: ${options.bgColor}.`
              : 'Replace the background with a clean neutral solid or gradient background.';

        return `
      Use the uploaded product image as the exact product. Preserve exact colors, label layout, typography, geometry, proportions, and material.
      Do not redesign, replace, or reinterpret the product.

	      Background replacement (hero canvas overlay):
      Remove the original environment completely.
      ${bgLine}
      No visible room, furniture, decor, or location cues.

      Keep the subject and product photorealistic:
      - preserve natural edge detail and cutout integrity (no halos, no rough masking)
      - generate physically correct contact shadows and micro-occlusion where hands touch the product
      - maintain correct highlights and reflections on the product material
      - keep the product and label tack sharp, in focus, and fully readable (no blur on the product)
    `.trim().replace(/\s+/g, ' ');
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

      Focus: the product is on the primary focus plane and must be tack sharp. The label must be crisp and fully readable. Do not let the product fall out of focus or into the background.
      Typography fidelity: preserve the label artwork and printed text exactly from the reference product. Do not redraw, re-typeset, or re-render the label typography.
      
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
      - HAND CONTACT INTEGRATION: fingers must wrap around the product with realistic grip pressure; subtle skin compression; correct occlusion where fingers overlap the product; realistic contact shadows from fingers onto the product surface,
      - EDGE INTEGRATION: no cutout/halo edges, no sticker-like overlay, no pasted look; match grain/sharpness/noise between product and hand,
      - generate correct reflections on glass, plastic, or metal,
      - preserve the exact design, size, colors, and branding of the uploaded product.
    `.trim().replace(/\s+/g, ' ');
    }
}
