import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { copyFileSync } from 'node:fs'

const rootDir = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  base: './',
  plugins: [
    react(),
    {
      name: 'copy-standalone-floating-ball',
      closeBundle() {
        copyFileSync(resolve(rootDir, 'floating-ball.js'), resolve(rootDir, 'dist/floating-ball.js'))
      },
    },
  ],
  server: {
    host: '0.0.0.0',
    port: 5174,
  },
  build: {
    rollupOptions: {
      input: {
        index: resolve(rootDir, 'index.html'),
        sameScreen: resolve(rootDir, 'same-screen.html'),
        desktop: resolve(rootDir, 'desktop.html'),
        ballDemo: resolve(rootDir, 'demo.html'),
      },
    },
  },
})
