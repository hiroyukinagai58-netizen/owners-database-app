import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, mkdirSync } from 'fs'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  base
import { copyFileSync, mkdirSync } from 'fs'
import { join } from 'path'

export default defineConfig({
  plugins: [react()],
  base: '/owners-database-app/',
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})

// ビルド後に data フォルダをコピーする
if (process.env.NODE_ENV === 'production') {
  const: '/owners-database-app/',
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    copyPublicDir: true
  }
})
