/**
 * Preset Validation Tests
 * 
 * Validates that ALL presets produce valid UIState that passes through:
 * 1. uiContractBuilder (no errors)
 * 2. deterministicPromptBuilder (no ABORTs)
 */

import {
    PRESETS,
    getAllPresets,
    getPresetUIState,
    applyCustomizationsToPreset,
    type PresetId
} from '../../src/lib/promptEngine/presets';
import {
    buildContractFromUI,
    validateUIState
} from '../../src/lib/promptEngine/uiContractBuilder';
import {
    deterministicPromptBuilder
} from '../../src/lib/promptEngine/deterministicPromptBuilder';
import type { UIState } from '../../src/lib/promptEngine/uiContractBuilder';

console.log('='.repeat(70));
console.log('PRESET VALIDATION');
console.log('='.repeat(70));

const results: { id: string; uiValid: boolean; engineValid: boolean; error?: string }[] = [];

// Test each preset
for (const preset of getAllPresets()) {
    console.log(`\n▶ ${preset.name} (${preset.id})`);

    // Add required productType for testing
    const uiState: UIState = {
        ...preset.uiState,
        productType: 'test product'
    } as UIState;

    // Add required environment for UGC and lifestyle
    if (['ugc_phone', 'lifestyle_product'].includes(preset.uiState.sceneType!)) {
        uiState.environment = uiState.environment || 'indoor';
        uiState.place = uiState.place || 'living room';
    }

    // Step 1: Validate UI state
    const uiValidation = validateUIState(uiState);
    if (!uiValidation.valid) {
        console.log(`  ❌ UI VALIDATION FAILED: ${uiValidation.errors.join(', ')}`);
        results.push({ id: preset.id, uiValid: false, engineValid: false, error: uiValidation.errors[0] });
        continue;
    }
    console.log('  ✓ UI state valid');

    // Step 2: Build contract
    const contract = buildContractFromUI(uiState);

    // Step 3: Run through engine
    const engineResult = deterministicPromptBuilder.build(contract);

    if (engineResult.validationStatus === 'fail') {
        console.log(`  ❌ ENGINE ABORT: ${engineResult.validationErrors?.[0]}`);
        results.push({ id: preset.id, uiValid: true, engineValid: false, error: engineResult.validationErrors?.[0] });
        continue;
    }

    console.log(`  ✓ Engine PASS (${engineResult.prompt.length} chars)`);
    results.push({ id: preset.id, uiValid: true, engineValid: true });
}

// Summary
console.log('\n' + '='.repeat(70));
console.log('SUMMARY');
console.log('='.repeat(70));

const allPassed = results.every(r => r.uiValid && r.engineValid);
const passCount = results.filter(r => r.uiValid && r.engineValid).length;

console.log(`\nTotal: ${passCount}/${results.length} PASS`);

if (allPassed) {
    console.log('\n🎉 ALL PRESETS VALIDATED');
} else {
    console.log('\n🚨 PRESET VALIDATION FAILED');
    results.filter(r => !r.uiValid || !r.engineValid).forEach(r => {
        console.log(`  - ${r.id}: ${r.error}`);
    });
}

// Category breakdown
console.log('\n' + '='.repeat(70));
console.log('BY TIER');
console.log('='.repeat(70));

const byTier = Object.values(PRESETS).reduce((acc, p) => {
    acc[p.tier] = acc[p.tier] || [];
    acc[p.tier].push(p);
    return acc;
}, {} as Record<string, typeof PRESETS[PresetId][]>);

for (const [tier, presets] of Object.entries(byTier)) {
    const tierResults = presets.map(p => results.find(r => r.id === p.id));
    const tierPass = tierResults.filter(r => r?.uiValid && r?.engineValid).length;
    console.log(`${tier.toUpperCase()}: ${tierPass}/${presets.length} presets`);
}
