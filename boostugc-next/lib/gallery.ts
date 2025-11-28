export type GalleryItem = {
  id: string;
  imageUrl: string;
  title: string;
  createdAt: number;
  public: boolean;
  plan: string;
};

const galleryStore: GalleryItem[] = [
  {
    id: "demo-1",
    imageUrl:
      "https://images.unsplash.com/photo-1581338834647-b0fb40704e21?auto=format&fit=crop&w=1200&q=80",
    title: "Beauty serum · Hero landing",
    createdAt: Date.now() - 1000 * 60 * 60 * 6,
    public: true,
    plan: "free",
  },
  {
    id: "demo-2",
    imageUrl:
      "https://images.unsplash.com/photo-1512499385554-079eba9be8e9?auto=format&fit=crop&w=1200&q=80",
    title: "Coffee on the go · UGC lifestyle",
    createdAt: Date.now() - 1000 * 60 * 60 * 12,
    public: true,
    plan: "free",
  },
  {
    id: "demo-3",
    imageUrl:
      "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1200&q=80",
    title: "Tabletop tech · Product photo",
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
    public: true,
    plan: "free",
  },
];

export const addGalleryItem = (item: GalleryItem) => {
  galleryStore.unshift(item);
  if (galleryStore.length > 200) {
    galleryStore.pop();
  }
};

export const getPublicGallery = () =>
  galleryStore.filter((g) => g.public).slice(0, 30);
