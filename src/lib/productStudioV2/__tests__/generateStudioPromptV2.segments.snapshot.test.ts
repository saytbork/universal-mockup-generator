import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

import { winePipeline, __buildSegmentsForTest as __buildWineSegmentsForTest } from '../pipelines/winePipeline';
import { coffeePipeline, __buildSegmentsForTest as __buildCoffeeSegmentsForTest } from '../pipelines/coffeePipeline';
import { genericPipeline, __buildSegmentsForTest as __buildGenericSegmentsForTest } from '../pipelines/genericPipeline';
import { getTestStates } from './testStates';

const snapshotsDir = path.join(__dirname, 'snapshots');

function loadSnapshot(name: string) {
  return fs.readFileSync(
    path.join(snapshotsDir, name),
    'utf8'
  );
}

describe('ProductStudioV2 Structural Segments Snapshot', () => {
  const [wine, coffee, generic] = getTestStates();

  it('Wine V4 segments snapshot matches', () => {
  const segments = __buildWineSegmentsForTest(wine.state);
    const snapshot = loadSnapshot('wine.v4.segments.json');
    expect(JSON.stringify(segments, null, 2)).toBe(snapshot);
  });

  it('Coffee segments snapshot matches', () => {
  const segments = __buildCoffeeSegmentsForTest(coffee.state);
    const snapshot = loadSnapshot('coffee.segments.json');
    expect(JSON.stringify(segments, null, 2)).toBe(snapshot);
  });

  it('Generic segments snapshot matches', () => {
  const segments = __buildGenericSegmentsForTest(generic.state);
    const snapshot = loadSnapshot('generic.segments.json');
    expect(JSON.stringify(segments, null, 2)).toBe(snapshot);
  });
});
