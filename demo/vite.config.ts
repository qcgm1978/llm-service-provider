import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      usePolling: true,
      interval: 100,
      ignored: ['**/node_modules/**']
    },
    hmr: {
      timeout: 3000
    }
  },
  optimizeDeps: {
    cache: false
  },
  build: {
    cacheDir: false
  },
  envDir: './'
});