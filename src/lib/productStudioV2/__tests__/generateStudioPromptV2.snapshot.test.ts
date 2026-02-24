import { describe, it, expect } from 'vitest';
import { generateStudioPromptV2 } from '../index';
import { getTestStates } from './testStates';
import fs from 'fs';
import path from 'path';

function loadSnapshot(name) {
  return fs.readFileSync(
    path.join(__dirname, 'snapshots', name),
    'utf8'
  );
}

describe('ProductStudioV2 Snapshot Validation', () => {
  const [wine, coffee, generic] = getTestStates();

  it('Wine V4 snapshot matches', () => {
    const output = generateStudioPromptV2(wine.state);
    const snapshot = loadSnapshot('wine.v4.snapshot.txt');
    expect(output).toBe(snapshot);
  });

  it('Coffee snapshot matches', () => {
    const output = generateStudioPromptV2(coffee.state);
    const snapshot = loadSnapshot('coffee.snapshot.txt');
    expect(output).toBe(snapshot);
  });

  it('Generic snapshot matches', () => {
    const output = generateStudioPromptV2(generic.state);
    const snapshot = loadSnapshot('generic.snapshot.txt');
    expect(output).toBe(snapshot);
  });
});
