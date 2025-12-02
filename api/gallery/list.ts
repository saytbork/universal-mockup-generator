import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getFirestore } from '../../services/firebaseAdmin.js';

type GalleryDoc = {
  imageUrl?: string;
  planType?: string;
  createdAt?: { toMillis?: () => number; toDate?: () => Date } | number | null;
};

type GalleryImageResponse = {
  id: string;
  url: string;
  plan: string;
  createdAt: number | null;
};

const toMillis = (value: GalleryDoc['createdAt']): number | null => {
  if (!value) return null;
  if (typeof value === 'number') return value;
  if (typeof value.toMillis === 'function') {
    return value.toMillis();
  }
  if (typeof value.toDate === 'function') {
    return value.toDate().getTime();
  }
  return null;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const db = getFirestore();
    const snapshot = await db
      .collection('community_gallery')
      .orderBy('createdAt', 'desc')
      .limit(40)
      .get();
    const images = snapshot.docs
      .map(doc => {
        const data = doc.data() as GalleryDoc;
        const url = typeof data.imageUrl === 'string' ? data.imageUrl.trim() : '';
        if (!url) return null;
        return {
          id: doc.id,
          url,
          plan: data.planType ?? 'free',
          createdAt: toMillis(data.createdAt),
        } as GalleryImageResponse;
      })
      .filter((image): image is GalleryImageResponse => Boolean(image));
    res.status(200).json({ images });
  } catch (error) {
    console.error('Failed to fetch gallery list', error);
    res.status(500).json({ error: 'Unable to fetch gallery images' });
  }
}
