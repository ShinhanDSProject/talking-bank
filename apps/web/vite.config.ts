import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // 개발 중에는 /api 요청을 Spring Boot로 넘겨 브라우저 입장에서 동일 출처가 되게 한다.
      // 배포 환경에서는 프론트와 API가 분리되므로 VITE_API_BASE_URL을 사용한다(src/lib/api.ts).
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET ?? 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    css: false,
  },
})
