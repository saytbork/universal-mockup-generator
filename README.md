<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1nCgjRcjb-rdBNvRyhB2EXhnZ2KH4aSwg

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env.local` and set `VITE_GEMINI_API_KEY` to your Gemini API key (or start the dev server and paste a key into the in-app prompt).
3. Run the app:
   `npm run dev`

## Deploy to Vercel

1. Create a new Vercel project and import this repository (or link the local folder with `vercel link`).
2. Set the project environment variables:
   - `VITE_GEMINI_API_KEY`: Gemini API key that has both image and VEO video access.
3. Keep the default build settings:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Deploy. Vercel serves the `dist` output as a static site and the client-side app reads the key at build time. If you need to rotate the key, update the variable in Vercel and redeploy.
