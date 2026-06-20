import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/owners-database-app/',
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    copyPublicDir: true
  }
})
