export type ProductId = 'sino_clear' | 'mullein_tea' | 'breathe';

export interface BundleDefinition {
  name: string;
  products: ProductId[];
}

export interface ProductMediaMeta {
  label: string;
  imageUrl: string;
}

export type ProductMediaLibrary = Record<ProductId, ProductMediaMeta>;

export const PRODUCT_MEDIA_LIBRARY: ProductMediaLibrary = {
  sino_clear: {
    label: 'Product Slot A',
    imageUrl: 'https://placehold.co/200x260?text=Product+A',
  },
  mullein_tea: {
    label: 'Product Slot B',
    imageUrl: 'https://placehold.co/200x260?text=Product+B',
  },
  breathe: {
    label: 'Product Slot C',
    imageUrl: 'https://placehold.co/200x260?text=Product+C',
  },
};

export const PREMADE_BUNDLES: Record<string, BundleDefinition> = {
  respiratory_support: {
    name: 'Respiratory Support Pack',
    products: ['sino_clear', 'mullein_tea', 'breathe'],
  },
  detox_relief: {
    name: 'Detox + Clear Pack',
    products: ['mullein_tea', 'breathe'],
  },
  full_clearing_kit: {
    name: 'Full Clearing Kit',
    products: ['sino_clear', 'breathe', 'mullein_tea'],
  },
};

export const ALL_PRODUCT_IDS: ProductId[] = Object.keys(PRODUCT_MEDIA_LIBRARY) as ProductId[];
