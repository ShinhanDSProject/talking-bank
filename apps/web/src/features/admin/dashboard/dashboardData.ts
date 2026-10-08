import { dashboardStats, fdsCases, transactions } from '../mockData'

export const dashboardData = {
  stats: dashboardStats,
  transactionTrend: [
    { label: '10/2', value: 52 },
    { label: '10/3', value: 68 },
    { label: '10/4', value: 61 },
    { label: '10/5', value: 82 },
    { label: '10/6', value: 73 },
    { label: '10/7', value: 94 },
    { label: '오늘', value: 78 },
  ],
  systemMetrics: [
    { name: 'CPU', value: 38, detail: '8 Core · 정상' },
    { name: 'Memory', value: 64, detail: '10.2 / 16 GB' },
    { name: 'API 응답시간', value: 42, detail: '평균 84ms' },
  ],
  services: [
    { name: '계좌 서비스', status: '정상', uptime: '99.99%' },
    { name: '송금 네트워크', status: '정상', uptime: '99.98%' },
    { name: 'FDS 판정 엔진', status: '정상', uptime: '99.95%' },
    { name: '본인 인증', status: '성능 저하', uptime: '98.72%' },
  ],
  riskSummary: [
    { label: '낮은 위험', count: 12, tone: 'success' as const },
    { label: '중간 위험', count: 48, tone: 'warning' as const },
    { label: '높은 위험', count: 91, tone: 'danger' as const },
  ],
  recentTransactions: transactions.slice(0, 4),
  recentFdsCases: fdsCases.slice(0, 3),
}

export type DashboardData = typeof dashboardData
