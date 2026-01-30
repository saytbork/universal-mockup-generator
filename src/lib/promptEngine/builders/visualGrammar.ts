import type { PromptOptions } from '../types';

export class VisualGrammarBuilder {
    build(options: PromptOptions): string {
        // Visual grammar implies intentional composition and is not compatible with
        // UGC/selfie modes where the framing should be accidental and imperfect.
        if (
            options.contentStyle === 'ugc' ||
            options.creationIntent === 'ugc' ||
            Boolean(options.ugcRealModeActive) ||
            Boolean(options.rawDomesticUgcActive) ||
            Boolean(options.ugcSelfieDominant)
        ) {
            return '';
        }

        // Product mode integrity requires this layer even when UI does not provide a full visual grammar system.
        if (!options.visualGrammar) {
            if (options.contentStyle !== 'product') return '';

            const sidePlacement = options.sidePlacement;
            const oppositeSide =
                sidePlacement === 'left' ? 'right' : sidePlacement === 'right' ? 'left' : null;

            const parts: string[] = ['VISUAL GRAMMAR LAYER:'];
            parts.push('Single hero product dominates the frame.');
            parts.push('Negative space is intentional and functional for overlay insertion.');
            if (oppositeSide) {
                parts.push(`Keep the ${oppositeSide} side visually silent and empty.`);
            } else {
                parts.push('Keep both sides visually silent and empty.');
            }
            parts.push('Secondary elements are subordinate and cannot compete with the product.');
            parts.push('Background must be visually silent with no noise, clutter, or distracting texture.');
            return parts.join(' ');
        }

        const {
            visualWeight,
            hierarchyRule,
            rhythm,
            symmetry,
            silenceLevel,
            negativeSpaceRole,
            focalDiscipline
        } = options.visualGrammar;

        const parts: string[] = ['VISUAL GRAMMAR LAYER:'];

        // 1. Visual Weight
        if (visualWeight === 'product-dominant') {
            parts.push('Single hero product dominates the frame.');
        } else if (visualWeight === 'balanced') {
            parts.push('Visual weight is distributed equally between product and environment.');
        } else if (visualWeight === 'environment-support') {
            parts.push('Environment architecture wraps the product, providing substantial visual context.');
        }

        // 2. Hierarchy Rule
        if (hierarchyRule === 'single-hero') {
            parts.push('Secondary elements are visually subordinate and do not compete.');
        } else if (hierarchyRule === 'primary-secondary') {
            parts.push('Clear hierarchy: Product is primary, props are secondary supporters.');
        } else if (hierarchyRule === 'equal-set') {
            parts.push('Ensemble composition where elements act as a cohesive unit.');
        }

        // 3. Rhythm
        if (rhythm === 'static') {
            parts.push('Composition is static, grounded, and immovable.');
        } else if (rhythm === 'modular') {
            parts.push('Elements follow a strict modular grid logic.');
        } else if (rhythm === 'offset') {
            parts.push('Asymmetrical offset arrangement creates dynamic tension.');
        }

        // 4. Symmetry
        if (symmetry === 'strict') {
            parts.push('Perfect mirror symmetry across the central axis.');
        } else if (symmetry === 'soft') {
            parts.push('Visual balance without rigid symmetry.');
        } else if (symmetry === 'none') {
            parts.push('Deliberate asymmetry.');
        }

        // 5. Silence Level
        if (silenceLevel === 'high') {
            parts.push('Background is visually silent with no texture or noise. Pure abstraction.');
        } else if (silenceLevel === 'medium') {
            parts.push('Background has minimal texture, only enough to define space.');
        } else if (silenceLevel === 'low') {
            parts.push('Rich textural context in the background, but controlled.');
        }

        // 6. Negative Space
        if (negativeSpaceRole === 'functional') {
            parts.push('Negative space is intentional and functional for copy insertion.');
        } else if (negativeSpaceRole === 'editorial') {
            parts.push('Wide, generous negative space creates a high-end editorial feel.');
        }

        // 7. Focal Discipline
        if (focalDiscipline === 'locked-center') {
            parts.push('Focal point is locked dead-center.');
        } else if (focalDiscipline === 'rule-of-thirds') {
            parts.push('Focal point aligns strictly with rule of thirds intersections.');
        } else if (focalDiscipline === 'free-but-contained') {
            parts.push('Composition maintains disciplined focal hierarchy despite loose arrangement.');
        }

        return parts.join(' ');
    }
}
