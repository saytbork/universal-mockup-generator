import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';

type GalleryImage = {
  id: string;
  url: string;
  plan?: string;
  createdAt?: number;
  userId?: string;
  aspectRatio?: string;
  productMaterial?: string;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const raw = await kv.lrange('community_gallery', 0, -1);
    const images: GalleryImage[] = raw
      .map(item => {
        try {
          return JSON.parse(item) as GalleryImage;
        } catch {
          return null;
        }
      })
      .filter((item): item is GalleryImage => Boolean(item?.url));
    res.status(200).json({ images });
  } catch (error: any) {
    console.error('Failed to fetch gallery list', error);
    res.status(500).json({ error: error?.message ?? 'Unable to fetch gallery images' });
  }
}
