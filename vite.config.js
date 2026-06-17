import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => ({
  base: mode === 'gh-pages' ? '/BERMUDS/' : '/',
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: 'jsdom',
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true,
        minThreads: 1,
        maxThreads: 1,
      },
    },
    setupFiles: ['./src/test/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules', 'dist', 'src/data', 'src/assets'],
    },
  },
}))
