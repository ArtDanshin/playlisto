import path from 'path';
import fs from 'fs';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-swc';

const __dirname = import.meta.dirname;

/** @type {import('vite').UserConfig} */
export default {
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: 'playlisto.local',
    port: 8443,
    https: {
      key: fs.readFileSync(path.resolve(__dirname, './ssl/playlisto.local-key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, './ssl/playlisto.local-cert.pem')),
    },
  },
  build: {
    target: ['chrome109', 'firefox115', 'safari15'],
  },
};
