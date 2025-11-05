<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app
This is a UGC (User-Generated Content) style mockup generator built with React, Vite, and the Google Gemini API. It allows users to upload a product image and generate realistic lifestyle photos and videos featuring their product.

## Run Locally

**Prerequisites:**  Node.js

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Set up Environment Variables:** Create a file named `.env.local` in the root of the project and add your Gemini API key:
   ```
   GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
   ```
4. **Run the development server:** Use the Vercel CLI to run the app locally. This will run both the frontend and the backend functions.
   ```bash
   vercel dev
   ```
