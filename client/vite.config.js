import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/** The live API on Render. Change it here if the backend moves. */
const API_URL = 'https://alpha-edition.onrender.com';

export default defineConfig(({ command }) => ({
  plugins: [react()],
  define: {
    // Built site calls the API directly; in dev requests stay on /api and go through the proxy below
    __API_URL__: JSON.stringify(command === 'build' ? API_URL : ''),
  },
  server: {
    port: 5173,
    proxy: {
      '/api': { target: API_URL, changeOrigin: true },
    },
  },
}));
