import type { VercelRequest, VercelResponse } from '@vercel/node';

type GalleryItem = {
  id: string;
  imageUrl: string;
  title: string;
  createdAt: number;
  plan: string;
  public: boolean;
};

const galleryStore: GalleryItem[] = [];

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const items = galleryStore
      .filter(item => item.public)
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 30);
    return res.status(200).json({ items });
  }

  if (req.method === 'POST') {
    const { imageUrl, title, plan } = req.body || {};
    if (!imageUrl) {
      return res.status(400).json({ error: 'Missing imageUrl' });
    }
    const id = `g-${Math.random().toString(36).slice(2, 9)}`;
    galleryStore.unshift({
      id,
      imageUrl,
      title: title || 'Free plan generation',
      createdAt: Date.now(),
      plan: plan || 'free',
      public: true,
    });
    if (galleryStore.length > 200) {
      galleryStore.pop();
    }
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
