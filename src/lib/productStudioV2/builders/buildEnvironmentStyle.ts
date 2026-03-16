import type { StudioUIState } from '../types/studioTypes';

type EnvironmentStyleDefinition = {
  name: string;
  context: string;
};

const ENVIRONMENT_STYLE_DEFINITIONS: Record<string, EnvironmentStyleDefinition> = {
  'Studio Minimal': {
    name: 'studio-minimal',
    context: 'minimal neutral studio context with restrained surfaces and clean negative space control',
  },
  'Bathroom Vanity': {
    name: 'bathroom-vanity',
    context: 'luxury bathroom vanity context with refined sink-area styling and premium cosmetic surface cues',
  },
  'Nature Elements': {
    name: 'nature-elements',
    context: 'organic natural context with botanical cues, stone and wood material presence, and real-world surface variation',
  },
  'Outdoor Pool': {
    name: 'outdoor-pool',
    context: 'outdoor pool context with sunlit water adjacency, clean resort-like spatial framing, and premium summer atmosphere',
  },
  'Luxury Spa': {
    name: 'luxury-spa',
    context: 'luxury spa context with premium wellness ambiance, calm architectural surfaces, and elevated self-care styling',
  },
  'Kitchen Counter': {
    name: 'kitchen-counter',
    context: 'kitchen countertop context with clean domestic realism, product-first framing, and controlled lifestyle cues',
  },
  'Stone Surface': {
    name: 'stone-surface',
    context: 'stone-surface context with tactile mineral textures, grounded placement realism, and editorial material depth',
  },
  'Clean Lab': {
    name: 'clean-lab',
    context: 'clean laboratory context with sterile discipline, precision surfaces, and clinical product credibility',
  },
  Kitchen: {
    name: 'kitchen',
    context: 'kitchen context with grounded countertop realism and practical domestic surface cues',
  },
  Bathroom: {
    name: 'bathroom',
    context: 'bathroom context with clean vanity/sink surface language and soft self-care atmosphere',
  },
  Workspace: {
    name: 'workspace',
    context: 'workspace context with clean desk realism, controlled object density, and modern productivity tone',
  },
};

function toKebabCase(input: string): string {
  return String(input || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function resolveEnvironmentPreset(state?: StudioUIState): string {
  return String(
    state?.environmentPreset || state?.environment || state?.environmentMode || state?.contextPresetValue || ''
  ).trim();
}

export function buildEnvironmentStyle(state?: StudioUIState): string {
  const rawPreset = resolveEnvironmentPreset(state);
  if (!rawPreset) return '';

  const [rawMacro, rawMicro] = rawPreset.split('::').map((part) => String(part || '').trim());
  const macroPreset = rawMacro || rawPreset;
  const microPreset = rawMicro || '';

  const definition = ENVIRONMENT_STYLE_DEFINITIONS[macroPreset] || ENVIRONMENT_STYLE_DEFINITIONS[rawPreset];
  const name = definition?.name || toKebabCase(macroPreset);
  const context =
    definition?.context ||
    `environment context derived from ${macroPreset}, preserving coherent spatial cues and grounded product placement realism`;

  const microContext = microPreset
    ? ` Micro-place emphasis: ${microPreset}, with grounded local contact cues and coherent surface realism.`
    : '';

  return [
    'ENVIRONMENT_STYLE_MODE: active.',
    `ENVIRONMENT_STYLE_NAME: ${name}.`,
    `ENVIRONMENT_CONTEXT: ${context}.${microContext}`,
    'ENVIRONMENT_AUTHORITY: Environment defines spatial context, surface family, and surrounding scene cues. It does not override product geometry, artwork fidelity, or photo-mode physical rules.',
  ].join(' ');
}
