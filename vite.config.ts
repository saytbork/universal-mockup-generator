import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // FIX: Replaced `process.cwd()` with `'.'` to resolve a TypeScript error where
  // `cwd` is not recognized on the `process` object. `.` correctly refers to the
  // current working directory for loading environment variables.
  const env = loadEnv(mode, '.', '');
  const apiKey = env.GEMINI_API_KEY || env.API_KEY || '';
  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(apiKey),
      'process.env.GEMINI_API_KEY': JSON.stringify(apiKey)
    }
  }
})
