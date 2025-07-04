import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
 plugins: [react(),
      tailwindcss()
 ],
  server: {
    proxy: {
      '/api': {
        target: 'https://apiservice.insightone.ma',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/endpoints': {
        target: 'https://apiservice.insightone.ma',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/endpoints/, '')
      }
    }
  }
})