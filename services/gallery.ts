import { kv } from '@vercel/kv';
import { randomUUID } from 'crypto';

export type GalleryPlan = 'trial' | 'access' | string;

export const shouldAddToGallery = (plan: string) => {
  const normalized = plan?.toLowerCase();
  return normalized === 'free' || normalized === 'access';
};

export const saveGeneratedImageToGallery = async (finalUrl: string, plan: string) => {
  if (!shouldAddToGallery(plan)) return;
  const entry = {
    id: randomUUID(),
    url: finalUrl,
    plan: plan.toLowerCase(),
    public: true,
    timestamp: Date.now(),
  };
  await kv.rpush('community_gallery', JSON.stringify(entry));
};

export const clearGalleryImages = async () => {
  await kv.del('community_gallery');
};
