/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
// En local, el servidor de Vite hace de API Management: reenvía /api al back y agrega la cabecera secreta del
// gateway (ADR-013). Las variables sin prefijo VITE_ se quedan en el servidor: el secreto nunca llega al navegador.
export default defineConfig(({ mode }) => {
  const entorno = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [vue(), vueDevTools()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: entorno.KUDOS_BACKEND_URL,
          changeOrigin: true,
          headers: { [entorno.KUDOS_GATEWAY_CABECERA ?? '']: entorno.KUDOS_GATEWAY_SECRETO ?? '' },
        },
      },
    },
    test: {
      environment: 'node',
    },
  }
})
