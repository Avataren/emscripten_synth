// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
    fs: {
      allow: ['..'], // Allow serving files from parent directory if necessary
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: './public/index.html',
    },
  },
  optimizeDeps: {
    exclude: ['audio_processor.js'],
  },
  publicDir: 'public',
});
