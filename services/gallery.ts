import { kv } from '@vercel/kv';
import { randomUUID } from 'crypto';

export type GalleryPlan = string;

export const shouldAddToGallery = (plan: string | undefined) => {
  return Boolean(plan);
};

export const saveGeneratedImageToGallery = async (
  finalUrl: string,
  plan: string,
  compositionMode?: string
) => {
  if (!shouldAddToGallery(plan)) return;
  const entry = {
    id: randomUUID(),
    url: finalUrl,
    plan: plan.toLowerCase(),
    compositionMode,
    public: true,
    timestamp: Date.now(),
  };
  await kv.rpush('community_gallery', JSON.stringify(entry));
};

export const clearGalleryImages = async () => {
  await kv.del('community_gallery');
};
