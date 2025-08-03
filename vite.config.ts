import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // Tell Vite that our source code is in the 'src' folder.
  root: 'src', 
  
  base: './', // For GitHub Pages compatibility.
  
  build: {
    // Place the output 'dist' folder in the project's root.
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
