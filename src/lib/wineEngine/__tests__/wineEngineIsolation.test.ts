import crypto from 'crypto';
import { buildWinePrompt } from '../wineEngine';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(__dirname, '../../../..');

function sha256(input: string) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

describe('WineEngine Isolation — Structural Integrity', () => {

  // 1️⃣ Determinism Test
  it('wine prompt is deterministic (3 identical hashes)', () => {
    const state: any = {
      visualProfile: 'wine',
      wineEngineVersion: 4,
      wineColor: 'white',
      wineStyle: 'sparkling',
      wineClosureType: 'crown-cap',
      bottlePresentationMode: 'open',
      glassFillLevel: 'half'
    };

    const a = buildWinePrompt(state);
    const b = buildWinePrompt(state);
    const c = buildWinePrompt(state);

    const hashA = sha256(a);
    const hashB = sha256(b);
    const hashC = sha256(c);

    expect(hashA).toBe(hashB);
    expect(hashB).toBe(hashC);
  });

  // 2️⃣ No legacy keywords in Wine prompt
  it('wine prompt contains no legacy or narrative tokens', () => {
    const state: any = {
      visualProfile: 'wine',
      wineEngineVersion: 4,
      wineColor: 'white',
      wineStyle: 'sparkling',
      wineClosureType: 'crown-cap',
      bottlePresentationMode: 'open',
      glassFillLevel: 'half'
    };

    const prompt = buildWinePrompt(state);

    const forbidden = [
      'WINE_LIQUID_PHYSICS',
      'PACKAGING_BEHAVIOR',
      'wine-prestige',
      'wine-neutral',
      'WINE_MOOD_PROFILE',
      'burgundy',
      'prestige',
      'narrative',
    ];

    forbidden.forEach(token => {
      expect(prompt.includes(token)).toBe(false);
    });
  });

  // 3️⃣ finalizePromptFromSegments must NOT be used in wineEngine
  it('wineEngine does not import or reference finalizePromptFromSegments', () => {
    const wineEngineDir = path.join(ROOT, 'src/lib/wineEngine');
    const files = fs.readdirSync(wineEngineDir);

    files.forEach(file => {
      const content = fs.readFileSync(path.join(wineEngineDir, file), 'utf8');
      expect(content.includes('finalizePromptFromSegments')).toBe(false);
    });
  });

  // 4️⃣ Wine must not go through mapSceneToPrompt
  it('mapSceneToPrompt does not branch on wine', () => {
    const filePath = path.join(ROOT, 'src/lib/productStudioV2/mapSceneToPrompt.ts');
    if (!fs.existsSync(filePath)) return;

    const content = fs.readFileSync(filePath, 'utf8');

    expect(content.includes("visualProfile === 'wine'")).toBe(false);
  });

});
