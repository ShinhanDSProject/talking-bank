import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'

// 환경 변수는 저장소 루트의 .env 하나를 api 와 공유한다. 브라우저 번들에는 VITE_ 접두사가 붙은 값만 들어간다.
const envDir = fileURLToPath(new URL('../..', import.meta.url))

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, envDir, '')

  return {
    envDir,
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        // 개발 중에는 /api 요청을 Spring Boot로 넘겨 브라우저 입장에서 동일 출처가 되게 한다.
        // 배포 환경에서는 프론트와 API가 분리되므로 VITE_API_BASE_URL을 사용한다(src/lib/api.ts).
        '/api': {
          target: env.VITE_API_PROXY_TARGET || 'http://localhost:8080',
          changeOrigin: true,
        },
      },
    },
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/setupTests.ts'],
      css: false,
    },
  }
})
