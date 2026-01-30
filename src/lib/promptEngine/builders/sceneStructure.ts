import type { PromptOptions } from '../types';

export class SceneStructureBuilder {
    build(options: PromptOptions): string {
        if (options.contentStyle !== 'product') {
            return '';
        }

        // Product mode integrity requires these sections even when the UI does not provide a
        // full structural system. Provide a safe default so the prompt always includes:
        // - SCENE STRUCTURE
        // - MATERIAL PHYSICS
        // - SCALE RULE
        if (!options.sceneStructure || !options.colorSystem) {
            const aspectRatio = String(options.aspectRatio || '1:1').trim() || '1:1';
            const safeSide = options.sidePlacement === 'left' ? 'right' : options.sidePlacement === 'right' ? 'left' : 'both sides';

            return [
                'SCENE STRUCTURE: Clean ecommerce canvas with a minimal base plane and a seamless neutral background.',
                `Output format: ${aspectRatio} aspect ratio with overlay-safe negative space on ${safeSide}.`,
                'MATERIAL PHYSICS: background is matte neutral paper or painted studio sweep; surface is subtle stone/ceramic only under the product; no busy texture.',
                'SCALE RULE: Product is the single hero subject and must be fully visible with realistic proportions; do not crop the product; do not shrink it into the background.'
            ].join(' ');
        }

        const { structureType, geometry, blockCount, blockScale, layout, edgeStyle, material, scale } = options.sceneStructure;
        const { mode, paletteType, saturation } = options.colorSystem;

        const parts: string[] = [];

        // 1. Structure Type & Geometry (The "Hard" Prompt)
        // FORCE STRUCTURAL DOMINANCE: "Base geometry determines the scene."
        if (structureType === 'geometric_blocks') {
            parts.push(
                'SCENE STRUCTURE: Abstract studio set built from solid geometric blocks.',
                `Multiple ${geometry} blocks of ${blockScale} heights arranged in ${layout} formation.`,
                'Blocks act as physical pedestals and background planes.',
                `${edgeStyle === 'sharp' ? 'Sharp edges' : 'Soft edges'}.`,
                'No curves, no organic shapes, no random props.',
                'Product placed strictly on top of the main block.'
            );
        } else if (structureType === 'editorial_architecture') {
            parts.push(
                'SCENE STRUCTURE: Minimalist editorial architecture set.',
                `${blockCount === 'few' ? 'clean, singular' : 'layered'} architectural elements with ${geometry} forms.`,
                'High-end spatial design, museum-like quality.',
                `${edgeStyle === 'sharp' ? 'Crisp architectural lines' : 'Curved architectural details'}.`,
                'Product integrated as a focal point within the structure.'
            );
        } else if (structureType === 'flat_surface') {
            parts.push(
                'SCENE STRUCTURE: Clean flat-lay surface.',
                'No vertical blocks, no pedestals.',
                'Product rests directly on the infinite plane.',
                'Minimalist composition.'
            );
        }

        // 2. Material System (Physical Properties)
        if (material) {
            const reflectivityMap = {
                low: 'matte finish, light-absorbing, no specular highlights',
                medium: 'satin finish, soft diffuse reflection',
                high: 'glossy finish, sharp reflections, polished surface'
            };

            const diffusionMap = {
                low: 'light is absorbed, shadows are soft and undefined',
                medium: 'light scatters continuously, surface has a soft glow',
                high: 'surface is hard, shadows are sharp and defined'
            };

            // Map diffusion based on material type or reflectivity (inferring for now to avoid breaking types)
            // Ideally we'd add 'diffusion' to the type, but we can infer: 
            // - low reflectivity usually means high diffusion (scattering) or high absorption
            // - high reflectivity usually means low diffusion (sharp)
            const inferredDiffusion = material.reflectivity === 'high' ? 'low' :
                material.reflectivity === 'medium' ? 'medium' : 'high';
            // Wait, low diffusion = sharp shadows? Yes. High diffusion = soft shadows.

            let materialDesc = '';
            switch (material.type) {
                case 'matte_acrylic':
                    materialDesc = 'Solid opaque acrylic, uniform density.';
                    break;
                case 'translucent_acrylic':
                    materialDesc = 'Semi-transparent frosted acrylic, light-diffusing, subsurface scattering.';
                    break;
                case 'resin':
                    materialDesc = 'Dense cast resin, smooth continuous surface.';
                    break;
                case 'natural_stone':
                    materialDesc = 'Honed natural stone, raw mineral texture, heavy weight.';
                    break;
                case 'matte_plastic':
                    materialDesc = 'Industrial matte plastic, slight texture, engineered look.';
                    break;
                case 'foam_composite':
                    materialDesc = 'Dense architectural foam, completely matte, soft touch look.';
                    break;
            }

            parts.push(
                `MATERIAL PHYSICS: blocks are made of ${materialDesc}`,
                `SURFACE PROPERTIES: ${reflectivityMap[material.reflectivity]}.`,
                `LIGHT DIFFUSION: ${diffusionMap[material.reflectivity === 'high' ? 'high' : material.reflectivity === 'medium' ? 'medium' : 'low']}.`,
                // Correction: low reflectivity = light absorbing/scattering (soft shadows) -> "low diffusion" is confusing terminology. 
                // Let's stick to the prompt description directly:
                // High reflectivity -> sharp shadows
                // Low reflectivity -> soft shadows
            );

            // Actually, let's keep it simple and robust as requested:
            const diffusionDesc = material.reflectivity === 'high'
                ? 'Hard surface interaction, sharp contact shadows, no sub-surface scattering'
                : 'Soft light diffusion, ambient occlusion is prominent, shadows are soft';

            parts.push(`LIGHT BEHAVIOR: ${diffusionDesc}.`);
            parts.push('Consistency: All blocks share identical material properties.');
        }

        // 3. Scale System (Relative Proportions)
        if (scale) {
            let scaleRule = '';
            if (scale.type === 'product_dominant') {
                scaleRule = 'SCALE RULE: Product is visually larger than the base. Base acts as a minimal anchor.';
            } else if (scale.type === 'equal') {
                scaleRule = 'SCALE RULE: Product and base elements have equal visual weight. Balanced composition.';
            } else if (scale.type === 'base_dominant') {
                scaleRule = 'SCALE RULE: Architecture is massive compared to product. Product is a jewel in a large space.';
            }

            parts.push(
                scaleRule,
                `Exact Proportions: ${scale.ratio}.`
            );
        }

        // 4. Color System
        if (mode === 'solid_blocks') {
            const satDesc = saturation === 'high' ? 'vibrant, saturated' : saturation === 'low' ? 'muted, pastel' : 'balanced';
            parts.push(
                `Color palette: ${paletteType} tones, ${satDesc}.`,
                'Solid, flat colors with no gradients.',
                'Matte paint finish on all surfaces.'
            );
        } else if (mode === 'neutral_surface') {
            parts.push(
                'Color palette: neutral, monochromatic tones.',
                'Subtle textural variation but uniform color.',
                'Clean, distraction-free environment.'
            );
        }

        return parts.join(' ');
    }
}
