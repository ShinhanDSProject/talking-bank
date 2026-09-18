/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 배포 환경에서 API 서버 주소. 비우면 같은 출처(/api)로 요청한다. */
  readonly VITE_API_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
