/** 서버가 200번대가 아닌 응답을 돌려줬을 때 던지는 오류. */
export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/**
 * 개발 중에는 빈 문자열이라 Vite dev 서버의 /api 프록시를 타고,
 * 배포 시에는 VITE_API_BASE_URL(예: https://api.example.com)로 직접 호출한다.
 */
const baseUrl = import.meta.env.VITE_API_BASE_URL ?? ''

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    credentials: 'include',
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })

  if (!response.ok) {
    throw new ApiError(response.status, `API 요청 실패: ${response.status} ${response.statusText}`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}
