export type ServiceStatus = 'NORMAL' | 'WARNING' | 'DOWN'

export type SystemService = {
  name: 'Spring Boot API' | 'FastAPI' | 'MariaDB' | 'Redis'
  status: ServiceStatus
  uptime: string
  responseTime: number
  lastCheckedAt: string
  description: string
  version: string
}

export const systemData = {
  summary: [
    { label: 'CPU 사용률', value: 38, unit: '%', detail: '8 Core · 정상', status: 'NORMAL' as const },
    { label: 'Memory 사용률', value: 64, unit: '%', detail: '10.2 / 16 GB', status: 'NORMAL' as const },
    { label: 'API 평균 응답시간', value: 84, unit: 'ms', detail: '최근 5분 평균', status: 'NORMAL' as const },
  ],
  metrics: {
    cpu: [{ label: '10:00', value: 31 }, { label: '10:10', value: 46 }, { label: '10:20', value: 42 }, { label: '10:30', value: 55 }, { label: '10:40', value: 38 }],
    memory: [{ label: '10:00', value: 58 }, { label: '10:10', value: 60 }, { label: '10:20', value: 62 }, { label: '10:30', value: 63 }, { label: '10:40', value: 64 }],
    responseTime: [{ label: '10:00', value: 72 }, { label: '10:10', value: 94 }, { label: '10:20', value: 81 }, { label: '10:30', value: 105 }, { label: '10:40', value: 84 }],
  },
  services: [
    { name: 'Spring Boot API', status: 'NORMAL', uptime: '99.99%', responseTime: 84, lastCheckedAt: '방금 전', description: '핵심 뱅킹 API와 관리자 API를 제공합니다.', version: '3.5.6' },
    { name: 'FastAPI', status: 'WARNING', uptime: '99.91%', responseTime: 221, lastCheckedAt: '방금 전', description: 'AI 대화와 FDS 추론 요청을 처리합니다.', version: '0.119.0' },
    { name: 'MariaDB', status: 'NORMAL', uptime: '99.99%', responseTime: 18, lastCheckedAt: '1분 전', description: '회원, 계좌 및 거래 데이터를 저장합니다.', version: '11.4' },
    { name: 'Redis', status: 'NORMAL', uptime: '99.98%', responseTime: 7, lastCheckedAt: '1분 전', description: '세션과 임시 데이터를 관리합니다.', version: '7.4' },
  ] satisfies SystemService[],
  incidents: [
    { id: 'INC-1042', occurredAt: '2026.10.08 09:42', service: 'FastAPI', severity: 'WARNING', title: '응답시간 임계치 초과', duration: '6분', status: '복구됨' },
    { id: 'INC-1041', occurredAt: '2026.10.07 22:18', service: 'Redis', severity: 'DOWN', title: '연결 재시도 증가', duration: '2분', status: '복구됨' },
  ],
}

export type SystemData = typeof systemData
