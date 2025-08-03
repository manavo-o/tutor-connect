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
        // This correctly builds src/index.html into dist/index.html
        main: resolve(__dirname, 'src/index.html'),
      },
    },
  },

  plugins: [
    // This plugin now ONLY copies the 404.html file.
    // It no longer overwrites your main application.
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
