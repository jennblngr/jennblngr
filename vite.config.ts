import { fileURLToPath, URL } from 'node:url'

import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

const BUILD_DURATION_PLACEHOLDER = '__BUILD_DURATION_MS__'

function buildDurationPlugin(): Plugin {
  let start = 0

  return {
    name: 'build-duration',
    apply: 'build',
    buildStart() {
      start = Date.now()
    },
    generateBundle(_options, bundle) {
      const duration = String(Date.now() - start)
      for (const file of Object.values(bundle)) {
        if (file.type === 'chunk' && file.code.includes(BUILD_DURATION_PLACEHOLDER)) {
          file.code = file.code.replaceAll(BUILD_DURATION_PLACEHOLDER, duration)
        }
      }
    },
  }
}

export default defineConfig({
  plugins: [vue(), tailwindcss(), buildDurationPlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
