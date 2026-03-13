import React, { useEffect, useMemo, useState } from 'react';
import { Chip } from '@/components/ui/Chip';
import { SwitchToggle } from '@/components/ui/SwitchToggle';
import type {
  CoffeeAction,
  CoffeeLightingTone,
  CoffeeMoodModifier,
  CoffeeSteamLevel,
} from '@/lib/productStudio/types';
import { DEFAULT_COFFEE_CONFIG } from '@/lib/productStudio/types';
import { useProductStudioStore } from '@/lib/productStudio/store';

type CoffeePackagingIntent =
  | 'pdp-clean'
  | 'premium-campaign'
  | 'dark-roast-luxury'
  | 'modern-minimal'
  | 'cold-brew-fresh'
  | 'bundle-hero';

type SurfaceStyle =
  | 'neutral-gradient'
  | 'dark-stone'
  | 'matte-wood'
  | 'concrete-minimal'
  | 'pure-white-pdp';

const INTENT_OPTIONS: Array<{ label: string; value: CoffeePackagingIntent; mood: CoffeeMoodModifier }> = [
  { label: 'PDP Clean', value: 'pdp-clean', mood: 'premium-minimal' },
  { label: 'Premium Campaign', value: 'premium-campaign', mood: 'coffee-cinematic-luxury' },
  { label: 'Dark Roast Luxury', value: 'dark-roast-luxury', mood: 'dark-architectural' },
  { label: 'Modern Minimal', value: 'modern-minimal', mood: 'modern-commercial' },
  { label: 'Cold Brew Fresh', value: 'cold-brew-fresh', mood: 'morning-natural' },
  { label: 'Bundle Hero', value: 'bundle-hero', mood: 'ritual-editorial' },
];

const MOOD_OPTIONS: Array<{ label: string; value: CoffeeMoodModifier }> = [
  { label: 'Premium Minimal', value: 'premium-minimal' },
  { label: 'Color Pop Luxury', value: 'color-pop-luxury' },
  { label: 'Cinematic Luxury', value: 'coffee-cinematic-luxury' },
];

const SURFACE_OPTIONS: Array<{ label: string; value: SurfaceStyle; preset: string }> = [
  { label: 'Neutral Gradient', value: 'neutral-gradient', preset: 'Minimal Gradient' },
  { label: 'Dark Stone', value: 'dark-stone', preset: 'Dark Stone' },
  { label: 'Matte Wood', value: 'matte-wood', preset: 'Warm Wood Table' },
  { label: 'Concrete Minimal', value: 'concrete-minimal', preset: 'Concrete Minimal' },
  { label: 'Pure White PDP', value: 'pure-white-pdp', preset: 'Pure White PDP' },
];

const LIGHTING_OPTIONS: Array<{ label: string; value: 'warm-roast' | 'neutral-commercial' | 'cool-cold-brew'; tone: CoffeeLightingTone }> = [
  { label: 'Warm Roast', value: 'warm-roast', tone: 'warm-ambient' },
  { label: 'Neutral Commercial', value: 'neutral-commercial', tone: 'studio-balanced' },
  { label: 'Cool Cold Brew', value: 'cool-cold-brew', tone: 'high-contrast' },
];

export function CoffeePackagingModule() {
  const [isOpen, setIsOpen] = useState(true);

  // ── Store reads ──────────────────────────────────────────────────────────
  const coffeeAction = useProductStudioStore((s) => s.coffeeAction);
  const coffeeMoodModifier = useProductStudioStore((s) => s.coffeeMoodModifier);
  const coffeeSteamLevel = useProductStudioStore((s) => s.coffeeSteamLevel);
  const coffeeLiquidPhysics = useProductStudioStore((s) => s.coffeeLiquidPhysics);
  const coffeeConfig = useProductStudioStore((s) => (s as any).coffeeConfig ?? DEFAULT_COFFEE_CONFIG);

  // ── Store setters ────────────────────────────────────────────────────────
  const setCoffeeAction = useProductStudioStore((s) => s.setCoffeeAction);
  const setCoffeeMoodModifier = useProductStudioStore((s) => s.setCoffeeMoodModifier);
  const setCoffeeSteamLevel = useProductStudioStore((s) => s.setCoffeeSteamLevel);
  const setCoffeeLiquidPhysics = useProductStudioStore((s) => s.setCoffeeLiquidPhysics);
  const setContextPreset = useProductStudioStore((s) => s.setContextPreset);
  const setCoffeeConfig = useProductStudioStore((s) => (s as any).setCoffeeConfig as (patch: Partial<typeof coffeeConfig>) => void);

  // ── Derived ───────────────────────────────────────────────────────────────
  const selectedMood = useMemo<CoffeeMoodModifier>(() => {
    if (MOOD_OPTIONS.some((option) => option.value === coffeeMoodModifier)) {
      return coffeeMoodModifier;
    }
    return 'coffee-cinematic-luxury';
  }, [coffeeMoodModifier]);

  useEffect(() => {
    if (coffeeMoodModifier !== selectedMood) {
      setCoffeeMoodModifier(selectedMood);
    }
  }, [coffeeMoodModifier, setCoffeeMoodModifier, selectedMood]);

  const selectedIntent = useMemo(() => {
    if (coffeeConfig.intent) return coffeeConfig.intent as CoffeePackagingIntent;
    const fromMood = INTENT_OPTIONS.find((option) => option.mood === selectedMood);
    return fromMood?.value || 'premium-campaign';
  }, [coffeeConfig.intent, selectedMood]);

  const beansScatter = coffeeConfig.beansScatter ?? 'low';
  const cupAccent = coffeeConfig.cupAccent ?? 'side';
  const espressoSplash = coffeeConfig.espressoSplash ?? 'off';
  const iceCubes = coffeeConfig.iceMode ?? 'off';
  const selectedSurface = (coffeeConfig.surfaceStyle ?? 'neutral-gradient') as SurfaceStyle;
  const temperatureFeel = coffeeConfig.temperatureFeel ?? 'neutral-commercial';

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-4">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between text-left"
      >
        <p className="text-xs uppercase tracking-[0.2em] font-extrabold text-amber-700">COFFEE SETUP</p>
        <span className="text-[11px] font-semibold text-amber-700">{isOpen ? 'Hide' : 'Show'}</span>
      </button>

      {isOpen && (
        <div className="mt-4 space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-2">Mood Finish</p>
            <div className="flex flex-wrap gap-2">
              {MOOD_OPTIONS.map((option) => (
                <Chip
                  key={option.value}
                  selected={selectedMood === option.value}
                  onClick={() => setCoffeeMoodModifier(option.value)}
                >
                  {option.label}
                </Chip>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-2">Style Preset</p>
            <div className="flex flex-wrap gap-2">
              {INTENT_OPTIONS.map((option) => (
                <Chip
                  key={option.value}
                  selected={selectedIntent === option.value}
                  onClick={() => {
                    setCoffeeMoodModifier(option.mood);
                    if (option.value === 'cold-brew-fresh') {
                      setCoffeeSteamLevel('none');
                    }
                    setCoffeeConfig({ intent: option.value });
                  }}
                >
                  {option.label}
                </Chip>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-2">Serve Style</p>
            <div className="flex flex-wrap gap-2">
              {([
                { label: 'Static', value: 'static' },
                { label: 'Controlled Pour', value: 'controlled-pour' },
              ] as const).map((option) => (
                <Chip
                  key={option.value}
                  selected={coffeeAction === option.value}
                  onClick={() => setCoffeeAction(option.value)}
                >
                  {option.label}
                </Chip>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-2">Styling Accents</p>
            <div className="space-y-3">
              <div>
                <p className="text-[11px] text-gray-500 mb-1">Beans Scatter</p>
                <div className="flex flex-wrap gap-2">
                  {(['low', 'medium', 'high'] as const).map((value) => (
                    <Chip
                      key={value}
                      selected={beansScatter === value}
                      onClick={() => setCoffeeConfig({ beansScatter: value })}
                    >
                      {value.charAt(0).toUpperCase() + value.slice(1)}
                    </Chip>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[11px] text-gray-500 mb-1">Cup Accent</p>
                <div className="flex flex-wrap gap-2">
                  {([
                    { label: 'None', value: 'none' },
                    { label: 'Side', value: 'side' },
                    { label: 'Behind Small', value: 'behind-small' },
                  ] as const).map((option) => (
                    <Chip
                      key={option.value}
                      selected={cupAccent === option.value}
                      onClick={() => setCoffeeConfig({ cupAccent: option.value })}
                    >
                      {option.label}
                    </Chip>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[11px] text-gray-500 mb-1">Steam</p>
                <div className="flex flex-wrap gap-2">
                  {([
                    { label: 'Off', value: 'none' },
                    { label: 'Subtle', value: 'subtle' },
                  ] as const).map((option) => (
                    <Chip
                      key={option.value}
                      selected={coffeeSteamLevel === option.value}
                      onClick={() => setCoffeeSteamLevel(option.value)}
                    >
                      {option.label}
                    </Chip>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[11px] text-gray-500 mb-1">Espresso Splash</p>
                <div className="flex flex-wrap gap-2">
                  {([
                    { label: 'Off', value: 'off' },
                    { label: 'Controlled Only', value: 'controlled' },
                  ] as const).map((option) => (
                    <Chip
                      key={option.value}
                      selected={espressoSplash === option.value}
                      onClick={() => {
                        setCoffeeConfig({ espressoSplash: option.value });
                        if (option.value === 'controlled') setCoffeeAction('controlled-pour');
                      }}
                    >
                      {option.label}
                    </Chip>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[11px] text-gray-500 mb-1">Ice Cubes</p>
                <div className="flex flex-wrap gap-2">
                  {([
                    { label: 'Off', value: 'off' },
                    { label: 'Cold Mode Only', value: 'cold' },
                  ] as const).map((option) => (
                    <Chip
                      key={option.value}
                      selected={iceCubes === option.value}
                      onClick={() => {
                        setCoffeeConfig({ iceMode: option.value });
                        if (option.value === 'cold') setCoffeeSteamLevel('none');
                      }}
                    >
                      {option.label}
                    </Chip>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-2">Surface</p>
            <div className="flex flex-wrap gap-2">
              {SURFACE_OPTIONS.map((option) => (
                <Chip
                  key={option.value}
                  selected={selectedSurface === option.value}
                  onClick={() => {
                    setContextPreset(option.preset);
                    setCoffeeConfig({ surfaceStyle: option.value });
                  }}
                >
                  {option.label}
                </Chip>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-2">Lighting Tone</p>
            <div className="flex flex-wrap gap-2">
              {LIGHTING_OPTIONS.map((option) => (
                <Chip
                  key={option.value}
                  selected={temperatureFeel === option.value}
                  onClick={() => {
                    useProductStudioStore.getState().setCoffeeLightingTone(option.tone);
                    setCoffeeConfig({ temperatureFeel: option.value });
                  }}
                >
                  {option.label}
                </Chip>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-3">
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold">Liquid Control</p>
              <p className="text-[11px] text-gray-500">Keeps liquid behavior clean and packaging-safe.</p>
            </div>
            <SwitchToggle
              checked={coffeeLiquidPhysics}
              onCheckedChange={setCoffeeLiquidPhysics}
              aria-label="Toggle coffee liquid physics"
            />
          </div>
        </div>
      )}
    </div>
  );
}
