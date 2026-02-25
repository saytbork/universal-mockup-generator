// scripts/forensic_invoke_wine_pipeline.ts
// Forensic invocation of winePipeline.build using ts-node/register

import { winePipeline } from '../src/lib/productStudioV2/pipelines/winePipeline';

(async () => {
  try {
    const state: any = {
      visualProfile: 'wine',
      serveState: 'served',
      bottleState: 'sealed', // intentionally incorrect to test override
      bottleFillState: 'retail-full', // intentionally incorrect
      closureType: 'from-reference',
      carbonationLevel: 'subtle',
    };

    const prompt = await (winePipeline as any).build(state);
    const configLine = String(prompt).match(/WINE_CONFIG_RESOLVED:[^;]*;[^\n\r]*/i)?.[0] || '<not found>';

    console.log('\n--- WINE_CONFIG_RESOLVED LINE ---\n');
    console.log(configLine + '\n');
    console.log('--- FINAL PROMPT STRING ---\n');
    console.log(prompt + '\n');

    console.log('CHECKS:');
    console.log('Contains bottleState=sealed:', String(prompt).includes('bottleState=sealed'));
    console.log('Contains bottleFillState=retail-full:', String(prompt).includes('bottleFillState=retail-full'));
    console.log('Contains bottleState=open:', String(prompt).includes('bottleState=open'));
    console.log('Contains bottleFillState=clearly-partially-consumed:', String(prompt).includes('bottleFillState=clearly-partially-consumed'));
  } catch (err) {
    console.error('ERROR during pipeline build:', err && (err as any).stack ? (err as any).stack : err);
    process.exitCode = 2;
  }
})();
