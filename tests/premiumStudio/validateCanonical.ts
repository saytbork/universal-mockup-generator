/**
 * Premium Studio Validation Test
 * 
 * Tests all canonical examples through validation and prompt generation.
 */

import { CANONICAL_EXAMPLES } from '../../src/lib/premiumStudio/prompts';
import { validatePremiumInput } from '../../src/lib/premiumStudio/validation';
import { generatePremiumPrompt } from '../../src/lib/premiumStudio/prompts';
import type { SceneType } from '../../src/lib/premiumStudio/schema';

console.log('='.repeat(70));
console.log('PREMIUM STUDIO CANONICAL VALIDATION');
console.log('='.repeat(70));

const sceneTypes: SceneType[] = [
    'studio_branding',
    'editorial_product',
    'lifestyle_real',
    'ugc_phone',
    'bundle_hero'
];

let passed = 0;
let failed = 0;

for (const sceneType of sceneTypes) {
    console.log(`\n▶ ${sceneType.toUpperCase()}`);

    const example = CANONICAL_EXAMPLES[sceneType];

    // Validate
    const validation = validatePremiumInput(example);

    if (!validation.valid) {
        console.log(`  ❌ VALIDATION FAILED:`);
        validation.errors.forEach(e => console.log(`     - ${e}`));
        failed++;
        continue;
    }

    console.log('  ✓ Validation passed');

    // Generate prompt
    const result = generatePremiumPrompt(example);

    console.log(`  ✓ Prompt generated (${result.prompt.length} chars)`);
    console.log(`  ✓ Negative prompt generated (${result.negativePrompt.length} chars)`);

    // Show first 200 chars
    console.log(`  Preview: "${result.prompt.substring(0, 150)}..."`);

    passed++;
}

console.log('\n' + '='.repeat(70));
console.log('SUMMARY');
console.log('='.repeat(70));
console.log(`\nTotal: ${passed}/${sceneTypes.length} PASS`);

if (failed === 0) {
    console.log('\n🎉 ALL CANONICAL EXAMPLES VALIDATED');
} else {
    console.log(`\n🚨 ${failed} FAILURES`);
}

// Show full prompt for one example
console.log('\n' + '='.repeat(70));
console.log('SAMPLE FULL PROMPT: studio_branding');
console.log('='.repeat(70));

const sample = generatePremiumPrompt(CANONICAL_EXAMPLES.studio_branding);
console.log('\nPrompt:');
console.log(sample.prompt);
console.log('\nNegative:');
console.log(sample.negativePrompt);
