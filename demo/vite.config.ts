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
    },
    // 添加代理配置解决CORS问题
    proxy: {
      '/api/doubao': {
        target: 'https://ark.cn-beijing.volces.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/doubao/, '/api/v3/chat/completions')
      }
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