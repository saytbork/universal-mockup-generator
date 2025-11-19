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
    label: 'Sino Clear',
    imageUrl: 'https://placehold.co/200x260?text=Sino+Clear',
  },
  mullein_tea: {
    label: 'Mullein Tea',
    imageUrl: 'https://placehold.co/200x260?text=Mullein+Tea',
  },
  breathe: {
    label: 'Breathe Tincture',
    imageUrl: 'https://placehold.co/200x260?text=Breathe',
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
