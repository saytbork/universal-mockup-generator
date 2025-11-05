import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { GoogleGenAI, Modality } from '@google/genai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '15mb' }));

// Basic rate limiting to avoid accidental abuse. Tune as needed.
const limiter = rateLimit({ windowMs: 60 * 1000, max: 30 });
app.use(limiter);

const API_KEY = process.env.GENERATIVE_API_KEY || process.env.API_KEY;
if (!API_KEY) {
  console.warn('Warning: GENERATIVE_API_KEY / API_KEY environment variable not set. Server will fail when trying to call the generative API.');
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.post('/api/generate-image', async (req, res) => {
  try {
    const { imageBase64, mimeType, prompt } = req.body;
    if (!imageBase64 || !prompt) return res.status(400).json({ error: 'Missing imageBase64 or prompt' });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: imageBase64, mimeType } },
          { text: prompt }
        ]
      },
      config: { responseModalities: [Modality.IMAGE] }
    });

    const candidate = response?.candidates?.[0];
    if (!candidate) return res.status(500).json({ error: 'No candidate returned by model' });

    for (const part of candidate.content.parts) {
      if (part.inlineData && part.inlineData.data) {
        return res.json({ imageBase64: part.inlineData.data, mimeType: part.inlineData.mimeType || 'image/png' });
      }
    }

    return res.status(500).json({ error: 'Model returned no image parts' });
  } catch (err) {
    console.error('generate-image error', err);
    return res.status(500).json({ error: String(err) });
  }
});

app.post('/api/edit-image', async (req, res) => {
  try {
    const { imageBase64, mimeType, prompt } = req.body;
    if (!imageBase64 || !prompt) return res.status(400).json({ error: 'Missing imageBase64 or prompt' });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: imageBase64, mimeType } },
          { text: prompt }
        ]
      },
      config: { responseModalities: [Modality.IMAGE] }
    });

    const candidate = response?.candidates?.[0];
    if (!candidate) return res.status(500).json({ error: 'No candidate returned by model' });

    for (const part of candidate.content.parts) {
      if (part.inlineData && part.inlineData.data) {
        return res.json({ imageBase64: part.inlineData.data, mimeType: part.inlineData.mimeType || 'image/png' });
      }
    }

    return res.status(500).json({ error: 'Model returned no image parts' });
  } catch (err) {
    console.error('edit-image error', err);
    return res.status(500).json({ error: String(err) });
  }
});

// Video generation: start generation and poll until done, then return the download URL.
app.post('/api/generate-video', async (req, res) => {
  try {
    const { imageBase64, mimeType, prompt, aspectRatio } = req.body;
    if (!imageBase64 || !prompt) return res.status(400).json({ error: 'Missing imageBase64 or prompt' });

    const getAspect = (ar) => {
      if (ar === '1:1') return '9:16';
      if (ar === '16:9' || ar === '9:16') return ar;
      return '16:9';
    };

    const operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt,
      image: { imageBytes: imageBase64, mimeType: mimeType || 'image/png' },
      config: { numberOfVideos: 1, resolution: '720p', aspectRatio: getAspect(aspectRatio) }
    });

    let op = operation;
    // Poll until done. Keep this conservative to avoid tight loop.
    while (!op.done) {
      // Wait 5s per poll to be less aggressive.
      await new Promise(r => setTimeout(r, 5000));
      op = await ai.operations.getVideosOperation({ operation: op });
    }

    if (op.error) return res.status(500).json({ error: op.error.message || 'Video generation failed' });

    const downloadUrl = op.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadUrl) return res.status(500).json({ error: 'No download URL provided' });

    // Return the URL so the frontend can fetch the video bytes.
    return res.json({ downloadUrl });
  } catch (err) {
    console.error('generate-video error', err);
    return res.status(500).json({ error: String(err) });
  }
});

const port = process.env.PORT || 8787;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
