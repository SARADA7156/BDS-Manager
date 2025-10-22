import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
    resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@config': path.resolve(__dirname, './src/config')
    }
  },
  server: {
    proxy: {
      "/api": "http://localhost:10001",
      "/socket.io": "http://localhost:10001"
    }
  },
});
