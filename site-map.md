# Site Map

## Overview
This repository hosts a web-based UGC mockup generator powered by a PromptEngine pipeline. The two main areas are:
- **UI (frontend)** in `src/components/`, `App.tsx`, and supporting stores/services
- **Prompt engine** in `src/lib/promptEngine/` with orchestrated builders

The app exposes a Lifestyle Step 3 Scene Builder, prompt assembly, and Gemini integration for image generation. Use this document to orient any GPT assistant before making targeted edits.

## Top-level structure
- `src/` – Application source files
  - `App.tsx` – Entry point that coordinates UI state, handlers (`constructPrompt`, `handleGenerateClick`, talent actions) and pushes prompts to the PromptEngine. Inline data + Gemini calls are routed via `services/imageGenerationService.ts`.
  - `components/` – React UI surface
    * `LifestyleStep3.tsx` – Fully controlled Scene Builder with accordion sections, UGC mode toggles, and mapped controls.
    * `SmoothAccordion.tsx` – Custom height-interpolated accordion used throughout Step 3.
    * Other shared UI atoms (buttons, sliders, iconography) live in the same folder.
  - `store/` – Zustand stores
    * `useCreatorStore.ts` – Central creator config (scene, person, outputs) used across the UI.
  - `services/`
    * `imageGenerationService.ts` – Wraps Gemini calls (development proxy vs. production SDK), sends inline data, and collects response.
  - `constants/` – Shared constant sets (lighting, camera options, tooltips) consumed by UI and prompt builders.

- `src/lib/promptEngine/` – Canonical prompt generation stack
  - `types.ts` – Shared types (`PromptOptions`, `PersonDetails`, locks, UGC layer sets, etc.).
  - `mapLifestyleToPromptOptions.ts` – Converts LifestyleStep3 `Step3Values` → `PromptOptions`, enforces identity locks, seeds, UGC layers, and narrative overrides.
  - `masterPrompt.ts` – Assembles prompt sections into final string, selects UGC contract text (optimized / natural / raw) and appends negative prompts.
  - `index.ts` – `PromptEngine` orchestrator: runs validation, identity builder, UGC real-mode builder, scene builder, formulation builder, finalize, and merges with master prompt. Also manages negative prompts and seed housekeeping.
  - `builders/`
    * `identity.ts` – Injects convergent identity descriptors, variation rules, natural hair/skin descriptors, and UI lock enforcement.
    * `scene.ts` – Builds scene narrative (setting, perspective, chaos descriptors) and plugs into master builder.
    * `lighting.ts` – Adds lighting language with elder lighting overrides and early exits for `ugcStyle === 'natural'`.
    * `ugcRealMode.ts` – Handles raw domestic UGC overrides, constraints, and layers.
    * `formulationStoryInjection.ts` – Adds expert narrative sections when formulation story is enabled.
    * `productPlacement.ts` – Builds product-focused prompts (trained on product metadata) using scene/environment/camera builders.
    * Additional builders (`compositionDetails.ts`, `constraints.ts`, `finalize.ts`, `modes.ts`, etc.) constrain outputs and enforce safety.

## Supporting folders & assets
- `dist/` – Built artifacts (auto-generated Vite output) kept on this branch for deployment.
- `scripts/` – Project scripts (not generally edited manually).
- `.codex/` – Task-specific automation (if present, ignore unless instructed).

## How to use this map
1. Read this file before requesting changes; it captures the architecture and where each concern lives.
2. Refer to `components/LifestyleStep3.tsx` for UI controls, `mapLifestyleToPromptOptions.ts` for mapping logic, and the builders for specific prompt text.
3. Mention relevant files when instructing GPT so it can focus on the right modules.
4. Treat EOS (end of site-map) as the canonical source for onboarding new collaborators before editing prompt behavior or UI flows.
