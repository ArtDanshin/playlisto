import path from 'path';
import fs from 'fs';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-swc';

const __dirname = import.meta.dirname;

/** @type {import('vite').UserConfig} */
export default {
  base: process.env.NODE_ENV === 'production' ? '/playlisto/' : '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: 'playlisto.local',
    port: 8443,
    https: (() => {
      const keyPath = path.resolve(__dirname, './sssl/playlisto.local-key.pem');
      const certPath = path.resolve(__dirname, './sssl/playlisto.local-cert.pem');

      if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
        return {
          key: fs.readFileSync(keyPath),
          cert: fs.readFileSync(certPath),
        };
      }
      return false;
    })(),
  },
  build: {
    target: ['chrome109', 'firefox115', 'safari15'],
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          'react-vendor': ['react', 'react-dom'],

          // Routing
          'router-vendor': ['react-router-dom'],

          // UI libraries
          'ui-vendor': [
            '@radix-ui/react-collapsible',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-label',
            '@radix-ui/react-popover',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-separator',
            '@radix-ui/react-slot',
            '@radix-ui/react-tooltip',
          ],

          // Drag and drop
          'dnd-vendor': [
            '@dnd-kit/core',
            '@dnd-kit/sortable',
            '@dnd-kit/utilities',
          ],

          // State management and utilities
          'utils-vendor': [
            'zustand',
            'clsx',
            'class-variance-authority',
            'tailwind-merge',
            'tw-animate-css',
          ],

          // Icons and other utilities
          'icons-vendor': ['lucide-react'],

          // Media parsing
          'media-vendor': ['m3u8-parser'],
        },
      },
    },
  },
};
