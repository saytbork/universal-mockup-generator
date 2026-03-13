import React, { useEffect, useMemo, useState } from 'react';
import { Chip } from '@/components/ui/Chip';
import { SwitchToggle } from '@/components/ui/SwitchToggle';
import type {
  CoffeeAction,
  CoffeeLightingTone,
  CoffeeMoodModifier,
  CoffeeSteamLevel,
} from '@/lib/productStudio/types';

type CoffeePackagingIntent =
  | 'pdp-clean'
  | 'premium-campaign'
  | 'dark-roast-luxury'
  | 'modern-minimal'
  | 'cold-brew-fresh'
  | 'bundle-hero';

type BeansScatterLevel = 'low' | 'medium' | 'high';
type CupAccentLevel = 'none' | 'side' | 'behind-small';
type SurfaceStyle =
  | 'neutral-gradient'
  | 'dark-stone'
  | 'matte-wood'
  | 'concrete-minimal'
  | 'pure-white-pdp';
type TemperatureFeel = 'warm-roast' | 'neutral-commercial' | 'cool-cold-brew';

type CoffeePackagingModuleProps = {
  coffeeAction: CoffeeAction;
  contextPreset: string;
  coffeeLightingTone: CoffeeLightingTone;
  coffeeMoodModifier: CoffeeMoodModifier;
  coffeeSteamLevel: CoffeeSteamLevel;
  coffeeLiquidPhysics: boolean;
  propsValue: string;
  onCoffeeActionChange: (action: CoffeeAction) => void;
  onContextPresetChange: (preset: string) => void;
  onCoffeeLightingToneChange: (tone: CoffeeLightingTone) => void;
  onCoffeeMoodModifierChange: (modifier: CoffeeMoodModifier) => void;
  onCoffeeSteamLevelChange: (level: CoffeeSteamLevel) => void;
  onCoffeeLiquidPhysicsChange: (enabled: boolean) => void;
  onPropsValueChange: (next: string) => void;
};

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

const extractTag = (input: string, key: string, fallback: string): string => {
  const match = String(input || '').match(new RegExp(`coffee:${key}=([a-z0-9-]+)`, 'i'));
  return match?.[1]?.toLowerCase() || fallback;
};

const upsertTag = (input: string, key: string, value: string): string => {
  const segments = String(input || '')
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((s) => !new RegExp(`^coffee:${key}=`, 'i').test(s));
  segments.push(`coffee:${key}=${value}`);
  return segments.join(' | ');
};

export function CoffeePackagingModule({
  coffeeAction,
  contextPreset,
  coffeeLightingTone,
  coffeeMoodModifier,
  coffeeSteamLevel,
  coffeeLiquidPhysics,
  propsValue,
  onCoffeeActionChange,
  onContextPresetChange,
  onCoffeeLightingToneChange,
  onCoffeeMoodModifierChange,
  onCoffeeSteamLevelChange,
  onCoffeeLiquidPhysicsChange,
  onPropsValueChange,
}: CoffeePackagingModuleProps) {
  const [isOpen, setIsOpen] = useState(true);
  const selectedMood = useMemo<CoffeeMoodModifier>(() => {
    if (MOOD_OPTIONS.some((option) => option.value === coffeeMoodModifier)) {
      return coffeeMoodModifier;
    }
    return 'coffee-cinematic-luxury';
  }, [coffeeMoodModifier]);

  useEffect(() => {
    if (coffeeMoodModifier !== selectedMood) {
      onCoffeeMoodModifierChange(selectedMood);
    }
  }, [coffeeMoodModifier, onCoffeeMoodModifierChange, selectedMood]);

  const selectedIntent = useMemo(() => {
    const fromTag = extractTag(propsValue, 'intent', '');
    if (fromTag) return fromTag as CoffeePackagingIntent;
    const fromMood = INTENT_OPTIONS.find((option) => option.mood === selectedMood);
    return fromMood?.value || 'premium-campaign';
  }, [propsValue, selectedMood]);

  const beansScatter = extractTag(propsValue, 'beans', 'low') as BeansScatterLevel;
  const cupAccent = extractTag(propsValue, 'cup', 'side') as CupAccentLevel;
  const espressoSplash = extractTag(propsValue, 'splash', 'off');
  const iceCubes = extractTag(propsValue, 'ice', 'off');
  const selectedSurface = extractTag(propsValue, 'surface', 'neutral-gradient') as SurfaceStyle;
  const temperatureFeel = extractTag(propsValue, 'temp', 'neutral-commercial') as TemperatureFeel;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between text-left"
      >
        <p className="text-xs uppercase tracking-[0.2em] font-extrabold text-gray-500">COFFEE SETUP</p>
        <span className="text-[11px] font-semibold text-gray-500">{isOpen ? 'Hide' : 'Show'}</span>
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
                  onClick={() => onCoffeeMoodModifierChange(option.value)}
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
                    onCoffeeMoodModifierChange(option.mood);
                    if (option.value === 'cold-brew-fresh') {
                      onCoffeeSteamLevelChange('none');
                    }
                    onPropsValueChange(upsertTag(propsValue, 'intent', option.value));
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
                  onClick={() => onCoffeeActionChange(option.value)}
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
                      onClick={() => onPropsValueChange(upsertTag(propsValue, 'beans', value))}
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
                      onClick={() => onPropsValueChange(upsertTag(propsValue, 'cup', option.value))}
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
                      onClick={() => onCoffeeSteamLevelChange(option.value)}
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
                        onPropsValueChange(upsertTag(propsValue, 'splash', option.value));
                        if (option.value === 'controlled') onCoffeeActionChange('controlled-pour');
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
                        onPropsValueChange(upsertTag(propsValue, 'ice', option.value));
                        if (option.value === 'cold') onCoffeeSteamLevelChange('none');
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
                    onContextPresetChange(option.preset);
                    onPropsValueChange(upsertTag(propsValue, 'surface', option.value));
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
              {([
                { label: 'Warm Roast', value: 'warm-roast', tone: 'warm-ambient' as CoffeeLightingTone },
                { label: 'Neutral Commercial', value: 'neutral-commercial', tone: 'studio-balanced' as CoffeeLightingTone },
                { label: 'Cool Cold Brew', value: 'cool-cold-brew', tone: 'high-contrast' as CoffeeLightingTone },
              ] as const).map((option) => (
                <Chip
                  key={option.value}
                  selected={temperatureFeel === option.value}
                  onClick={() => {
                    onCoffeeLightingToneChange(option.tone);
                    onPropsValueChange(upsertTag(propsValue, 'temp', option.value));
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
              onCheckedChange={onCoffeeLiquidPhysicsChange}
              aria-label="Toggle coffee liquid physics"
            />
          </div>
        </div>
      )}
    </div>
  );
}
