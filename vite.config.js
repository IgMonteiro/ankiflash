// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    commonjsOptions: {
      include: [/anki-apkg-export/, /node_modules/],
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('development'),
  },
});
