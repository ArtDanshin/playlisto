import path from 'path'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react-swc'
import fs from 'fs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
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
})
