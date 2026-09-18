import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [react()],

  publicDir: false,

  build: {
    outDir: 'dist-lib',

    lib: {
      entry: resolve(import.meta.dirname, 'src/index.ts'),
      name: 'AGIChatSDK',
      formats: ['es'],
      fileName: 'agichat-sdk',
    },

    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
      ],

      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
        },
      },
    },
  },
})