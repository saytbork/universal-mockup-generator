# Studio V2 Freeze Guards

## Protected contracts
- segment ordering
- splash ownership
- nature anchors
- lighting priority
- assembler block boundaries
- protected baseline snapshots

## Enforcing tests
- Protected snapshot path: `src/lib/productStudioV2/tests/__snapshots__/studioProtectedBaseline.snapshot.test.ts.snap`
- `src/lib/productStudioV2/tests/genericPipeline.segmentOrder.test.ts`
- `src/lib/productStudioV2/tests/splashPhysicsOwnership.test.ts`
- `src/lib/productStudioV2/tests/natureElementsAnchors.test.ts`
- `src/lib/productStudioV2/tests/buildLighting.priority.test.ts`
- `src/lib/productStudioV2/tests/studioAssembler.blockBoundary.test.ts`
- `src/lib/productStudioV2/tests/studioProtectedBaseline.snapshot.test.ts`
- `src/lib/productStudioV2/tests/promptIntegrity.blockDuplicates.test.ts`
- `src/lib/productStudioV2/tests/studioFailureModes.test.ts`
- `src/lib/productStudioV2/tests/studioMiniMatrix.smoke.test.ts`
- `src/lib/productStudioV2/tests/promptSegmentDedupe.test.ts`

## Rules for future edits
- do not collapse `\n\n` block boundaries
- do not move splash physics ownership
- do not bypass `buildWorld` for environment ownership
- do not bypass `buildLighting` priority chain
- update protected snapshot only for intentional changes

## Verification commands
- `npx tsc --noEmit`
- `npx vitest run src/lib/productStudioV2/tests --reporter=dot`
- `npx vitest run src/lib/prompt/__tests__/wine*.test.ts --reporter=dot`
