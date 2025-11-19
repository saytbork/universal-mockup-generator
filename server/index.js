import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
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

const verificationStore = new Map();
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REPLICATE_TOKEN = process.env.REPLICATE_API_TOKEN || process.env.REPLICATE_TOKEN;
const REAL_ESRGAN_VERSION =
  process.env.REAL_ESRGAN_VERSION ||
  '42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b';
const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 24;

const createMailTransport = () => {
  if (!process.env.SMTP_HOST) {
    console.warn('SMTP_HOST not set. Verification emails will be logged to the console.');
    return null;
  }
  try {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER && process.env.SMTP_PASS
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          }
        : undefined,
    });
  } catch (err) {
    console.error('Failed to configure SMTP transport:', err);
    return null;
  }
};

const mailTransport = createMailTransport();
const MAIL_FROM = process.env.SMTP_FROM || process.env.EMAIL_FROM || 'no-reply@universalugc.com';

const generateVerificationCode = () => Math.floor(100000 + Math.random() * 900000).toString();

const normalizeEmail = (email = '') => email.trim().toLowerCase();

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const upscaleImageWithReplicate = async (dataUrl) => {
  if (!REPLICATE_TOKEN) {
    throw new Error('High-resolution upscaler is not configured.');
  }
  const requestPayload = {
    version: REAL_ESRGAN_VERSION,
    input: {
      image: dataUrl,
      scale: 4,
    },
  };
  const requestHeaders = {
    Authorization: `Bearer ${REPLICATE_TOKEN}`,
    'Content-Type': 'application/json',
  };
  const startResponse = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: requestHeaders,
    body: JSON.stringify(requestPayload),
  });
  const startData = await startResponse.json().catch(() => ({}));
  if (!startResponse.ok) {
    throw new Error(startData?.error || 'Failed to contact the upscaler service.');
  }
  let prediction = startData;
  let attempts = 0;
  while (
    prediction.status &&
    !['succeeded', 'failed', 'canceled'].includes(prediction.status) &&
    attempts < MAX_POLL_ATTEMPTS
  ) {
    await sleep(POLL_INTERVAL_MS);
    const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
      method: 'GET',
      headers: requestHeaders,
    });
    prediction = await pollResponse.json().catch(() => ({}));
    attempts += 1;
  }
  if (prediction.status !== 'succeeded') {
    throw new Error(prediction?.error || 'Upscaling did not finish successfully.');
  }
  const outputUrl = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
  if (!outputUrl) {
    throw new Error('Upscaler returned no output URL.');
  }
  const imageResponse = await fetch(outputUrl);
  if (!imageResponse.ok) {
    throw new Error('Could not download the upscaled image.');
  }
  const arrayBuffer = await imageResponse.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const mimeType = imageResponse.headers.get('content-type') || 'image/png';
  return {
    imageBase64: buffer.toString('base64'),
    mimeType,
  };
};

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.post('/api/request-code', async (req, res) => {
  try {
    const rawEmail = (req.body?.email ?? '').trim();
    const normalizedEmail = normalizeEmail(rawEmail);
    if (!EMAIL_REGEX.test(rawEmail)) {
      return res.status(400).json({ error: 'Enter a valid email address.' });
    }

    const code = generateVerificationCode();
    verificationStore.set(normalizedEmail, {
      code,
      expiresAt: Date.now() + 5 * 60 * 1000,
      attempts: 0,
    });

    if (mailTransport) {
      await mailTransport.sendMail({
        from: MAIL_FROM,
        to: rawEmail,
        subject: 'Your Universal Mockup Generator code',
        text: `Use this verification code to access the generator: ${code}\n\nThe code expires in 5 minutes.`,
        html: `<p>Use this verification code to access the generator:</p><p style="font-size:24px;font-weight:bold;letter-spacing:6px;">${code}</p><p>This code expires in 5 minutes.</p>`,
      });
    } else {
      console.warn(`Verification code for ${rawEmail}: ${code}`);
    }

    return res.json({ ok: true, emailed: Boolean(mailTransport) });
  } catch (error) {
    console.error('request-code error', error);
    return res.status(500).json({ error: 'Could not send verification email. Try again.' });
  }
});

app.post('/api/verify-code', (req, res) => {
  const rawEmail = (req.body?.email ?? '').trim();
  const normalizedEmail = normalizeEmail(rawEmail);
  const submittedCode = String(req.body?.code ?? '').trim();

  if (!EMAIL_REGEX.test(rawEmail)) {
    return res.status(400).json({ error: 'Enter a valid email address.' });
  }
  if (!submittedCode) {
    return res.status(400).json({ error: 'Enter the verification code sent to your email.' });
  }

  const record = verificationStore.get(normalizedEmail);
  if (!record) {
    return res.status(400).json({ error: 'Code expired or not found. Request a new one.' });
  }
  if (record.expiresAt < Date.now()) {
    verificationStore.delete(normalizedEmail);
    return res.status(400).json({ error: 'Code expired. Request a new one.' });
  }

  record.attempts = (record.attempts ?? 0) + 1;
  if (record.attempts > 5) {
    verificationStore.delete(normalizedEmail);
    return res.status(429).json({ error: 'Too many attempts. Request a new code.' });
  }

  if (record.code !== submittedCode) {
    return res.status(400).json({ error: 'Incorrect code. Try again.' });
  }

  verificationStore.delete(normalizedEmail);
  return res.json({ verified: true });
});

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

app.post('/api/upscale-image', async (req, res) => {
  try {
    if (!REPLICATE_TOKEN) {
      return res.status(501).json({ error: 'High-resolution upscaler is not configured.' });
    }
    const imageBase64 = req.body?.imageBase64;
    const mimeType = req.body?.mimeType || 'image/png';
    if (!imageBase64) {
      return res.status(400).json({ error: 'Missing image data for upscaling.' });
    }
    const dataUrl = `data:${mimeType};base64,${imageBase64}`;
    const result = await upscaleImageWithReplicate(dataUrl);
    return res.json(result);
  } catch (error) {
    console.error('upscale-image error', error);
    const message = error instanceof Error ? error.message : 'Failed to upscale the image.';
    return res.status(500).json({ error: message });
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
