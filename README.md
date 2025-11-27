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
2. Copy `.env.example` to `.env.local` and set `GEMINI_API_KEY` to your Gemini API key (or start the dev server and paste a key into the in-app prompt). You can also add `VITE_GOOGLE_CLIENT_ID` (from Google Identity Services) to enable one-click Google login, plus comma-separated `VITE_ADMIN_EMAILS` for accounts that should bypass plan limits.
3. Run the app:
   `npm run dev`

The local dev server exposes a marketing landing page at `/` and the generator UI at `/app`.
You will be prompted to sign in with Google or a verified email before accessing the generator so plan limits can be enforced; login details are stored only in the browser. The default free tier includes 10 credits with watermarked exports (credits persist in `localStorage`), after which an upgrade overlay blocks further use unless the email matches one of the `VITE_ADMIN_EMAILS`. You can optionally drop a mood/inspiration image and the app will auto-adjust lighting/scene parameters based on the detected palette.

### Email verification service

The login screen now sends a 6-digit verification code to the email entered by the user. The Express server in `server/index.js` needs SMTP credentials to send those emails. Add the following environment variables (locally and in production):

```
SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey_or_username
SMTP_PASS=supersecret
SMTP_FROM=Universal Mockups <no-reply@yourdomain.com>
```

If SMTP variables are missing, the server will log each verification code to the console for development purposes, but no real email will be delivered.

### Optional: Stripe Payment Links

The landing page’s paid plans use Stripe Payment Links. Add these env vars to `.env.local` (and Vercel):

```
VITE_STRIPE_LINK_CREATOR=https://buy.stripe.com/...
VITE_STRIPE_LINK_STUDIO=https://buy.stripe.com/...
```

They can be standard Payment Links or Checkout URLs. If not provided, the Creator/Studio buttons in the modal stay disabled with a helpful message.

### Optional: Real-ESRGAN Upscaling

For sharper 2K/4K downloads the app can call Replicate’s Real-ESRGAN model from the Express server. Set these env vars where the server runs (locally and on Vercel):

```
REAL_ESRGAN_VERSION=42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b
```

Leave them unset to fall back to the in-browser scaler (lower fidelity but no external dependency).

## Deploy to Vercel

1. Create a new Vercel project and import this repository (or link the local folder with `vercel link`).
2. Set the project environment variables:
  - `GEMINI_API_KEY`: Gemini API key that has both image and VEO video access.
3. Keep the default build settings:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Deploy. Vercel serves the `dist` output as a static site and the client-side app reads the key at build time. If you need to rotate the key, update the variable in Vercel and redeploy.
