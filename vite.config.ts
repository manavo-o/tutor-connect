import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Important for GitHub Pages deployment
  server: {
    port: 5173,
  },
});
