import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      usePolling: true,
    },
    host: true,
    strictPort: true,
    port: 5173,
    proxy: {
      '/rpc': {
        target: 'https://4.231.145.85:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rpc/, ''),
        headers:{
          'content-type': 'application/json',
        }
      },
    }
  },
})
