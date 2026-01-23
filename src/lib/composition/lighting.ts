/**
 * LIGHTING / TIME VALIDATION
 * 
 * Time of Day defines physical plausibility.
 * Lighting Style defines quality, not time.
 * 
 * Invalid combinations are silently overridden.
 */

// ============================================================================
// TYPES
// ============================================================================

export type TimeOfDay = 'morning' | 'midday' | 'evening' | 'night';
export type LightingStyle =
    | 'natural_light'
    | 'sunny_day'
    | 'overcast'
    | 'golden_hour'
    | 'mood_lighting'
    | 'cozy_indoors'
    | 'night_mode'
    | 'flash_photo'
    | 'ring_light';

// ============================================================================
// VALID COMBINATIONS
// ============================================================================

export const VALID_LIGHTING: Record<TimeOfDay, LightingStyle[]> = {
    morning: ['natural_light', 'sunny_day', 'overcast'],
    midday: ['sunny_day', 'overcast', 'natural_light'],
    evening: ['golden_hour', 'mood_lighting'],
    night: ['cozy_indoors', 'night_mode', 'flash_photo', 'ring_light']
};

// ============================================================================
// CLOSEST VALID MAPPING
// ============================================================================

const LIGHTING_FALLBACK: Record<TimeOfDay, LightingStyle> = {
    morning: 'natural_light',
    midday: 'natural_light',
    evening: 'golden_hour',
    night: 'cozy_indoors'
};

// ============================================================================
// RESOLUTION
// ============================================================================

export interface LightingInput {
    timeOfDay: TimeOfDay;
    lightingStyle: LightingStyle;
}

export interface ResolvedLighting {
    timeOfDay: TimeOfDay;
    lightingStyle: LightingStyle;
    wasOverridden: boolean;
}

export function resolveLighting(input: LightingInput): ResolvedLighting {
    const valid = VALID_LIGHTING[input.timeOfDay];

    if (valid.includes(input.lightingStyle)) {
        return {
            timeOfDay: input.timeOfDay,
            lightingStyle: input.lightingStyle,
            wasOverridden: false
        };
    }

    // Silent override to closest valid
    return {
        timeOfDay: input.timeOfDay,
        lightingStyle: LIGHTING_FALLBACK[input.timeOfDay],
        wasOverridden: true
    };
}

// ============================================================================
// PROMPT GENERATION (SINGLE LIGHTING ONLY)
// ============================================================================

export function getLightingPrompt(lighting: ResolvedLighting): string {
    const timeDescriptions: Record<TimeOfDay, string> = {
        morning: 'Early morning light',
        midday: 'Midday lighting',
        evening: 'Evening light',
        night: 'Night time'
    };

    const styleDescriptions: Record<LightingStyle, string> = {
        natural_light: 'soft, natural window light',
        sunny_day: 'bright, direct sunlight with defined shadows',
        overcast: 'soft, diffused overcast light',
        golden_hour: 'warm golden hour glow with long shadows',
        mood_lighting: 'atmospheric mood lighting',
        cozy_indoors: 'warm indoor ambient lighting',
        night_mode: 'smartphone night mode capture',
        flash_photo: 'direct flash photography',
        ring_light: 'even ring light illumination'
    };

    return `${timeDescriptions[lighting.timeOfDay]} with ${styleDescriptions[lighting.lightingStyle]}.`;
}
