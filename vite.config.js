import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // Website Intelligence uses @/… imports (shadcn / SmoothUI)
      '@': path.resolve(__dirname, './src/website-intelligence'),
      '@wi': path.resolve(__dirname, './src/website-intelligence'),
    },
  },
  server: {
    proxy: {
      // marketing-automation-b serves both MA APIs and Website Intelligence
      '/api': 'http://localhost:3000',
      '/wi-api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/wi-api/, ''),
      },
      '/wi': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
