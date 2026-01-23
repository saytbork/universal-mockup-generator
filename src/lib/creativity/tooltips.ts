/**
 * TOOLTIP SYSTEM
 * 
 * Comprehensive tooltips for all selectable options.
 * Explains visual impact, when to use, when to avoid.
 * 
 * RULES:
 * - Every option must have a tooltip
 * - Explain visual impact, not technical behavior
 * - Agency-level art direction thinking
 * - No emojis, no hype
 */

import type { SceneType } from '../premiumStudio/schema';
import type { CreativeMode } from './schema';

// ============================================================================
// TOOLTIP STRUCTURE
// ============================================================================

export interface Tooltip {
    title: string;
    description: string;
    whenToUse: string;
    whenToAvoid?: string;
    disabledReason?: string;
}

// ============================================================================
// SCENE TYPE TOOLTIPS
// ============================================================================

export const SCENE_TYPE_TOOLTIPS: Record<SceneType, Tooltip> = {
    studio_branding: {
        title: 'Studio / Branding',
        description: 'Pure product photography with full visual control. No environment, no people, no lifestyle context.',
        whenToUse: 'Hero images, ecommerce listings, brand campaigns, Amazon PDP.',
        whenToAvoid: 'When product needs human context or lifestyle association.'
    },

    editorial_product: {
        title: 'Editorial Product',
        description: 'Magazine-level product photography with artistic styling and curated composition. Abstract or stylized backgrounds.',
        whenToUse: 'Campaign visuals, brand storytelling, lookbooks, launches.',
        whenToAvoid: 'When pure white background ecommerce is required.'
    },

    lifestyle_real: {
        title: 'Lifestyle Real',
        description: 'Product in real-world environment with natural lighting. Authentic domestic or outdoor settings.',
        whenToUse: 'Trust-building content, ecommerce lifestyle shots, social proof.',
        whenToAvoid: 'When clinical or premium brand positioning is priority.'
    },

    ugc_phone: {
        title: 'UGC Phone',
        description: 'User-generated content aesthetic. Smartphone camera quality with authentic imperfections.',
        whenToUse: 'Social ads, TikTok, Meta campaigns, testimonial visuals.',
        whenToAvoid: 'Premium brand positioning or hero placement.'
    },

    bundle_hero: {
        title: 'Bundle / Kit Hero',
        description: 'Multiple products with clear visual hierarchy. Hero product prominent, supporting products visible.',
        whenToUse: 'Homepage upsells, bundle PDPs, kit marketing.',
        whenToAvoid: 'Single product focus or detailed ingredient shots.'
    }
};

// ============================================================================
// CREATIVE MODE TOOLTIPS
// ============================================================================

export const CREATIVE_MODE_TOOLTIPS: Record<CreativeMode, Tooltip> = {
    high_end_studio: {
        title: 'High-End Studio',
        description: 'Luxury studio photography with intentional asymmetry and premium surfaces. Restrained but powerful.',
        whenToUse: 'Luxury brands, premium positioning, hero images, brand campaigns.',
        whenToAvoid: 'Playful brands, youth-oriented products, high-energy campaigns.'
    },

    vibrant_brand_explosion: {
        title: 'Vibrant Brand Explosion',
        description: 'High-energy, color-forward art direction inspired by bold consumer brands like OLLY. Dynamic, playful, expressive.',
        whenToUse: 'When the brand needs to feel playful, memorable, and visually dominant.',
        whenToAvoid: 'Clinical positioning, scientific products, luxury restrained brands.'
    },

    minimal_editorial: {
        title: 'Minimal Editorial',
        description: 'Refined editorial framing with dramatic negative space. Quiet sophistication.',
        whenToUse: 'Skincare hero shots, premium supplements, magazine layouts.',
        whenToAvoid: 'Products that need energy or vibrancy to communicate value.'
    },

    natural_organic: {
        title: 'Natural Organic',
        description: 'Earthy, authentic aesthetic with natural elements and warm materiality. Grounded and calming.',
        whenToUse: 'Organic products, wellness brands, sustainable positioning.',
        whenToAvoid: 'Tech supplements, clinical products, high-energy brands.'
    },

    scientific_clean: {
        title: 'Scientific Clean',
        description: 'Clinical precision with technical credibility. Controlled sterility and symmetry.',
        whenToUse: 'Pharma, clinical products, tech supplements, medical devices.',
        whenToAvoid: 'Lifestyle brands, playful products, natural/organic positioning.'
    },

    lifestyle_cinematic: {
        title: 'Lifestyle Cinematic',
        description: 'Aspirational storytelling with cinematic depth. Environment as atmosphere, not noise.',
        whenToUse: 'Homepage storytelling, about pages, brand films, lifestyle campaigns.',
        whenToAvoid: 'Direct response ads, quick-scroll social content.'
    },

    playful_bold: {
        title: 'Playful Bold',
        description: 'Energetic, approachable aesthetic with confident colors. Dynamic but not overwhelming.',
        whenToUse: 'Youth brands, active lifestyle, social content, email banners.',
        whenToAvoid: 'Luxury positioning, clinical products, refined aesthetics.'
    }
};

// ============================================================================
// ENVIRONMENT TOOLTIPS
// ============================================================================

export const ENVIRONMENT_TOOLTIPS: Record<string, Tooltip> = {
    kitchen: {
        title: 'Kitchen',
        description: 'Everyday domestic setting associated with routine and consumption.',
        whenToUse: 'Supplements, powders, beverages, food-related products.',
        whenToAvoid: 'Skincare or products meant to feel clinical or premium spa.'
    },

    living_room: {
        title: 'Living Room',
        description: 'Relaxed domestic setting for daily wellness and comfort.',
        whenToUse: 'General wellness, relaxation products, daily supplements.',
        whenToAvoid: 'Active/energy products, clinical supplements.'
    },

    bedroom: {
        title: 'Bedroom',
        description: 'Intimate space for rest and personal care.',
        whenToUse: 'Sleep aids, evening routines, intimate skincare.',
        whenToAvoid: 'Energy products, food/beverage, powders.'
    },

    bathroom: {
        title: 'Bathroom',
        description: 'Self-care environment for personal routines.',
        whenToUse: 'Skincare, serums, personal care, morning/evening routines.',
        whenToAvoid: 'Food products, powders, general supplements.'
    },

    workspace: {
        title: 'Workspace',
        description: 'Focus and productivity environment.',
        whenToUse: 'Focus supplements, brain health, productivity enhancers.',
        whenToAvoid: 'Sleep products, evening routines, skincare.'
    },

    home_gym: {
        title: 'Home Gym',
        description: 'Active wellness and fitness environment.',
        whenToUse: 'Pre-workout, protein, active lifestyle products.',
        whenToAvoid: 'Skincare, sleep products, clinical supplements.'
    },

    backyard_patio: {
        title: 'Backyard / Patio',
        description: 'Outdoor wellness and natural lifestyle.',
        whenToUse: 'Beverages, natural products, outdoor lifestyle brands.',
        whenToAvoid: 'Clinical products, pharma positioning.'
    }
};

// ============================================================================
// PRODUCT SCALE TOOLTIPS
// ============================================================================

export const SCALE_TOOLTIPS: Record<string, Tooltip> = {
    small: {
        title: 'Small',
        description: 'Handheld-scale objects such as droppers, serums, or compact bottles.',
        whenToUse: 'When product is meant to feel intimate, precious, or portable.',
        whenToAvoid: 'Bulk products or family-size packaging.'
    },

    medium: {
        title: 'Medium',
        description: 'Standard product scale for most supplements and skincare.',
        whenToUse: 'Default for most products. Balanced framing.',
        whenToAvoid: 'When product is intentionally small/precious or large/bulk.'
    },

    large: {
        title: 'Large',
        description: 'Larger containers, powder jars, or multi-pack products.',
        whenToUse: 'Powders, bulk supplements, family-size products.',
        whenToAvoid: 'Serums, droppers, or products meant to feel precious.'
    }
};

// ============================================================================
// LIGHTING TOOLTIPS
// ============================================================================

export const LIGHTING_TOOLTIPS: Record<string, Tooltip> = {
    natural_light: {
        title: 'Natural Light',
        description: 'Soft, even daylight. Clean and truthful color rendering.',
        whenToUse: 'Default for most product photography. Safe and professional.',
        whenToAvoid: 'Dramatic mood shots or high-energy brand expressions.'
    },

    golden_hour: {
        title: 'Golden Hour',
        description: 'Warm, romantic light with soft highlights. Aspirational feel.',
        whenToUse: 'Lifestyle shots, editorial warmth, wellness brands.',
        whenToAvoid: 'Clinical products, scientific positioning.'
    },

    studio_soft: {
        title: 'Studio Soft',
        description: 'Controlled studio lighting with soft, even illumination.',
        whenToUse: 'Studio branding, ecommerce hero shots, packshots.',
        whenToAvoid: 'Lifestyle authenticity, UGC realism.'
    },

    studio_dramatic: {
        title: 'Studio Dramatic',
        description: 'Bold studio lighting with defined shadows and highlights.',
        whenToUse: 'Premium brand statements, luxury positioning.',
        whenToAvoid: 'Approachable brands, natural/organic positioning.'
    },

    cozy_indoors: {
        title: 'Cozy Indoors',
        description: 'Warm ambient indoor lighting. Inviting and comfortable.',
        whenToUse: 'Lifestyle shots, evening routines, relaxation products.',
        whenToAvoid: 'Energy products, clinical positioning.'
    }
};

// ============================================================================
// DISABLED OPTION REASONS
// ============================================================================

export const DISABLED_REASONS: Record<string, string> = {
    creative_mode_incompatible: 'This creative mode is not compatible with the selected scene type.',
    environment_not_allowed: 'Environment is not available for this scene type. Studio modes use clean backgrounds.',
    hands_forbidden: 'Hands are not available for this scene type or creative mode.',
    ugc_no_creativity: 'UGC mode uses authentic styling only. Creative modes are not applied.',
    bundle_requires_multiple: 'Bundle mode requires at least 2 products.',
    lighting_incompatible: 'This lighting style is not available for the selected scene type.'
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getTooltip(category: string, id: string): Tooltip | null {
    switch (category) {
        case 'sceneType':
            return SCENE_TYPE_TOOLTIPS[id as SceneType] || null;
        case 'creativeMode':
            return CREATIVE_MODE_TOOLTIPS[id as CreativeMode] || null;
        case 'environment':
            return ENVIRONMENT_TOOLTIPS[id] || null;
        case 'scale':
            return SCALE_TOOLTIPS[id] || null;
        case 'lighting':
            return LIGHTING_TOOLTIPS[id] || null;
        default:
            return null;
    }
}

export function getDisabledTooltip(id: string, reason: string): Tooltip {
    const base = getTooltip('creativeMode', id) ||
        getTooltip('environment', id) ||
        { title: id, description: '', whenToUse: '' };

    return {
        ...base,
        disabledReason: DISABLED_REASONS[reason] || 'This option is not available with current settings.'
    };
}
