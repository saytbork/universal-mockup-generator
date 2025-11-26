import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleAuth } from 'google-auth-library';
import { GoogleGenAI, Modality } from '@google/genai';
import { checkAndConsumeCredit } from './utils/credits.js';
import fetch from 'node-fetch';
import { supabaseServer } from '../supabaseServer.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const project = process.env.GCP_PROJECT_ID || process.env.VERTEX_PROJECT_ID;
  const location = process.env.GCP_LOCATION || process.env.VERTEX_LOCATION || 'us-central1';
  const saJson = process.env.GCP_SERVICE_ACCOUNT_KEY;

  const replicateToken = process.env.REPLICATE_API_TOKEN;
  const replicateModel = process.env.REPLICATE_MODEL || 'black-forest-labs/flux-schnell';
  const replicateVersion =
    process.env.REPLICATE_MODEL_VERSION ||
    'de67bb1367180e6c8c5b8e3a1391c72a7c8caa0c1b6b5be825e062e10bb126d9';

  const imageEngine = (process.env.IMAGE_ENGINE || 'gemini').toLowerCase(); // gemini | replicate | vertex | auto
  const geminiApiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  const geminiImageModel = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image';
  const vertexImageModel = process.env.GCP_IMAGE_MODEL || 'imagen-3.0-generate-001';

  const negativePrompt =
    'nudity, sexual content, pornography, gore, violence, weapons, blood, minors, explicit content, suggestive poses, regulated content, drugs, smoking, vape, alcohol, self-harm, brutality, hate, offensive, bikini, lingerie';

  const sanitizePrompt = (raw: string): string => {
    const banned = [
      'nude', 'naked', 'lingerie', 'bikini', 'swimsuit', 'sexy', 'explicit', 'erotic',
      'blood', 'gore', 'weapon', 'gun', 'knife', 'violence', 'drugs', 'smoking', 'vape',
      'alcohol', 'minor', 'child', 'kid', 'teen',
    ];
    let safe = raw || '';
    banned.forEach(word => {
      const re = new RegExp(word, 'gi');
      safe = safe.replace(re, '');
    });
    return safe.trim();
  };

  try {
    const { base64, mimeType, prompt = '' } = req.body || {};

    if (!prompt) {
      return res.status(400).json({ error: 'Missing required parameter: prompt.' });
    }

    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      return res.status(401).json({ message: 'No autorizado. Debes iniciar sesión.' });
    }
    const { data: userData, error: userError } = await supabaseServer.auth.getUser(token);
    if (userError || !userData?.user) {
      return res.status(401).json({ message: 'No autorizado. Token inválido.' });
    }
    const userId = userData.user.id;

    await checkAndConsumeCredit(userId);

    const safePrompt = `Safe, fully clothed, professional lifestyle/editorial product photo. ${sanitizePrompt(prompt)}`;

    const allowGemini = imageEngine === 'gemini' || imageEngine === 'auto';
    const allowReplicate = imageEngine === 'replicate' && Boolean(replicateToken);
    const allowVertex = imageEngine === 'vertex' && Boolean(project) && Boolean(saJson);

    // 0) Gemini first
    if (allowGemini) {
      if (!geminiApiKey) {
        throw new Error('Missing GEMINI_API_KEY for Gemini image generation.');
      }
      try {
        const ai = new GoogleGenAI({ apiKey: geminiApiKey, apiVersion: 'v1beta' });
    const response = await ai.models.generateContent({
      model: geminiImageModel,
      contents: {
        parts: [
          { inlineData: { data: base64, mimeType: mimeType || 'image/png' } },
          { text: safePrompt },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

        const imagePart = response.candidates?.[0]?.content?.parts?.find(p => (p as any).inlineData);
        const imageData = (imagePart as any)?.inlineData?.data;
        if (imageData) {
          const imageUrl = `data:image/png;base64,${imageData}`;
          return res.status(200).json({ imageUrl, promptUsed: safePrompt });
        }
        console.warn('Gemini returned no image, falling back to other engines');
      } catch (err) {
        console.warn('Gemini image generation failed, falling back:', err);
      }
    }

    // 1) Replicate (Flux) if chosen
    if (allowReplicate && replicateToken) {
      try {
        const start = await fetch('https://api.replicate.com/v1/predictions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${replicateToken}`,
          },
          body: JSON.stringify({
            version: replicateVersion,
            input: {
              prompt: safePrompt,
              width: 1024,
              height: 1024,
              guidance_scale: 3,
              negative_prompt: negativePrompt,
            },
          }),
        });
        const startData = await start.json().catch(() => ({}));
        if (!start.ok) {
          throw new Error(startData?.error?.message || 'Replicate request failed');
        }
        const predictionId = startData.id;
        let status = startData.status;
        let output: any = startData.output;
        while (!['succeeded', 'failed', 'canceled'].includes(status)) {
          await new Promise(r => setTimeout(r, 3000));
          const poll = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
            headers: { Authorization: `Bearer ${replicateToken}` },
          });
          const pollData = await poll.json().catch(() => ({}));
          status = pollData.status;
          output = pollData.output;
          if (status === 'failed' || status === 'canceled') {
            throw new Error(pollData?.error || 'Replicate generation failed');
          }
        }
        const imageUrl = Array.isArray(output) ? output[0] : null;
        if (imageUrl) {
          return res.status(200).json({ imageUrl, promptUsed: safePrompt });
        }
        console.warn('Replicate returned no image, falling back to Vertex');
      } catch (err) {
        console.warn('Replicate failed, falling back:', err);
      }
    }

    // 2) Vertex fallback if explicitly enabled
    if (!allowVertex) {
      throw new Error('Image generation failed for Gemini/Replicate and Vertex is disabled.');
    }
    if (!project || !saJson) {
      throw new Error('Missing GCP_PROJECT_ID or GCP_SERVICE_ACCOUNT_KEY for Vertex fallback.');
    }

    const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${project}/locations/${location}/publishers/google/models/${vertexImageModel}:predict`;
    const instance: Record<string, any> = {
      prompt: `${safePrompt}\nNo sexual content, no violence, no weapons, no blood, no minors. Keep it safe lifestyle/editorial.`,
      negativePrompt,
    };
    if (base64) {
      instance.image = { bytesBase64Encoded: base64, mimeType: mimeType || 'image/png' };
    }
    const body = {
      instances: [instance],
      parameters: {
        sampleCount: 1,
        aspectRatio: '1:1',
        negativePrompt,
      },
    };
    const auth = new GoogleAuth({
      credentials: JSON.parse(saJson),
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    const client = await auth.getClient();
    const token = await client.getAccessToken();
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.token}`,
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Vertex AI Error Response:', errorText);
      throw new Error(`Vertex AI Error: ${response.status} ${response.statusText} - ${errorText}`);
    }
    const data = await response.json();
    const prediction = data?.predictions?.[0];
    let imageBase64 = prediction?.bytesBase64Encoded;
    if (!imageBase64 && prediction?.structValue?.fields?.image?.stringValue) {
      imageBase64 = prediction.structValue.fields.image.stringValue;
    }
    if (!imageBase64) {
      console.error('Vertex AI Response Data:', JSON.stringify(data, null, 2));
      throw new Error('No image returned from Vertex Imagen.');
    }
    const imageUrl = `data:image/png;base64,${imageBase64}`;
    return res.status(200).json({ imageUrl, promptUsed: safePrompt });

  } catch (error) {
    console.error('Error in /api/generate-image:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return res.status(500).json({ error: errorMessage });
  }
}
