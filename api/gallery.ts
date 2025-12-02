import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';
import { saveGeneratedImageToGallery, clearGalleryImages } from '../services/gallery.js';

type GalleryEntry = {
  id: string;
  url: string;
  plan?: string;
  public?: boolean;
  timestamp?: number;
};

const parseAction = (req: VercelRequest) => {
  const raw = req.query.action;
  if (Array.isArray(raw)) {
    return raw[0]?.toString() ?? '';
  }
  return typeof raw === 'string' ? raw : '';
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const action = parseAction(req).toLowerCase();

  switch (action) {
    case 'list': {
      if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET');
        res.status(405).json({ error: 'Method not allowed' });
        return;
      }
      try {
        const raw = await kv.lrange('community_gallery', 0, -1);
        const images: GalleryEntry[] = raw
          .map(item => {
            try {
              return JSON.parse(item) as GalleryEntry;
            } catch {
              return null;
            }
          })
          .filter((entry): entry is GalleryEntry => Boolean(entry?.public && entry?.url));
        res.status(200).json({ images });
      } catch (error: any) {
        console.error('Failed to fetch gallery list', error);
        res.status(500).json({ error: error?.message ?? 'Unable to fetch gallery images' });
      }
      return;
    }
    case 'add': {
      if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        res.status(405).json({ error: 'Method not allowed' });
        return;
      }
      const { url, imageUrl, plan } = req.body || {};
      const finalUrl = typeof url === 'string' ? url : imageUrl;
      if (!finalUrl || typeof finalUrl !== 'string') {
        res.status(400).json({ error: 'Missing imageUrl' });
        return;
      }
      if (!plan || typeof plan !== 'string') {
        res.status(400).json({ error: 'Missing plan' });
        return;
      }
      try {
        await saveGeneratedImageToGallery(imageUrl.trim(), plan);
        res.status(201).json({ success: true });
      } catch (error: any) {
        console.error('Failed to save community gallery image', error);
        res.status(500).json({ error: 'Unable to save community image' });
      }
      return;
    }
    case 'clear': {
      if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        res.status(405).json({ error: 'Method not allowed' });
        return;
      }
      try {
        await clearGalleryImages();
        res.status(200).json({ ok: true });
      } catch (error: any) {
        console.error('Failed to clear gallery', error);
        res.status(500).json({ error: error?.message ?? 'Unable to clear gallery images' });
      }
      return;
    }
    default:
      res.status(400).json({ error: 'Invalid action' });
  }
}
