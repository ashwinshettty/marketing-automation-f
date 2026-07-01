import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Leads → VITE_INKSTALL_BACKEND_API_URL (inkstall-backend :4000)
    // WhatsApp/auth → VITE_MARKETING_AUTOMATION_API_URL (marketing-automation-b :3000)
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})
