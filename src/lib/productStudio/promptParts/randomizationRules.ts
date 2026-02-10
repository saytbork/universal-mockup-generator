type RandomSource = () => number;

function createFallbackRandomSource(): RandomSource {
  let state = (Date.now() ^ (typeof performance !== 'undefined' ? Math.floor(performance.now()) : 0)) >>> 0;
  return () => {
    // Xorshift32 for environments without crypto.getRandomValues.
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 0xffffffff;
  };
}

function createCryptoRandomSource(): RandomSource | null {
  if (typeof globalThis === 'undefined') return null;
  const cryptoObj = (globalThis as typeof globalThis & { crypto?: Crypto }).crypto;
  if (!cryptoObj?.getRandomValues) return null;
  return () => {
    const buffer = new Uint32Array(1);
    cryptoObj.getRandomValues(buffer);
    return buffer[0] / 0xffffffff;
  };
}

export type Randomizer = {
  seed: string;
  pick<T>(items: readonly T[]): T;
  pickMany<T>(items: readonly T[], count: number): T[];
  pickOptional<T>(items: readonly T[], chance?: number): T | null;
};

export function createRandomizer(): Randomizer {
  const cryptoSource = createCryptoRandomSource();
  const source = cryptoSource ?? createFallbackRandomSource();
  const seed = cryptoSource ? 'crypto' : `fallback-${Date.now().toString(36)}`;

  const pick = <T,>(items: readonly T[]): T => {
    if (items.length === 0) {
      throw new Error('Randomizer received empty list');
    }
    const index = Math.floor(source() * items.length);
    return items[Math.min(index, items.length - 1)];
  };

  const pickMany = <T,>(items: readonly T[], count: number): T[] => {
    const result = new Set<T>();
    const total = Math.min(count, items.length);
    while (result.size < total) {
      result.add(pick(items));
    }
    return Array.from(result);
  };

  const pickOptional = <T,>(items: readonly T[], chance = 0.5): T | null => {
    if (source() > chance) return null;
    return pick(items);
  };

  return { seed, pick, pickMany, pickOptional };
}

export type RandomizationMode = 'default' | 'ingredientStack';
export type RandomizationProfile = 'luxury-brand' | 'ecommerce-conversion' | 'editorial';
export type RandomizationLocks = {
  lensLocked?: boolean;
  lightingLocked?: boolean;
  finishLocked?: boolean;
  propsLocked?: boolean;
};

export function buildRandomizationRules(
  mode: RandomizationMode = 'default',
  profile: RandomizationProfile = 'luxury-brand',
  locks: RandomizationLocks = {}
): string {
  const profileLine = profile === 'ecommerce-conversion'
    ? 'Keep visual hierarchy conversion-focused: product and label remain dominant in every variation.'
    : profile === 'editorial'
      ? 'Allow expressive composition shifts while preserving product truth and brand safety.'
      : 'Maintain luxury campaign polish across all variations.';

  const lockRules: string[] = [];
  if (locks.lensLocked) lockRules.push('Lens selection is locked to the user-selected value; do not override it.');
  if (locks.lightingLocked) lockRules.push('Lighting rig is locked to the user-selected value; do not override it.');
  if (locks.finishLocked) lockRules.push('Finish / treatment is locked to the user-selected value; do not override it.');
  if (locks.propsLocked) lockRules.push('Props are locked: do not add, vary, or invent props/environment accents unless explicitly selected by user.');

  const variableParts: string[] = ['camera angle', 'lens distance'];
  if (!locks.lightingLocked) variableParts.push('lighting setup');
  variableParts.push(mode === 'ingredientStack' ? 'ingredient placement' : 'object placement', 'environment details');

  if (mode === 'ingredientStack') {
    return [
      'RANDOMIZATION RULES (CRITICAL):',
      `Every generation must differ in ${variableParts.join(', ')} while preserving premium ad quality.`,
      'Only the listed ingredients may be rearranged; do not introduce any other objects.',
      'Never reuse the same base composition or staging structure.',
      'Avoid symmetrical default framing unless explicitly required by ecommerce composition.',
      ...lockRules,
      profileLine
    ].join(' ');
  }

  return [
    'RANDOMIZATION RULES (CRITICAL):',
    `Every generation must differ in ${variableParts.join(', ')} while staying campaign-grade.`,
    'Never reuse the same base composition or staging structure.',
    locks.propsLocked
      ? 'Do not vary props or micro-environment accents unless explicitly selected by user.'
      : 'Vary props and micro-environment accents each time without reducing product prominence.',
    'Avoid symmetrical default framing unless explicitly required by ecommerce composition.',
    ...lockRules,
    profileLine
  ].join(' ');
}
