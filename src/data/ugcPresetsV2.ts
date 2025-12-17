/**
 * UGC Real Mode - Preset Data
 * Simple, human, real. No technical language.
 */

export interface UGCWardrobePreset {
    id: string;
    label: string;
    prompt: string;
}

export interface UGCHeroPersona {
    id: string;
    label: string;
    description: string;
    prompt: string;
}

export interface UGCExpression {
    id: string;
    label: string;
    prompt: string;
}

// Wardrobe Quick Presets (Multi-select)
export const UGC_WARDROBE_PRESETS: UGCWardrobePreset[] = [
    {
        id: 'tired-hoodie',
        label: 'Tired hoodie with wrinkles',
        prompt: 'tired hoodie with wrinkles',
    },
    {
        id: 'oversized-sweater',
        label: 'Oversized home sweater',
        prompt: 'oversized home sweater',
    },
    {
        id: 'messy-casual',
        label: 'Messy casual outfit',
        prompt: 'messy casual outfit',
    },
    {
        id: 'loose-tshirt',
        label: 'Loose imperfect t-shirt',
        prompt: 'loose imperfect t-shirt',
    },
    {
        id: 'nomakeup-natural',
        label: 'No-makeup natural home clothes',
        prompt: 'no-makeup natural home clothes',
    },
];

// Hero Personas (Single-select)
export const UGC_HERO_PERSONAS_V2: UGCHeroPersona[] = [
    {
        id: 'calm-wellness-woman-40',
        label: 'Calm, confident wellness woman (40s)',
        description: 'Serene everyday moments with steady breathing, softness, and grounded presence.',
        prompt: 'calm confident wellness woman in her 40s, serene everyday moments with steady breathing, softness, and grounded presence',
    },
    {
        id: 'energetic-senior-male',
        label: 'Energetic senior man',
        description: 'Active, positive senior energy with a sense of vitality and ease.',
        prompt: 'energetic senior man, active positive senior energy with a sense of vitality and ease',
    },
    {
        id: 'tired-sinus-pressure',
        label: 'Tired adult with sinus pressure (before)',
        description: 'Low-energy, uncomfortable state used for “before relief” storytelling.',
        prompt: 'tired adult with sinus pressure, low-energy uncomfortable state used for before relief storytelling',
    },
    {
        id: 'exhausted-stressed',
        label: 'Stressed, exhausted adult (pre-relief)',
        description: 'Overwhelmed, run-down everyday look before feeling better.',
        prompt: 'stressed exhausted adult pre relief, overwhelmed run-down everyday look before feeling better',
    },
    {
        id: 'afrolatina-hair-vitamin',
        label: 'Afro-Latina woman on a personal care journey',
        description: 'Self-care focused moments showing consistency, confidence, and routine.',
        prompt: 'afro-latina woman on a personal care journey, self-care focused moments showing consistency confidence and routine',
    },
    {
        id: 'busy-parent-low-energy',
        label: 'Busy parent with low energy',
        description: 'Real-life fatigue balanced with responsibility, routine, and resilience.',
        prompt: 'busy parent with low energy, real-life fatigue balanced with responsibility routine and resilience',
    },
    {
        id: 'respiratory-discomfort',
        label: 'Everyday adult with physical discomfort',
        description: 'Subtle discomfort reflected through posture, expression, and low energy.',
        prompt: 'everyday adult with physical discomfort, subtle discomfort reflected through posture expression and low energy',
    },
    {
        id: 'relief-moment',
        label: 'Relief moment after support',
        description: 'Calmer, refreshed presence representing an “after” state of comfort and ease.',
        prompt: 'relief moment after support, calmer refreshed presence representing an after state of comfort and ease',
    },
    {
        id: 'ugc-low-energy',
        label: 'Low-energy UGC diary persona',
        description: 'Unfiltered, casual, low-energy look used for authentic day-to-day diary-style UGC.',
        prompt: 'low-energy ugc diary persona, unfiltered casual low-energy look used for authentic day-to-day diary style ugc',
    },
];

// UGC Expressions (Multi-select)
export const UGC_EXPRESSIONS_V2: UGCExpression[] = [
    {
        id: 'tired-eyebags',
        label: 'Tired with eye bags',
        prompt: 'tired with eye bags',
    },
    {
        id: 'emotionally-drained',
        label: 'Emotionally drained',
        prompt: 'emotionally drained',
    },
    {
        id: 'messy-unposed',
        label: 'Messy unposed expression',
        prompt: 'messy unposed expression',
    },
    {
        id: 'stressed-overwhelmed',
        label: 'Stressed overwhelmed face',
        prompt: 'stressed overwhelmed face',
    },
    {
        id: 'distracted-natural',
        label: 'Distracted natural moment',
        prompt: 'distracted natural moment',
    },
    {
        id: 'unfocused-casual',
        label: 'Slightly unfocused casual look',
        prompt: 'slightly unfocused casual look',
    },
    {
        id: 'fatigued-low-energy',
        label: 'Fatigued low-energy expression',
        prompt: 'fatigued low-energy expression',
    },
];
