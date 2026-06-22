import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';

const buildTime = Date.now().toString();

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'write-version',
      buildStart() {
        fs.writeFileSync('public/version.json', JSON.stringify({ v: buildTime }));
      },
    },
  ],
  define: {
    __BUILD_TIME__: JSON.stringify(buildTime),
  },
  base: './',
});
