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

The local dev server exposes a marketing landing page at `/` and the generator UI at `/app`.
You will be prompted to sign in with an email address before accessing the generator so plan limits can be enforced; the email is stored only in the browser. The default free tier allows 5 image generations per browser profile (stored in `localStorage`), after which an upgrade overlay blocks further use. Video generation remains locked until the private access code (default `713371`) is entered inside the video panel. You can optionally drop a mood/inspiration image and the app will auto-adjust lighting/scene parameters based on the detected palette.

### Optional: Stripe Payment Links

The landing page’s paid plans use Stripe Payment Links. Add these env vars to `.env.local` (and Vercel):

```
VITE_STRIPE_LINK_GROWTH=https://buy.stripe.com/...
VITE_STRIPE_LINK_PREMIUM=https://buy.stripe.com/...
```

They can be standard Payment Links or Checkout URLs. If not provided, the Growth/Premium buttons in the modal stay disabled with a helpful message.

## Deploy to Vercel

1. Create a new Vercel project and import this repository (or link the local folder with `vercel link`).
2. Set the project environment variables:
   - `VITE_GEMINI_API_KEY`: Gemini API key that has both image and VEO video access.
3. Keep the default build settings:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Deploy. Vercel serves the `dist` output as a static site and the client-side app reads the key at build time. If you need to rotate the key, update the variable in Vercel and redeploy.
