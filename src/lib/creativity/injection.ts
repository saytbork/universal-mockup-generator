/**
 * CREATIVITY PROMPT INJECTION
 * 
 * Injects art direction into prompts WITHOUT breaking v1 determinism.
 * 
 * Injects:
 * - Composition directives
 * - Enrichment rules
 * - Visual energy constraints
 * 
 * MUST NOT:
 * - Change product appearance
 * - Break product safety
 * - Add uncontrolled elements
 */

import type { CreativeMode, CreativeModeConfig } from './schema';
import { CREATIVE_MODES } from './modes';

// ============================================================================
// COMPOSITION DIRECTIVE GENERATION
// ============================================================================

function buildCompositionDirective(config: CreativeModeConfig): string {
    const { composition } = config;
    const parts: string[] = [];

    // Product position
    const positionMap: Record<string, string> = {
        centered: 'Product centered in frame with balanced spacing',
        offset_left: 'Product positioned to the left third, creating visual tension',
        offset_right: 'Product positioned to the right third, allowing negative space',
        rule_of_thirds: 'Product placed at rule-of-thirds intersection for editorial balance',
        diagonal: 'Product on diagonal axis creating dynamic energy',
        bottom_weighted: 'Product weighted toward bottom of frame, grounded composition'
    };
    parts.push(positionMap[composition.productPosition]);

    // Camera bias
    const biasMap: Record<string, string> = {
        perfect_symmetry: 'Perfectly symmetrical framing, clinical precision',
        subtle_asymmetry: 'Subtle asymmetry for luxury balance',
        dynamic_imbalance: 'Dynamic visual imbalance creating movement and energy',
        editorial_tension: 'Editorial tension between product and negative space'
    };
    parts.push(biasMap[composition.cameraBias]);

    // Layering
    const layerMap: Record<string, string> = {
        single_plane: 'Single visual plane, clean and direct',
        foreground_emphasis: 'Strong foreground presence, background recedes',
        depth_layers: 'Multiple depth layers creating visual richness',
        atmospheric_depth: 'Atmospheric depth with environmental storytelling'
    };
    parts.push(layerMap[composition.layering]);

    // Negative space
    const spaceMap: Record<string, string> = {
        minimal: 'Minimal negative space, filled composition',
        balanced: 'Balanced negative space, neither sparse nor crowded',
        generous: 'Generous negative space for premium breathing room',
        dramatic: 'Dramatic negative space as primary design element'
    };
    parts.push(spaceMap[composition.negativeSpace]);

    return `COMPOSITION: ${parts.join('. ')}.`;
}

// ============================================================================
// ENRICHMENT DIRECTIVE GENERATION
// ============================================================================

function buildEnrichmentDirective(config: CreativeModeConfig): string {
    const { enrichment } = config;
    const parts: string[] = [];

    // Allowed elements
    if (enrichment.allowed.length > 0) {
        const allowedDescriptions = enrichment.allowed.map(e => {
            const typeMap: Record<string, string> = {
                texture_surface: 'subtle textured surface',
                material_contrast: 'contrasting material element',
                natural_element: 'natural organic element',
                abstract_graphic: 'abstract graphic shape',
                color_plane: 'bold color plane',
                light_artifact: 'light reflection or artifact',
                shadow_play: 'intentional shadow play'
            };
            const intensityMap: Record<string, string> = {
                subtle: 'barely visible',
                present: 'noticeable but not dominant',
                prominent: 'visually prominent'
            };
            return `${intensityMap[e.intensity]} ${typeMap[e.type]} for ${e.purpose}`;
        });
        parts.push(`Allowed enrichment: ${allowedDescriptions.join('; ')}`);
    }

    // Forbidden
    if (enrichment.forbidden.length > 0) {
        parts.push(`AVOID: ${enrichment.forbidden.join(', ')}`);
    }

    // Max elements
    parts.push(`Maximum ${enrichment.maxElements} enrichment elements`);

    if (enrichment.intentionRequired) {
        parts.push('Every element must have clear purpose');
    }

    return `ENRICHMENT: ${parts.join('. ')}.`;
}

// ============================================================================
// VISUAL ENERGY DIRECTIVE GENERATION
// ============================================================================

function buildEnergyDirective(config: CreativeModeConfig): string {
    const { energy } = config;
    const parts: string[] = [];

    // Chromatic
    const chromaMap: Record<string, string> = {
        muted: 'Muted, restrained color palette',
        natural: 'Natural, true-to-life colors',
        saturated: 'Saturated, rich colors',
        vibrant: 'Vibrant, eye-catching colors',
        explosive: 'Explosive, high-chroma color explosion'
    };
    parts.push(chromaMap[energy.chromatic]);

    // Contrast
    const contrastMap: Record<string, string> = {
        soft: 'Soft contrast, gentle tonal transitions',
        balanced: 'Balanced contrast',
        defined: 'Defined contrast with clear separation',
        dramatic: 'Dramatic contrast, bold light and shadow'
    };
    parts.push(contrastMap[energy.contrast]);

    // Density
    const densityMap: Record<string, string> = {
        minimal: 'Minimal visual density, sparse and clean',
        clean: 'Clean visual density',
        balanced: 'Balanced visual density',
        rich: 'Rich visual density with layered detail',
        layered: 'Layered density with atmospheric elements'
    };
    parts.push(densityMap[energy.density]);

    // Tone
    const toneMap: Record<string, string> = {
        calm: 'Calm, serene emotional tone',
        refined: 'Refined, sophisticated mood',
        confident: 'Confident, assured presence',
        bold: 'Bold, assertive energy',
        playful: 'Playful, joyful expression',
        scientific: 'Scientific, clinical precision',
        premium: 'Premium, luxury feel',
        aspirational: 'Aspirational, desirable lifestyle'
    };
    parts.push(toneMap[energy.tone]);

    return `VISUAL ENERGY: ${parts.join('. ')}.`;
}

// ============================================================================
// BRAND LANGUAGE DIRECTIVE
// ============================================================================

function buildBrandDirective(config: CreativeModeConfig): string {
    const { brand } = config;

    const signalDescriptions: Record<string, string> = {
        luxury: 'luxury brand positioning',
        clean: 'clean, uncluttered aesthetic',
        natural: 'natural, organic authenticity',
        scientific: 'scientific credibility',
        vibrant: 'vibrant brand energy',
        editorial: 'editorial sophistication',
        bold: 'bold brand statement',
        playful: 'playful, approachable character',
        premium: 'premium quality signals',
        approachable: 'approachable, friendly presence'
    };

    const primary = signalDescriptions[brand.primarySignal];
    const secondary = brand.secondarySignals.map(s => signalDescriptions[s]).join(', ');
    const avoid = brand.avoidSignals.map(s => signalDescriptions[s]).join(', ');

    return `BRAND LANGUAGE: Communicate ${primary}. Support with ${secondary}. Avoid ${avoid}.`;
}

// ============================================================================
// MAIN INJECTION FUNCTION
// ============================================================================

export interface CreativityInjection {
    compositionDirective: string;
    enrichmentDirective: string;
    energyDirective: string;
    brandDirective: string;
    fullInjection: string;
}

export function injectCreativity(mode: CreativeMode): CreativityInjection {
    const config = CREATIVE_MODES[mode];

    const compositionDirective = buildCompositionDirective(config);
    const enrichmentDirective = buildEnrichmentDirective(config);
    const energyDirective = buildEnergyDirective(config);
    const brandDirective = buildBrandDirective(config);

    const fullInjection = [
        '',
        '--- ART DIRECTION ---',
        compositionDirective,
        enrichmentDirective,
        energyDirective,
        brandDirective,
        '--- END ART DIRECTION ---'
    ].join('\n');

    return {
        compositionDirective,
        enrichmentDirective,
        energyDirective,
        brandDirective,
        fullInjection
    };
}

// ============================================================================
// UGC SPECIAL CASE (NO CREATIVITY)
// ============================================================================

export function injectUGCCreativity(): CreativityInjection {
    return {
        compositionDirective: 'COMPOSITION: Natural, unposed framing. Authentic smartphone composition.',
        enrichmentDirective: 'ENRICHMENT: No enrichment. Pure realism.',
        energyDirective: 'VISUAL ENERGY: Natural smartphone capture. No stylization.',
        brandDirective: 'BRAND LANGUAGE: Authentic UGC. Do not stylize.',
        fullInjection: '\n--- ART DIRECTION ---\nUGC MODE: No creative enhancement. Pure authentic capture.\n--- END ART DIRECTION ---'
    };
}
