
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],

  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },

  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',

    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],

      include: [
        'src/**/*.{ts,tsx}',
        'server/**/*.{ts,tsx}',
      ],

      exclude: [
        'src/test/**',
        'src/main.tsx',
        '**/*.test.ts',
        '**/*.test.tsx',
        'server/testMcp.ts',
        'server/testMCP.ts',
        'server/testTmdb.ts',
      ],

      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
})
