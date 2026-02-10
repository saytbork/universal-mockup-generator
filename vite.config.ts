import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Support both API_KEY (Vercel) and VITE_API_KEY (local .env) for flexibility
  const apiKey = env.API_KEY || env.VITE_API_KEY;

  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(apiKey),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    build: {
      outDir: path.resolve(__dirname, 'dist'),
      emptyOutDir: true,
      // Clarity replays may lose styling after a deploy when hashed CSS/JS files disappear.
      // Emit a single, stable CSS bundle + stable entry filename so old replays still load styles.
      cssCodeSplit: false,
      rollupOptions: {
        output: {
          entryFileNames: 'assets/app.js',
          chunkFileNames: 'assets/chunk-[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            // Vite emits a single CSS file when cssCodeSplit=false.
            if (assetInfo.name && assetInfo.name.endsWith('.css')) return 'assets/app.css';
            return 'assets/[name]-[hash][extname]';
          },
        },
      },
    },
  };
});
