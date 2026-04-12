import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '192.168.29.6',
      '3985-2405-201-2005-606b-d8e-3186-d1c2-b903.ngrok-free.app',
      '.ngrok-free.app',
      '.ngrok.io'
    ]
  },
  build: {
    // Split vendor chunks so browsers can cache React/framer separately
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react':   ['react', 'react-dom', 'react-router-dom'],
          'vendor-motion':  ['framer-motion'],
          'vendor-axios':   ['axios'],
          'vendor-lucide':  ['lucide-react'],
        }
      }
    },
    // Raise warning threshold — activity assets are intentionally large
    chunkSizeWarningLimit: 800,
    // Minify with esbuild (default) — fastest option
    minify: 'esbuild',
    target: 'es2018',
  }
})
