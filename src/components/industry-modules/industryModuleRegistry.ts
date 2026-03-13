import { CoffeePackagingModule } from './CoffeePackagingModule';
import { SupplementsModule } from './SupplementsModule';
import { WineModule } from './WineModule';

export const industryModuleRegistry = {
  supplements: SupplementsModule,
  wine: WineModule,
  coffee: CoffeePackagingModule,
} as const;
