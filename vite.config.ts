import { defineConfig } from 'vite';
import { resolve } from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  // Tell Vite where our source code is.
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

  plugins: [
    // This plugin now does TWO jobs:
    viteStaticCopy({
      targets: [
        // Job 1: Copy 404.html to the output for normal 404 errors.
        {
          src: '404.html',
          dest: '.' 
        },
        // Job 2: Copy 404.html again, but rename it to index.html.
        // This creates our "dummy index" redirector page.
        {
          src: '404.html',
          dest: '.',
          rename: 'index.html'
        }
      ]
    })
  ],

  server: {
    port: 5173,
  },
});
