import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  root: 'boostugc-app',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'boostugc-app', 'src'),
    },
  },
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
  },
});
