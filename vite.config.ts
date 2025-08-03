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
    // This is the new part that copies the 404.html file.
    viteStaticCopy({
      targets: [
        {
          src: '404.html',
          dest: '.' // copy to the root of the 'dist' folder
        }
      ]
    })
  ],

  server: {
    port: 5173,
  },
});
