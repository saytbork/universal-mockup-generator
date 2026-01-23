/**
 * GTM Demo Generator
 * 
 * Validates and generates prompts for all GTM demo inputs.
 */

import { GTM_DEMOS, GTM_DEMO_LIST } from '../../src/lib/premiumStudio/gtmDemos';
import { validatePremiumInput } from '../../src/lib/premiumStudio/validation';
import { generatePremiumPrompt } from '../../src/lib/premiumStudio/prompts';
import type { PremiumStudioInput } from '../../src/lib/premiumStudio/schema';

console.log('='.repeat(70));
console.log('GTM DEMO GENERATION');
console.log('='.repeat(70));

const results: {
    id: string;
    sceneType: string;
    valid: boolean;
    promptLength?: number;
    error?: string;
}[] = [];

for (const [id, input] of Object.entries(GTM_DEMOS)) {
    const validation = validatePremiumInput(input as PremiumStudioInput);

    if (!validation.valid) {
        console.log(`\n❌ ${id}`);
        console.log(`   Error: ${validation.errors[0]}`);
        results.push({ id, sceneType: input.sceneType, valid: false, error: validation.errors[0] });
        continue;
    }

    const { prompt, negativePrompt } = generatePremiumPrompt(input as PremiumStudioInput);

    console.log(`\n✅ ${id}`);
    console.log(`   SceneType: ${input.sceneType}`);
    console.log(`   Product: ${input.product.category}`);
    console.log(`   Prompt: ${prompt.length} chars`);

    results.push({ id, sceneType: input.sceneType, valid: true, promptLength: prompt.length });
}

// Summary
console.log('\n' + '='.repeat(70));
console.log('SUMMARY');
console.log('='.repeat(70));

const validCount = results.filter(r => r.valid).length;
console.log(`\nTotal: ${validCount}/${results.length} valid`);

if (validCount === results.length) {
    console.log('\n🎉 ALL GTM DEMOS READY');
} else {
    console.log('\n🚨 SOME DEMOS FAILED');
}

// By scene type
console.log('\n' + '='.repeat(70));
console.log('BY SCENE TYPE');
console.log('='.repeat(70));

const byScene = results.reduce((acc, r) => {
    acc[r.sceneType] = acc[r.sceneType] || [];
    acc[r.sceneType].push(r);
    return acc;
}, {} as Record<string, typeof results>);

for (const [scene, demos] of Object.entries(byScene)) {
    const valid = demos.filter(d => d.valid).length;
    console.log(`${scene}: ${valid}/${demos.length}`);
}
