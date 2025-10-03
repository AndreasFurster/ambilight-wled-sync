import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      external: ['dgram', 'node:dgram'],
    },
  },
  resolve: {
    alias: {
      dgram: 'dgram',
    },
  },
  optimizeDeps: {
    exclude: ['dgram', 'node:dgram'],
  },
});
