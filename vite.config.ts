import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import { nodePolyfills } from 'vite-plugin-node-polyfills' // avoid warnings in browser console

export default defineConfig({
  build: {
    target: 'es2022',
  },
  esbuild: {
    target: 'es2022',
  },
  optimizeDeps: {
    exclude: ['svgedit'],
    esbuildOptions: {
      target: 'es2022',
    },
  },
  plugins: [vue(), vueJsx(), vueDevTools(), nodePolyfills()],
  base: '/svgdigitizer-web/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    cors: true,
    // {
    //   origin: [
    //     /^https?:\/\/(?:(?:[^:]+\.)?localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/,
    //     'https://electrochemistry-data.linuxrider.workers.dev',
    //   ],
    // },
  },
})
