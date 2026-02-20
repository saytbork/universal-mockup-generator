import type { IndustryProfile } from '@/lib/productStudio/types';

export type ProductStoreType = {
  setWineAction: (action: 'static-presentation' | 'controlled-pour') => void;
  setWinePourStyle: (style: 'slow-ribbon' | 'mid-flow-elegance' | 'peak-glass-impact') => void;
  setWineLightingTone: (tone: 'Warm Lateral' | 'Golden Ambient' | 'Cellar Dramatic' | 'Candle Intimate') => void;
  setWineMoodModifier: (
    modifier:
      | 'None'
      | 'Vintage Film Grain'
      | 'Terroir Mood Tone'
      | 'Deep Burgundy Contrast Boost'
      | 'Soft Barrel Ambient Haze'
      | 'Elegant Reflection Layer'
  ) => void;
};

export function resetIndustryFields(nextProfile: IndustryProfile, store: ProductStoreType) {
  if (nextProfile !== 'wine') {
    store.setWineAction('static-presentation');
    store.setWinePourStyle('mid-flow-elegance');
    store.setWineLightingTone('Warm Lateral');
    store.setWineMoodModifier('None');
  }
}
