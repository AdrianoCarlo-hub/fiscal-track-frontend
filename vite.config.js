import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    globals: true,
    fileParallelism: false,
    pool: 'threads',
    maxWorkers: 1,
    testTimeout: 15000,
    hookTimeout: 15000,
  },
})
