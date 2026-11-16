import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

/** Strip unverified BGM mp3 files from dist so public builds never ship them. */
function stripUnverifiedBgm(): Plugin {
  return {
    name: 'strip-unverified-bgm',
    closeBundle() {
      const audioDir = path.resolve(__dirname, 'dist/audio');
      if (!fs.existsSync(audioDir)) return;
      for (const name of fs.readdirSync(audioDir)) {
        if (name.endsWith('.mp3')) {
          fs.unlinkSync(path.join(audioDir, name));
        }
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), stripUnverifiedBgm()],
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
  },
});
