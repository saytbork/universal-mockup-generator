# Step3 Architecture

## Entry Points
- `src/components/StudioStep3.tsx`: studio Step 3 entrypoint used by product/studio runtime.
- `src/components/LifestyleStep3.tsx`: lifestyle Step 3 entrypoint used by lifestyle runtime.
- Both currently render `Step3Legacy.tsx` with explicit mode intent from the caller.

## Blocks
- `blocks/studio/*`: studio-only block wrappers.
- `blocks/lifestyle/*`: lifestyle-only block wrappers.

## Shared
- `shared/*`: stateless presentational primitives only.

## Boundary Rule
A local ESLint rule (`.eslintrc.json`) prevents cross-imports between studio and lifestyle block folders.
