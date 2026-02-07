import { DEFAULT_PRODUCT_STUDIO_STATE } from '../src/lib/productStudio/store.ts';
import { PHOTO_MODE_SCHEMAS } from '../src/lib/productStudio/photoModeSchema.ts';
import { generatePreviewPrompt } from '../src/lib/productStudio/builders.ts';
import type { ProductStudioState, PhotoMode, ProductPlacement, ProductStateMotion } from '../src/lib/productStudio/types.ts';

type Scenario = {
  name: string;
  sceneType: ProductStudioState['sceneType'];
  environmentContext: ProductStudioState['environmentContext'];
};

type Mutation = {
  name: string;
  placement?: ProductPlacement;
  interaction?: ProductStudioState['interaction'];
  stateMotion?: ProductStateMotion;
};

type Failure = {
  mode: string;
  scenario: string;
  mutation: string;
  check: string;
  detail: string;
};

const scenarios: Scenario[] = [
  {
    name: 'studio',
    sceneType: 'studio-branding',
    environmentContext: null,
  },
  {
    name: 'lifestyle',
    sceneType: 'lifestyle-real',
    environmentContext: { macro: 'kitchen', micro: 'countertop' },
  },
];

const mutations: Mutation[] = [
  { name: 'baseline' },
  { name: 'force-air', placement: 'air' },
  { name: 'force-holding', interaction: 'holding' },
  { name: 'force-pouring', stateMotion: 'pouring' },
];

function makeBaseState(mode: PhotoMode, scenario: Scenario): ProductStudioState {
  const state: ProductStudioState = structuredClone(DEFAULT_PRODUCT_STUDIO_STATE);
  state.photoMode = mode;
  state.sceneType = scenario.sceneType;
  state.environmentContext = scenario.environmentContext ? { ...scenario.environmentContext } : null;
  state.activeProductId = 'p1';
  state.products = [
    {
      id: 'p1',
      name: 'Product 1',
      imageUrl: 'mock://product.png',
      palette: { dominant: '#60A020', secondary: '#80C060', accent: '#60A040' },
    },
  ];
  state.props = mode === 'Ingredient Flat Lay' || mode === 'Ingredient Stack' ? 'ginger, turmeric, cinnamon' : '';
  state.definition = {
    ...state.definition,
    type: 'capsules',
    physical: {
      kind: 'capsules',
      v: {
        capsuleStyle: 'veggie',
        capsuleContentColor: { hex: '#D9C29A', semanticName: 'beige' },
        quantity: 2,
        layout: 'grouped',
        glassOfWater: false,
        spoon: false,
      },
    },
  };
  return state;
}

function runChecks(mode: PhotoMode, state: ProductStudioState, prompt: string): Failure[] {
  const failures: Failure[] = [];
  const schema = PHOTO_MODE_SCHEMAS[mode];
  const requiredPlacement = schema?.requiredPlacement;
  const lower = prompt.toLowerCase();

  const push = (check: string, detail: string): void => {
    failures.push({
      mode,
      scenario: String(state.sceneType),
      mutation: `${state.placement}|${state.interaction}|${state.stateMotion}`,
      check,
      detail,
    });
  };

  if (requiredPlacement && requiredPlacement !== 'any') {
    const requiredLabel =
      requiredPlacement === 'air'
        ? 'PLACEMENT (MANDATORY): Air / Suspended.'
        : requiredPlacement === 'supported'
          ? 'PLACEMENT (MANDATORY): Supported.'
          : requiredPlacement === 'held'
            ? 'PLACEMENT (MANDATORY): Held.'
            : 'PLACEMENT (MANDATORY): Surface.';
    if (!prompt.includes(requiredLabel)) {
      push('requiredPlacement', `Expected placement label not found: ${requiredLabel}`);
    }
  }

  if (schema?.allowsPersonPresence === false && lower.includes('product_interaction:')) {
    push('personPresence', 'Product interaction block appeared in a mode that disallows person presence.');
  }

  if (mode === 'Ingredient Flat Lay') {
    if (!lower.includes('top-down')) {
      push('flatlay-topdown', 'Ingredient Flat Lay prompt does not include top-down directive.');
    }
    if (lower.includes('45-degree hero') || lower.includes('eye-level product view') || lower.includes('camera angle: eye-level')) {
      push('flatlay-camera-contradiction', 'Ingredient Flat Lay prompt includes non-top-down camera directive.');
    }
  }

  if (mode !== 'Acrylic Blocks') {
    if (lower.includes('acrylic riser') || lower.includes('acrylic blocks')) {
      push('acrylic-leak', 'Acrylic blocks/riser leaked into a non-Acrylic mode.');
    }
  }

  if (lower.includes('creator') || lower.includes('identity')) {
    push('forbidden-terms', 'Prompt contains forbidden term (creator/identity).');
  }

  return failures;
}

function main(): void {
  const noisyPrefixes = ['2. Generated Prompt Parts:', '3. FINAL PROMPT:', '[Photo Mode] Validation failed:'];
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;
  console.log = (...args: unknown[]) => {
    const text = String(args[0] ?? '');
    if (noisyPrefixes.some((prefix) => text.startsWith(prefix))) return;
    originalLog(...args);
  };
  console.warn = (...args: unknown[]) => {
    const text = String(args[0] ?? '');
    if (noisyPrefixes.some((prefix) => text.startsWith(prefix))) return;
    originalWarn(...args);
  };
  console.error = (...args: unknown[]) => {
    const text = String(args[0] ?? '');
    if (noisyPrefixes.some((prefix) => text.startsWith(prefix))) return;
    originalError(...args);
  };

  const modes = Object.keys(PHOTO_MODE_SCHEMAS) as PhotoMode[];
  const failures: Failure[] = [];
  let totalCases = 0;

  for (const mode of modes) {
    for (const scenario of scenarios) {
      for (const mutation of mutations) {
        const state = makeBaseState(mode, scenario);
        if (mutation.placement) state.placement = mutation.placement;
        if (mutation.interaction) state.interaction = mutation.interaction;
        if (mutation.stateMotion) state.stateMotion = mutation.stateMotion;

        totalCases += 1;
        try {
          const prompt = generatePreviewPrompt(state);
          if (!prompt) {
            failures.push({
              mode,
              scenario: scenario.name,
              mutation: mutation.name,
              check: 'no-prompt',
              detail: 'generatePreviewPrompt returned null.',
            });
            continue;
          }
          const caseFailures = runChecks(mode, state, prompt).map((f) => ({
            ...f,
            scenario: scenario.name,
            mutation: mutation.name,
          }));
          failures.push(...caseFailures);
        } catch (error) {
          failures.push({
            mode,
            scenario: scenario.name,
            mutation: mutation.name,
            check: 'exception',
            detail: error instanceof Error ? error.message : String(error),
          });
        }
      }
    }
  }

  const passedCases = totalCases - new Set(failures.map((f) => `${f.mode}:${f.scenario}:${f.mutation}`)).size;
  const summary = {
    totalCases,
    failedCases: totalCases - passedCases,
    passedCases,
    failureCount: failures.length,
  };

  console.log('=== Product Studio Coherence Matrix ===');
  console.log(JSON.stringify(summary, null, 2));

  if (failures.length > 0) {
    console.log('\n=== Failures ===');
    for (const failure of failures) {
      console.log(
        `- [${failure.mode}] [${failure.scenario}] [${failure.mutation}] ${failure.check}: ${failure.detail}`
      );
    }
    process.exitCode = 1;
    return;
  }

  console.log('\nAll checks passed.');
}

main();
