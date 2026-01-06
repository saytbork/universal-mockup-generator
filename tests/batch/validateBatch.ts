/**
 * Batch Validation Tests
 * 
 * Tests that batch expansion produces valid states
 * that pass through the entire pipeline.
 */

import {
    expandBatch,
    createBatchFromPreset,
    getMaxBatchSize,
    presetSupportsBatch
} from '../../src/lib/promptEngine/batchExpander';
import {
    PRESETS,
    getAllPresets,
    applyCustomizationsToPreset
} from '../../src/lib/promptEngine/presets';
import {
    buildContractFromUI,
    validateUIState
} from '../../src/lib/promptEngine/uiContractBuilder';
import {
    deterministicPromptBuilder
} from '../../src/lib/promptEngine/deterministicPromptBuilder';
import type { UIState } from '../../src/lib/promptEngine/uiContractBuilder';
import type { PresetId } from '../../src/lib/promptEngine/presets';

console.log('='.repeat(70));
console.log('BATCH VALIDATION');
console.log('='.repeat(70));

let totalTests = 0;
let passedTests = 0;
const failures: string[] = [];

// Test each preset that supports batch
for (const preset of getAllPresets()) {
    const presetId = preset.id as PresetId;

    if (!presetSupportsBatch(presetId)) {
        console.log(`\n⏭ ${preset.name} - does not support batch`);
        continue;
    }

    console.log(`\n▶ ${preset.name} (${presetId})`);

    // Create base state with required fields
    const baseState: UIState = applyCustomizationsToPreset(presetId, {
        productType: 'test product'
    });

    // Add required environment for UGC and lifestyle
    if (['ugc_phone', 'lifestyle_product'].includes(preset.uiState.sceneType!)) {
        baseState.environment = baseState.environment || 'indoor';
        baseState.place = baseState.place || 'living room';
    }

    const maxSize = getMaxBatchSize(presetId);
    console.log(`  Max batch size: ${maxSize}`);

    try {
        // Create batch with default axes
        const batchSpec = createBatchFromPreset(presetId, baseState, 4);
        console.log(`  Variation axes: ${batchSpec.variationAxes.join(', ')}`);

        // Expand batch
        const batchResult = expandBatch(batchSpec);
        console.log(`  Generated ${batchResult.items.length} items`);

        // Test each item through full pipeline
        let itemsPassed = 0;
        for (const item of batchResult.items) {
            totalTests++;

            // Build contract
            const contract = buildContractFromUI(item.uiState);

            // Run through engine
            const result = deterministicPromptBuilder.build(contract);

            if (result.validationStatus === 'pass') {
                itemsPassed++;
                passedTests++;
            } else {
                failures.push(`${presetId}[${item.index}]: ${result.validationErrors?.[0]}`);
            }
        }

        if (itemsPassed === batchResult.items.length) {
            console.log(`  ✅ All ${itemsPassed} items PASS engine`);
        } else {
            console.log(`  ❌ ${itemsPassed}/${batchResult.items.length} items passed`);
        }

    } catch (error) {
        console.log(`  ❌ ERROR: ${(error as Error).message}`);
        failures.push(`${presetId}: ${(error as Error).message}`);
        totalTests++;
    }
}

// Summary
console.log('\n' + '='.repeat(70));
console.log('SUMMARY');
console.log('='.repeat(70));

console.log(`\nTotal: ${passedTests}/${totalTests} PASS`);

if (failures.length === 0) {
    console.log('\n🎉 ALL BATCH EXPANSIONS VALIDATED');
} else {
    console.log('\n🚨 BATCH VALIDATION FAILURES:');
    failures.forEach(f => console.log(`  - ${f}`));
}
