import { CoffeePackagingModule } from './CoffeePackagingModule';
import { WineModule } from './WineModule';

export const industryModuleRegistry = {
  wine: WineModule,
  coffee: CoffeePackagingModule,
} as const;
