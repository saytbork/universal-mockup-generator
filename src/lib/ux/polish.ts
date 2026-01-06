/**
 * UX POLISH — FINAL COPY & VISUAL HIERARCHY
 * 
 * Refined copy that feels agency-level, not configurator-level.
 * "If it feels like a settings page, it's wrong."
 */

// ============================================================================
// CREATIVITY BLOCK — MUST FEEL DOMINANT
// ============================================================================

export const CREATIVITY_UX = {
    // Primary headline (large, bold)
    headline: 'Art Direction',

    // Always visible subtitle (no tooltip needed)
    tagline: 'This is the creative brain.',

    // Extended description (visible on hover or expanded)
    description: 'Defines composition, visual energy, and brand language. Every choice here shapes how your product is perceived.',

    // Visual treatment
    style: {
        weight: 'dominant',
        breathing: 'generous', // More whitespace than other blocks
        border: 'accent',      // Subtle accent color border
        icon: 'brain'          // Conceptual, not literal
    }
};

// ============================================================================
// COMMERCIAL COMPOSITION — BUSINESS DECISION, NOT LAYOUT
// ============================================================================

export const COMPOSITION_UX = {
    headline: 'Commercial Composition',
    tagline: 'How your products tell a story.',

    options: {
        hero_product: {
            label: 'Hero Product',
            copy: 'One product. All attention.',
            subtext: 'Optimized for PDPs and hero banners.'
        },
        duo_offer: {
            label: 'Duo Offer',
            copy: 'Two products. One leads.',
            subtext: 'Built for bundles and cross-sells.'
        },
        routine_system: {
            label: 'Routine System',
            copy: 'A sequence with purpose.',
            subtext: 'Multi-step routines with visual hierarchy.'
        }
    }
};

// ============================================================================
// LIFESTYLE INTENT — DECISION, NOT SETTING
// ============================================================================

export const LIFESTYLE_INTENT_UX = {
    headline: 'Lifestyle Intent',
    tagline: 'What story are you telling?',

    // Always visible footer
    footer: 'This choice shapes realism, human presence, and creative control.',

    options: {
        contextual: {
            label: 'Contextual',
            copy: 'Product in its natural place.',
            subtext: 'Calm, clean, trust-focused. Best for ecommerce.'
        },
        narrative: {
            label: 'Narrative',
            copy: 'Product in action.',
            subtext: 'Story-driven moments. Best for ads and campaigns.'
        },
        pov: {
            label: 'POV Experience',
            copy: 'Through the user\'s eyes.',
            subtext: 'Immersive, emotional. Not for traditional ecommerce.'
        }
    },

    // When creativity is blocked
    creativity_blocked_copy: 'This intent prioritizes authentic capture over art direction.'
};

// ============================================================================
// RAW DOMESTIC UGC — LIMITATION AS FEATURE
// ============================================================================

export const RAW_UGC_UX = {
    headline: 'Raw Domestic UGC',

    // Hero statement (large, confident)
    hero_copy: 'Intentionally unpolished.',

    // Explanation (visible)
    explanation: 'This mode removes professional depth, lighting, and composition to simulate real creator footage.',

    // Promise (key message)
    promise: 'If it looks "too good", it\'s not UGC.',

    // Locked controls message
    locked_message: 'Professional controls are locked to protect authenticity.',

    style: {
        aesthetic: 'casual',
        depth_indicator: 'flat',
        controls_visible: 'minimal'
    }
};

// ============================================================================
// DISABLED STATES — NEVER SAY "DISABLED"
// ============================================================================

export const DISABLED_COPY = {
    // Instead of "Disabled" or "Not allowed"
    creativity_in_ugc: 'UGC captures authenticity. Art direction would break it.',
    creativity_in_pov: 'POV prioritizes first-person realism.',
    hands_in_studio: 'Studio branding focuses solely on product.',
    depth_in_ugc: 'Flat depth protects the smartphone aesthetic.',

    // Generic fallback
    protected: 'This is restricted to protect the intended result.'
};

// ============================================================================
// HANDS / HUMAN — CONSEQUENCE, NOT ASSET
// ============================================================================

export const HANDS_UX = {
    // This should never feel like "hand design"
    label: 'Human Presence',

    // Contextual messaging based on intent
    contextual: {
        visible: true,
        copy: 'Hands may appear naturally.',
        warning: 'If hands attract attention, the image fails.'
    },
    narrative: {
        visible: true,
        copy: 'Hands interact with the product.',
        warning: 'Must feel like a captured moment, not posed.'
    },
    pov: {
        visible: true,
        copy: 'One hand, cropped.',
        warning: 'Imperfections are mandatory.'
    },
    studio: {
        visible: false,
        reason: 'Studio branding excludes human elements.'
    }
};

// ============================================================================
// PRODUCT STUDIO — MUST FEEL PREMIUM
// ============================================================================

export const PRODUCT_STUDIO_UX = {
    // Section header
    headline: 'Product Studio',
    tagline: 'Professional product photography.',

    // Invisible elements (confirmed hidden)
    hidden_elements: [
        'lifestyle_intent',
        'person',
        'interaction',
        'raw_ugc',
        'character_builder'
    ],

    // What user should feel
    perception: {
        primary: 'Control',
        secondary: 'Precision',
        tertiary: 'Premium'
    }
};

// ============================================================================
// TOOLTIP PHILOSOPHY
// ============================================================================

export const TOOLTIP_RULES = {
    // Always explain WHY, not WHAT
    principle: 'Tell them why the rule exists, not just what it does.',

    examples: {
        good: [
            'This is restricted to protect realism.',
            'Art direction is disabled to preserve authenticity.',
            'Hands are excluded to keep focus on product.'
        ],
        bad: [
            'Option disabled.',
            'Not available.',
            'Select a different option.'
        ]
    }
};

// ============================================================================
// QUALITY TEST
// ============================================================================

export const QUALITY_TEST = {
    statement: 'This could be presented by a top agency to a client without explanation.',

    checklist: [
        'Creativity feels like a strategic decision, not a setting',
        'Product Studio feels stronger than Lifestyle',
        'Large decisions come before fine adjustments',
        'No block feels like a technical tweak',
        'UGC limitations feel like features, not bugs'
    ]
};
