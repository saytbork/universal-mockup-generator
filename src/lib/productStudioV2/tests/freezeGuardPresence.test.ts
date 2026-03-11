import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';

describe('freeze guard presence', () => {
  it('required docs, snapshots and regression tests exist', () => {
    const nonCanonicalSnapshotPath =
      'src/lib/productStudioV2/tests/snapshots/studioProtectedBaseline.snapshot.test.ts.snap';

    const requiredFiles = [
      'src/lib/productStudioV2/README_FREEZE_GUARDS.md',
      'src/lib/productStudioV2/tests/__snapshots__/studioProtectedBaseline.snapshot.test.ts.snap',
      'src/lib/productStudioV2/tests/genericPipeline.segmentOrder.test.ts',
      'src/lib/productStudioV2/tests/splashPhysicsOwnership.test.ts',
      'src/lib/productStudioV2/tests/natureElementsAnchors.test.ts',
      'src/lib/productStudioV2/tests/buildLighting.priority.test.ts',
      'src/lib/productStudioV2/tests/studioAssembler.blockBoundary.test.ts',
      'src/lib/productStudioV2/tests/studioProtectedBaseline.snapshot.test.ts',
    ];

    for (const file of requiredFiles) {
      expect(existsSync(file), `missing: ${file}`).toBe(true);
    }

    expect(existsSync(nonCanonicalSnapshotPath), `unexpected duplicate snapshot path: ${nonCanonicalSnapshotPath}`).toBe(false);
  });
});
