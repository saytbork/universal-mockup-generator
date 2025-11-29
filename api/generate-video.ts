import { GoogleGenAI } from "@google/genai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "API key is not configured on the server." });
  }

  try {
    const { base64Image, prompt, aspectRatio } = req.body;

    if (!base64Image || !prompt || !aspectRatio) {
      return res.status(400).json({ error: 'Missing required parameters: base64Image, prompt, or aspectRatio.' });
    }

    const ai = new GoogleGenAI({ apiKey });

    let operation = await ai.models.generateVideos({
      model: 'veo-1.0', // Using the VEO model
      prompt: prompt,
      image: {
        imageBytes: base64Image,
        mimeType: 'image/png',
      },
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: aspectRatio,
      }
    });
    
    // Poll for the result
    while (!(operation as any).done) {
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
      const opName =
        typeof operation === 'string'
          ? operation
          : (operation as any)?.name || (operation as any)?.response?.name || '';
      if (!opName) {
        throw new Error('Video operation name missing.');
      }
      operation = await ai.operations.getVideosOperation(opName as string);
    }

    if ((operation as any).error) {
      const err = (operation as any).error;
      throw new Error(err.message || 'Video generation failed with an unknown error.');
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (downloadLink) {
      // The URI is a temporary signed URL, we can pass it directly to the client
      // The client will fetch it directly.
      return res.status(200).json({ videoUrl: downloadLink });
    } else {
      throw new Error("Video generation completed but no download link was provided.");
    }

  } catch (error) {
    console.error("Error in /api/generate-video:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return res.status(500).json({ error: errorMessage });
  }
}
