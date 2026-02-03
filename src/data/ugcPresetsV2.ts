/**
 * UGC Real Mode - Preset Data
 * Simple, human, real. No technical language.
 */

export interface UGCWardrobePreset {
    id: string;
    label: string;
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
