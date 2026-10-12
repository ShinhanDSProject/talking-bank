import { useState } from 'react'
import { Badge, DataTable, MetricBarChart, PageHeader, StatePanel } from '../components'
import { systemData, type SystemData, type SystemService, type ServiceStatus } from './systemData'

type SystemPageState = 'ready' | 'loading' | 'empty' | 'error'

export default function AdminSystemPage({ data = systemData, state = 'ready' }: { data?: SystemData; state?: SystemPageState }) {
  const [selectedService, setSelectedService] = useState<SystemService | null>(null)

  if (state !== 'ready') return <StatePanel type={state} />

  return <>
    <PageHeader eyebrow="SYSTEM HEALTH" title="시스템 상태" description="서비스 자원, 응답시간과 장애 상태를 한눈에 확인합니다." action={<button className="admin-button" type="button">↻ 새로고침</button>} />
    <section className="system-grid" aria-label="시스템 상태 요약">
      {data.summary.map((metric) => <article className="admin-card resource-card" key={metric.label}>
        <div><span>{metric.label}</span><ServiceBadge status={metric.status} /></div><strong>{metric.value}{metric.unit}</strong><div className="meter"><span style={{ width: `${Math.min(metric.value, 100)}%` }} /></div><small>{metric.detail}</small>
      </article>)}
    </section>
    <section className="system-chart-grid">
      <article className="admin-card"><div className="card-heading"><div><h2>CPU 사용률</h2><p>최근 50분 사용률</p></div></div><MetricBarChart label="CPU 사용률" unit="%" points={data.metrics.cpu} /></article>
      <article className="admin-card"><div className="card-heading"><div><h2>Memory 사용률</h2><p>최근 50분 사용률</p></div></div><MetricBarChart label="Memory 사용률" unit="%" points={data.metrics.memory} /></article>
      <article className="admin-card"><div className="card-heading"><div><h2>API 응답시간</h2><p>최근 50분 평균</p></div></div><MetricBarChart label="API 응답시간" unit="ms" points={data.metrics.responseTime} /></article>
    </section>
    <section className="admin-card">
      <div className="card-heading"><div><h2>주요 서비스 상태</h2><p>내부 주소와 인증 정보는 표시하지 않습니다.</p></div><Badge tone="warning">주의 1개</Badge></div>
      <DataTable headers={['서비스', '상태', '가동률', '평균 응답시간', '마지막 확인', '관리']}>
        {data.services.map((service) => <tr key={service.name}><td><strong>{service.name}</strong></td><td><ServiceBadge status={service.status} /></td><td>{service.uptime}</td><td>{service.responseTime}ms</td><td>{service.lastCheckedAt}</td><td><button className="table-action" type="button" onClick={() => setSelectedService(service)}>상세 보기</button></td></tr>)}
      </DataTable>
    </section>
    <section className="admin-card system-incidents">
      <div className="card-heading"><div><h2>최근 장애 및 이상 상태</h2><p>최근 복구된 이벤트를 시간순으로 표시합니다.</p></div></div>
      <DataTable headers={['이벤트 ID', '발생 일시', '서비스', '심각도', '내용', '지속시간', '상태']}>
        {data.incidents.map((incident) => <tr key={incident.id}><td className="admin-mono">{incident.id}</td><td>{incident.occurredAt}</td><td><strong>{incident.service}</strong></td><td><ServiceBadge status={incident.severity as ServiceStatus} /></td><td>{incident.title}</td><td>{incident.duration}</td><td><Badge tone="success">{incident.status}</Badge></td></tr>)}
      </DataTable>
    </section>
    {selectedService && <ServiceDetail service={selectedService} onClose={() => setSelectedService(null)} />}
  </>
}

function ServiceBadge({ status }: { status: ServiceStatus }) {
  const tone = status === 'DOWN' ? 'danger' : status === 'WARNING' ? 'warning' : 'success'
  const label = status === 'DOWN' ? '중단' : status === 'WARNING' ? '주의' : '정상'
  return <Badge tone={tone}>{label}</Badge>
}

function ServiceDetail({ service, onClose }: { service: SystemService; onClose: () => void }) {
  return <div className="admin-modal-backdrop" role="presentation" onMouseDown={onClose}><section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="service-detail-title" onMouseDown={(event) => event.stopPropagation()}>
    <header><div><span>SERVICE DETAIL</span><h2 id="service-detail-title">{service.name} 상태</h2></div><button className="admin-icon-button" type="button" aria-label="서비스 상세 닫기" onClick={onClose}>×</button></header>
    <dl className="member-detail-list"><div><dt>현재 상태</dt><dd><ServiceBadge status={service.status} /></dd></div><div><dt>버전</dt><dd>{service.version}</dd></div><div><dt>가동률</dt><dd>{service.uptime}</dd></div><div><dt>평균 응답시간</dt><dd>{service.responseTime}ms</dd></div><div><dt>마지막 확인</dt><dd>{service.lastCheckedAt}</dd></div></dl>
    <p className="service-detail-description">{service.description}</p><div className="member-detail-actions"><button className="admin-button admin-button--primary" type="button" onClick={onClose}>확인</button></div>
  </section></div>
}
