// scripts/forensic_invoke_wine_pipeline.mjs
// Use ts-node's ESM loader to import TS ESM modules

const state = {
  visualProfile: 'wine',
  serveState: 'served',
  bottleState: 'sealed',
  bottleFillState: 'retail-full',
  closureType: 'from-reference',
  carbonationLevel: 'subtle',
};

(async () => {
  try {
    const mod = await import('../src/lib/productStudioV2/pipelines/winePipeline.ts');
    const winePipeline = mod.winePipeline || mod.default?.winePipeline;
    if (!winePipeline) {
      console.error('winePipeline not found');
      process.exit(2);
    }
    const prompt = await winePipeline.build(state);
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
    console.error('ERROR during pipeline build:', err && err.stack ? err.stack : err);
    process.exitCode = 2;
  }
})();
