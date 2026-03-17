import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '192.168.29.6',
      '3985-2405-201-2005-606b-d8e-3186-d1c2-b903.ngrok-free.app',
      // Allow all ngrok subdomains
      '.ngrok-free.app',
      '.ngrok.io'
    ]
  }
})
