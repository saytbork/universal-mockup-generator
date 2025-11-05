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
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Server proxy (hide your API key)

To let other users use the app without asking them for your API key, a server-side proxy is included under `server/index.js`.

Quick steps:

1. Install dependencies (if you haven't already):

   ```bash
   npm install
   ```

2. Create a `.env` file in the project root with:

   ```
   GENERATIVE_API_KEY=sk-...your-key-here
   PORT=8787
   ```

3. Start the server:

   ```bash
   npm run start:server
   ```

4. Start the frontend in a separate terminal:

   ```bash
   npm run dev
   ```

Now the frontend will call the proxy endpoints at `/api/*` so users don't need to provide the API key.

See the `server/index.js` file for endpoint details and production notes.
