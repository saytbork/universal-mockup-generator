/**
 * Scene Type Fixtures Validation
 * 
 * Runs all 6 fixtures and validates PASS status.
 */

import { deterministicPromptBuilder } from '../../src/lib/promptEngine/deterministicPromptBuilder';
import {
    SCENE_TYPE_FIXTURES,
    type SceneTypeFixtureKey
} from './sceneTypeFixtures';

console.log('='.repeat(70));
console.log('SCENE TYPE FIXTURES VALIDATION');
console.log('='.repeat(70));

const results: { sceneType: string; status: string; promptLength?: number; error?: string }[] = [];

for (const [sceneType, fixture] of Object.entries(SCENE_TYPE_FIXTURES)) {
    console.log(`\n▶ ${sceneType.toUpperCase()}`);

    const result = deterministicPromptBuilder.build(fixture);

    if (result.validationStatus === 'pass') {
        console.log(`  ✅ PASS (${result.prompt.length} chars)`);
        results.push({ sceneType, status: 'PASS', promptLength: result.prompt.length });
    } else {
        console.log(`  ❌ FAIL: ${result.validationErrors?.[0]}`);
        results.push({ sceneType, status: 'FAIL', error: result.validationErrors?.[0] });
    }
}

console.log('\n' + '='.repeat(70));
console.log('SUMMARY');
console.log('='.repeat(70));

const allPassed = results.every(r => r.status === 'PASS');
const passCount = results.filter(r => r.status === 'PASS').length;

console.log(`\nTotal: ${passCount}/6 PASS`);

if (allPassed) {
    console.log('\n🎉 ALL 6 SCENE TYPE FIXTURES VALIDATED');
} else {
    console.log('\n🚨 FIXTURE VALIDATION FAILED');
    results.filter(r => r.status === 'FAIL').forEach(r => {
        console.log(`  - ${r.sceneType}: ${r.error}`);
    });
}

console.log('\n' + '='.repeat(70));
console.log('GENERATED PROMPTS');
console.log('='.repeat(70));

for (const [sceneType, fixture] of Object.entries(SCENE_TYPE_FIXTURES)) {
    const result = deterministicPromptBuilder.build(fixture);
    if (result.validationStatus === 'pass') {
        console.log(`\n━━━ ${sceneType.toUpperCase()} ━━━`);
        console.log('\nPrompt final:');
        console.log(result.prompt);
        console.log('\nNegative prompt:');
        console.log(result.negativePrompt);
    }
}
