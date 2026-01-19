// vite.config.js
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  plugins: [viteSingleFile()],
  // Additional configuration might be needed for relative paths for
  // static files in the public folder that are not inlined.
  // For example:
  build: {
    assetsDir: '', // Puts assets in the root of the output directory
  },
  base: './', // Ensures relative paths in the HTML output
});

