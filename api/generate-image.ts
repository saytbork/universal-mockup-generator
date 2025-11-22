import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleAuth } from 'google-auth-library';
import { GoogleGenAI } from "@google/genai";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const project = process.env.GCP_PROJECT_ID || process.env.VERTEX_PROJECT_ID;
  const location = process.env.GCP_LOCATION || process.env.VERTEX_LOCATION || 'us-central1';
  const saJson = process.env.GCP_SERVICE_ACCOUNT_KEY;
  const replicateToken = process.env.REPLICATE_API_TOKEN;
  const replicateModel = process.env.REPLICATE_MODEL || 'black-forest-labs/flux-pro-1.1';
  const replicateVersion =
    process.env.REPLICATE_MODEL_VERSION ||
    'c470cc1a2232c8f8997c7a1e3a07c5c612200a60c9a0127b0c5e4a94fc35693f';
  const vertexImageModel = process.env.GCP_IMAGE_MODEL || 'imagen-3.0-generate-002';
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const negativePrompt =
    'nudity, sexual content, pornography, gore, violence, weapons, blood, minors, explicit content, suggestive poses, regulated content, drugs, smoking, vape, alcohol, self-harm, brutality, hate, offensive, bikini, lingerie';

  const sanitizePrompt = (raw: string): string => {
    const banned = [
      'nude', 'naked', 'lingerie', 'bikini', 'swimsuit', 'sexy', 'explicit', 'erotic',
      'blood', 'gore', 'weapon', 'gun', 'knife', 'violence', 'drugs', 'smoking', 'vape',
      'alcohol', 'minor', 'child', 'kid', 'teen'
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

    let enhancedPrompt = sanitizePrompt(prompt);

    // Enhance prompt with Gemini if available
    if (geminiApiKey) {
      try {
        // Fix: GoogleGenAI SDK usage might differ based on version. 
        // Assuming @google/genai v0.x or similar where it might be different.
        // Checking package.json, it is ^1.27.0.
        // In 1.x, it is usually `const genAI = new GoogleGenerativeAI(apiKey); const model = genAI.getGenerativeModel(...)`
        // But the import is `import { GoogleGenAI } from "@google/genai";` which suggests the new SDK.
        // Let's check the import in `api/generate-video.ts` which was working.
        // It used `import { GoogleGenAI } from "@google/genai";` and `new GoogleGenAI({ apiKey, apiVersion })`.
        // Then `ai.models.generateVideos`.
        // For text, it should be `ai.models.generateContent`.

        const ai = new GoogleGenAI({ apiKey: geminiApiKey });
        const result = await ai.models.generateContent({
          model: 'gemini-1.5-flash',
          contents: [{
            role: 'user',
            parts: [{
              text: `
          Enhance this image generation prompt to be more descriptive, photorealistic, and high quality for a UGC lifestyle product shot. 
          Keep it under 100 words. Focus on lighting, texture, and realism.
          IMPORTANT: Ensure the output is completely safe, family-friendly, and free of any violence, sexual content, or prohibited items.
          Original prompt: "${enhancedPrompt}"
        ` }]
          }]
        });

        const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          enhancedPrompt = text.trim();
        }
      } catch (err) {
        console.warn('Gemini prompt enhancement failed, using original:', err);
      }
    }

    const safePrompt = `Safe, fully clothed, professional lifestyle/editorial product photo. ${enhancedPrompt}`;

    // First choice: Replicate (Flux)
    if (replicateToken) {
      try {
        const version = replicateVersion;
        const start = await fetch('https://api.replicate.com/v1/predictions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${replicateToken}`,
          },
          body: JSON.stringify({
            version,
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

        // Poll until completed
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
        if (!imageUrl) {
          throw new Error('Replicate returned no image URL.');
        }
        return res.status(200).json({ imageUrl, promptUsed: safePrompt });
      } catch (err) {
        console.warn('Replicate failed, trying Vertex:', err);
      }
    }

    // Fallback: Vertex Imagen 3 using service account
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
        safetySetting: 'block_only_high', // For some Imagen versions
        // For newer Imagen versions, it might be safetySettings list
      },
      // Explicit safety settings for Vertex AI
      safetySettings: [
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
      ],
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

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data?.error?.message || 'Vertex Imagen generation failed');
    }

    const prediction = data?.predictions?.[0];
    const imageBase64 = prediction?.bytesBase64Encoded;
    if (!imageBase64) {
      throw new Error('No image returned from Vertex Imagen.');
    }

    const imageUrl = `data:image/png;base64,${imageBase64}`;
    return res.status(200).json({ imageUrl, promptUsed: safePrompt });

  } catch (error) {
    console.error("Error in /api/generate-image:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return res.status(500).json({ error: errorMessage });
  }
}
