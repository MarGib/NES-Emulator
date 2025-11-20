import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Ensures assets are loaded relatively (crucial for GitHub Pages subdirectories)
  define: {
    // Polyfill process.env for the browser environment to prevent "process is not defined" crash
    'process.env': {
      API_KEY: process.env.API_KEY || ''
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
});