# Step3 Architecture

## Engines
- `engines/StudioEngine.tsx`: dense, technical, accordion-driven layout shell.
- `engines/LifestyleEngine.tsx`: editorial, always-visible layout shell.

## Router
- `Step3Router.tsx` is the only mode switch point.

## Blocks
- `blocks/studio/*`: studio-only block wrappers.
- `blocks/lifestyle/*`: lifestyle-only block wrappers.

## Shared
- `shared/*`: stateless presentational primitives only.

## Boundary Rule
A local ESLint rule (`.eslintrc.json`) prevents cross-imports between studio and lifestyle block folders.
