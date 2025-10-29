import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/ws': {
        target: 'ws://localhost:2567',
        ws: true,
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
