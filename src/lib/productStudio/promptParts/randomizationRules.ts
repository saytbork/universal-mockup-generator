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

export function buildRandomizationRules(): string {
  return [
    'RANDOMIZATION RULES (CRITICAL):',
    'Every generation must differ in camera angle, lens distance, lighting setup, object placement, and environment details.',
    'Never reuse the same base composition or staging structure.',
    'Vary props and micro-environment accents each time.',
    'Avoid symmetrical default framing.'
  ].join(' ');
}
