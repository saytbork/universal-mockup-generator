import React, { useState } from 'react';
import { Chip } from '@/components/ui/Chip';
import { SwitchToggle } from '@/components/ui/SwitchToggle';
import type {
  CoffeeAction,
  CoffeeMode,
  CoffeeLightingTone,
  CoffeeMoodModifier,
  CoffeeSteamLevel,
} from '@/lib/productStudio/types';

type CoffeeModuleProps = {
  coffeeMode: CoffeeMode;
  coffeeAction: CoffeeAction;
  contextPreset: string;
  coffeeLightingTone: CoffeeLightingTone;
  coffeeMoodModifier: CoffeeMoodModifier;
  coffeeSteamLevel: CoffeeSteamLevel;
  coffeeLiquidPhysics: boolean;
  onCoffeeModeChange: (mode: CoffeeMode) => void;
  onCoffeeActionChange: (action: CoffeeAction) => void;
  onContextPresetChange: (preset: string) => void;
  onCoffeeLightingToneChange: (tone: CoffeeLightingTone) => void;
  onCoffeeMoodModifierChange: (modifier: CoffeeMoodModifier) => void;
  onCoffeeSteamLevelChange: (level: CoffeeSteamLevel) => void;
  onCoffeeLiquidPhysicsChange: (enabled: boolean) => void;
};

const COFFEE_ACTION_OPTIONS: Array<{ label: string; value: CoffeeAction }> = [
  { label: 'Static', value: 'static' },
  { label: 'Controlled Pour', value: 'controlled-pour' },
];

const COFFEE_MODE_OPTIONS: Array<{ label: string; value: CoffeeMode }> = [
  { label: 'Studio Product', value: 'studio' },
  { label: 'Ritual Lifestyle', value: 'ritual' },
];

const COFFEE_LIGHTING_TONE_STUDIO_OPTIONS: Array<{ label: string; value: CoffeeLightingTone }> = [
  { label: 'Studio Balanced', value: 'studio-balanced' },
  { label: 'High Contrast', value: 'high-contrast' },
];

const COFFEE_LIGHTING_TONE_RITUAL_OPTIONS: Array<{ label: string; value: CoffeeLightingTone }> = [
  { label: 'Warm Ambient', value: 'warm-ambient' },
  { label: 'Studio Balanced', value: 'studio-balanced' },
];

const COFFEE_MOOD_STUDIO_OPTIONS: Array<{ label: string; value: CoffeeMoodModifier }> = [
  { label: 'Color Pop Luxury', value: 'color-pop-luxury' },
  { label: 'Modern Commercial', value: 'modern-commercial' },
  { label: 'Premium Minimal', value: 'premium-minimal' },
];

const COFFEE_MOOD_RITUAL_OPTIONS: Array<{ label: string; value: CoffeeMoodModifier }> = [
  { label: 'Ritual Editorial', value: 'ritual-editorial' },
  { label: 'Morning Natural', value: 'morning-natural' },
  { label: 'Dark Architectural', value: 'dark-architectural' },
];

const COFFEE_STEAM_LEVEL_OPTIONS: Array<{ label: string; value: CoffeeSteamLevel }> = [
  { label: 'None', value: 'none' },
  { label: 'Subtle', value: 'subtle' },
  { label: 'Visible', value: 'visible' },
];

export function CoffeeModule({
  coffeeMode,
  coffeeAction,
  contextPreset,
  coffeeLightingTone,
  coffeeMoodModifier,
  coffeeSteamLevel,
  coffeeLiquidPhysics,
  onCoffeeModeChange,
  onCoffeeActionChange,
  onContextPresetChange,
  onCoffeeLightingToneChange,
  onCoffeeMoodModifierChange,
  onCoffeeSteamLevelChange,
  onCoffeeLiquidPhysicsChange,
}: CoffeeModuleProps) {
  const [isOpen, setIsOpen] = useState(true);
  const isStudioMode = coffeeMode === 'studio';
  const environmentOptions = isStudioMode
    ? ['Color Pop Studio', 'Minimal Gradient', 'Black Studio']
    : ['Sunlit Window', 'Morning Ritual', 'Warm Wood Table', 'Dark Café Mood'];
  const lightingOptions = isStudioMode
    ? COFFEE_LIGHTING_TONE_STUDIO_OPTIONS
    : COFFEE_LIGHTING_TONE_RITUAL_OPTIONS;
  const moodOptions = isStudioMode ? COFFEE_MOOD_STUDIO_OPTIONS : COFFEE_MOOD_RITUAL_OPTIONS;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between text-left"
      >
        <p className="text-xs uppercase tracking-[0.2em] font-extrabold text-gray-500">COFFEE MODULE</p>
        <span className="text-[11px] font-semibold text-gray-500">{isOpen ? 'Hide' : 'Show'}</span>
      </button>

      {isOpen && (
        <div className="mt-4 space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-2">Coffee Mode</p>
            <div className="flex flex-wrap gap-2">
              {COFFEE_MODE_OPTIONS.map((option) => (
                <Chip
                  key={option.value}
                  selected={coffeeMode === option.value}
                  onClick={() => onCoffeeModeChange(option.value)}
                >
                  {option.label}
                </Chip>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-2">Coffee Action</p>
            <div className="flex flex-wrap gap-2">
              {COFFEE_ACTION_OPTIONS.map((option) => (
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
            <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-2">Environment Preset</p>
            <div className="flex flex-wrap gap-2">
              {environmentOptions.map((preset) => (
                <Chip
                  key={preset}
                  selected={String(contextPreset || '').trim() === preset}
                  onClick={() => onContextPresetChange(preset)}
                >
                  {preset}
                </Chip>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-2">Lighting Tone</p>
            <div className="flex flex-wrap gap-2">
              {lightingOptions.map((option) => (
                <Chip
                  key={option.value}
                  selected={coffeeLightingTone === option.value}
                  onClick={() => onCoffeeLightingToneChange(option.value)}
                >
                  {option.label}
                </Chip>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-2">Mood Modifier</p>
            <div className="flex flex-wrap gap-2">
              {moodOptions.map((option) => (
                <Chip
                  key={option.value}
                  selected={coffeeMoodModifier === option.value}
                  onClick={() => onCoffeeMoodModifierChange(option.value)}
                >
                  {option.label}
                </Chip>
              ))}
            </div>
          </div>

          {!isStudioMode && (
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold mb-2">Steam Level</p>
              <div className="flex flex-wrap gap-2">
                {COFFEE_STEAM_LEVEL_OPTIONS.map((option) => (
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
          )}

          <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-3">
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-gray-500 font-semibold">Liquid Physics</p>
              <p className="text-[11px] text-gray-500">Enable coffee liquid physics layer injection.</p>
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
