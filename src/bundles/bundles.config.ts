export type ProductId = string;

export interface BundleDefinition {
  name: string;
  products: ProductId[];
}

export interface ProductMediaMeta {
  label: string;
  imageUrl: string;
}

export type ProductMediaLibrary = Record<ProductId, ProductMediaMeta>;

const DEFAULT_PRODUCT_SLOTS = ['product_1', 'product_2', 'product_3', 'product_4', 'product_5', 'product_6'] as const;

export const PRODUCT_MEDIA_LIBRARY: ProductMediaLibrary = DEFAULT_PRODUCT_SLOTS.reduce<ProductMediaLibrary>(
  (acc, slot, index) => {
    acc[slot] = {
      label: `Product Slot ${index + 1}`,
      imageUrl: `https://placehold.co/200x260?text=Slot+${index + 1}`,
    };
    return acc;
  },
  {} as ProductMediaLibrary
);

export const PREMADE_BUNDLES: Record<string, BundleDefinition> = {
  essentials_trio: {
    name: 'Core Essentials Trio',
    products: ['product_1', 'product_2', 'product_3'],
  },
  daily_duo: {
    name: 'Daily Duo Stack',
    products: ['product_1', 'product_2'],
  },
  launch_showcase: {
    name: 'Launch Showcase Set',
    products: ['product_1', 'product_2', 'product_3', 'product_4'],
  },
  hero_lineup: {
    name: 'Complete Hero Lineup',
    products: ['product_1', 'product_2', 'product_3', 'product_4', 'product_5'],
  },
};

export const ALL_PRODUCT_IDS: ProductId[] = [...DEFAULT_PRODUCT_SLOTS];
