import { CoffeeModule } from './CoffeeModule';
import { WineModule } from './WineModule';

export const industryModuleRegistry = {
  wine: WineModule,
  coffee: CoffeeModule,
} as const;
