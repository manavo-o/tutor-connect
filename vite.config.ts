import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // Tell Vite where our source code is. This is the crucial fix.
  root: 'src', 
  
  base: './', // This remains important for GitHub Pages deployment
  
  build: {
    // Place the output 'dist' folder in the project's root, not inside 'src'
    outDir: '../dist', 
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html'),
      },
    },
  },

  server: {
    port: 5173,
  },
});
