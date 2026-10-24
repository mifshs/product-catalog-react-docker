// vite.config.js — конфигурация Vite.
//
// Proxy нужен только для локальной разработки без Docker.
// В Cloud Shell мы будем использовать Docker + Nginx, поэтому proxy не критичен.

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});