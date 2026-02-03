/**
 * STRESS TESTS — Product Studio
 * Detect failures before users do.
 * 
 * Run: npx ts-node verify_studio_stress.ts
 */

import {
    buildStudioPrompt,
    STUDIO_DEFAULTS,
    applyStudioDefaults,
    ensurePaletteWithFallbacks,
    NEUTRAL_WARM_GRAY_FALLBACK,
    STUDIO_NEGATIVES,
} from './src/lib/promptEngine/studioPresets.ts';

// Test utilities
function assert(condition: boolean, message: string): void {
    if (!condition) {
        console.error(`❌ FAIL: ${message}`);
        process.exitCode = 1;
    } else {
        console.log(`✅ PASS: ${message}`);
    }
}

// =============================================================================
// TEST 1: White label on white product
// =============================================================================
console.log('\n--- TEST 1: White label on white product ---');
const whitePalette = ensurePaletteWithFallbacks('#FFFFFF');
assert(whitePalette.primary === '#FFFFFF', 'Primary is white');
assert(whitePalette.secondary !== whitePalette.primary, 'Secondary is different from primary');
assert(whitePalette.accent !== whitePalette.primary, 'Accent is different from primary');
console.log('Palette:', whitePalette);

// =============================================================================
// TEST 2: Fully transparent product (no colors extracted)
// =============================================================================
console.log('\n--- TEST 2: Fully transparent product (no colors) ---');
const transparentPalette = ensurePaletteWithFallbacks(undefined, undefined, undefined);
assert(transparentPalette.primary === NEUTRAL_WARM_GRAY_FALLBACK.primary, 'Falls back to neutral warm gray');
assert(transparentPalette.secondary === NEUTRAL_WARM_GRAY_FALLBACK.secondary, 'Secondary is fallback');
assert(transparentPalette.accent === NEUTRAL_WARM_GRAY_FALLBACK.accent, 'Accent is fallback');
console.log('Palette:', transparentPalette);

// =============================================================================
// TEST 3: Matte black product
// =============================================================================
console.log('\n--- TEST 3: Matte black product ---');
const blackPalette = ensurePaletteWithFallbacks('#000000');
assert(blackPalette.primary === '#000000', 'Primary is black');
assert(blackPalette.secondary !== '#000000', 'Secondary is lighter');
assert(blackPalette.accent !== '#000000', 'Accent is calculated');
console.log('Palette:', blackPalette);

// =============================================================================
// TEST 4: Palette with 1 single color (monochrome)
// =============================================================================
console.log('\n--- TEST 4: Single color palette (monochrome) ---');
const singleColorPalette = ensurePaletteWithFallbacks('#FF5733');
assert(singleColorPalette.primary === '#FF5733', 'Primary is the provided color');
assert(singleColorPalette.secondary.startsWith('#'), 'Secondary is valid hex');
assert(singleColorPalette.accent.startsWith('#'), 'Accent is valid hex');
console.log('Palette:', singleColorPalette);

// =============================================================================
// TEST 5: All controls at default
// =============================================================================
console.log('\n--- TEST 5: All controls at default ---');
const defaultOptions = applyStudioDefaults({});
assert(defaultOptions.photoMode === STUDIO_DEFAULTS.photoMode, 'Default photoMode: Hero Landing Page');
assert(defaultOptions.surface === STUDIO_DEFAULTS.surface, 'Default surface: Neutral Surface');
assert(defaultOptions.composition === STUDIO_DEFAULTS.composition, 'Default composition: Centered Hero');
assert(defaultOptions.lens === STUDIO_DEFAULTS.lens, 'Default lens: 50mm Product Prime');
assert(defaultOptions.angle === STUDIO_DEFAULTS.angle, 'Default angle: Three-Quarter');
assert(defaultOptions.distance === STUDIO_DEFAULTS.distance, 'Default distance: Medium');
assert(defaultOptions.framing === STUDIO_DEFAULTS.framing, 'Default framing: Full Product');
assert(defaultOptions.lighting === STUDIO_DEFAULTS.lighting, 'Default lighting: Softbox Wrap');
assert(defaultOptions.finish === STUDIO_DEFAULTS.finish, 'Default finish: High-Gloss Commercial');
assert(defaultOptions.shadow === STUDIO_DEFAULTS.shadow, 'Default shadow: Soft Drop');
assert(defaultOptions.interaction === STUDIO_DEFAULTS.interaction, 'Default interaction: None');

const defaultPrompt = buildStudioPrompt({
    photoMode: defaultOptions.photoMode,
    surface: defaultOptions.surface,
    composition: defaultOptions.composition,
    scale: defaultOptions.scale,
    spacing: defaultOptions.spacing,
    negativeSpace: defaultOptions.negativeSpace,
    lens: defaultOptions.lens,
    angle: defaultOptions.angle,
    distance: defaultOptions.distance,
    framing: defaultOptions.framing,
    lighting: defaultOptions.lighting,
    finish: defaultOptions.finish,
    shadow: defaultOptions.shadow,
    interaction: defaultOptions.interaction,
});
assert(defaultPrompt.includes('Controlled advertising studio.'), 'Default prompt includes safe Studio base');
assert(!defaultPrompt.includes('undefined'), 'No undefined values in prompt');
assert(!defaultPrompt.includes('null'), 'No null values in prompt');
console.log('Default prompt length:', defaultPrompt.length, 'characters');

// =============================================================================
// TEST 6: All controls fully customized
// =============================================================================
console.log('\n--- TEST 6: All controls fully customized ---');
const customPrompt = buildStudioPrompt({
    photoMode: 'Splash Shot',
    paletteColor1: '#FF0000',
    paletteColor2: '#00FF00',
    paletteColor3: '#0000FF',
    surface: 'Acrylic Pedestal',
    composition: 'Rule of Thirds',
    scale: 'Full Frame',
    spacing: 'Tight',
    negativeSpace: 'Left',
    lens: '100mm Macro Prime',
    angle: 'Top Down',
    distance: 'Macro',
    framing: 'Detail Focus',
    lighting: 'Hard Edge Gels',
    finish: 'Film Grain Luxury',
    shadow: 'Hard Drop',
    interaction: 'Holding',
});
assert(customPrompt.includes('Controlled advertising studio.'), 'Custom prompt includes safe Studio base');
assert(customPrompt.includes('AUTO PALETTE EXTRACTION'), 'Custom prompt includes palette');
assert(customPrompt.includes('#FF0000'), 'Custom prompt includes primary color');
assert(customPrompt.includes('Splash Shot') || customPrompt.includes('splash'), 'Custom prompt includes photo mode');
assert(customPrompt.includes('Acrylic Pedestal') || customPrompt.includes('acrylic pedestal'), 'Custom prompt includes surface');
assert(customPrompt.includes(STUDIO_NEGATIVES), 'Custom prompt includes negatives');
console.log('Custom prompt length:', customPrompt.length, 'characters');

// =============================================================================
// TEST 7: Prompt never leaks environment terms
// =============================================================================
console.log('\n--- TEST 7: No environment leakage ---');
const blockedTerms = ['kitchen', 'bathroom', 'bedroom', 'living room', 'outdoor', 'street', 'park'];
let hasLeakage = false;
for (const term of blockedTerms) {
    if (defaultPrompt.toLowerCase().includes(term)) {
        console.error(`❌ LEAK: Found "${term}" in default prompt`);
        hasLeakage = true;
    }
    if (customPrompt.toLowerCase().includes(term)) {
        console.error(`❌ LEAK: Found "${term}" in custom prompt`);
        hasLeakage = true;
    }
}
assert(!hasLeakage, 'No environment terms leaked into Studio prompts');

// =============================================================================
// SUMMARY
// =============================================================================
console.log('\n========================================');
console.log('STRESS TESTS COMPLETE');
if (process.exitCode === 1) {
    console.log('❌ SOME TESTS FAILED');
} else {
    console.log('✅ ALL TESTS PASSED - SYSTEM STABLE');
}
console.log('========================================');
