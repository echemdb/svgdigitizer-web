import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import { nodePolyfills } from 'vite-plugin-node-polyfills' // avoid warnings in browser console
import { viteStaticCopy } from 'vite-plugin-static-copy'

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
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
    nodePolyfills({
      // To add only specific polyfills, add them here. If no option is passed, adds all polyfills
      include: ['path'],
      // To exclude specific polyfills, add them to this list. Note: if include is provided, this has no effect
      exclude: [
        'http', // Excludes the polyfill for `http` and `node:http`.
      ],
      // Whether to polyfill specific globals.
      globals: {
        Buffer: true, // can also be 'build', 'dev', or false
        global: true,
        process: true,
      },
      // Override the default polyfills for specific modules.
      overrides: {
        // Since `fs` is not supported in browsers, we can use the `memfs` package to polyfill it.
        fs: 'memfs',
      },
      // Whether to polyfill `node:` protocol imports.
      protocolImports: true,
    }),
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/svgedit/dist/editor/images/*',
          dest: 'assets/svgedit/images',
        },
        {
          src: 'ext-svgdigitizer',
          dest: 'assets/svgedit/extensions',
        },
      ],
    }),
  ],
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
