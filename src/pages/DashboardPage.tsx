import { useEffect, useState } from 'react'
import { AlertTriangle, ArrowRight, CheckCircle2, ClipboardList, Clock3, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { RequestTable } from '../components/RequestTable'
import { Spinner } from '../components/Spinner'
import { api } from '../services/api'
import type { DashboardSummary } from '../types'
import { translate } from '../utils/format'

export function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null)
  const [error, setError] = useState('')

  useEffect(() => { api.get<DashboardSummary>('/dashboard/resumen').then(setData).catch(() => setError('No se pudo cargar el resumen.')) }, [])
  if (!data && !error) return <Spinner/>
  if (!data) return <div className="form-error">{error}</div>
  const maxPriority = Math.max(...data.byPriority.map(item => item.count), 1)

  return <div className="page-stack">
    <div className="page-actions"><div><span className="welcome">Bienvenido de vuelta</span><p>Este es el estado actual de las solicitudes.</p></div><Link to="/solicitudes/nueva" className="button button--primary"><Plus/> Nueva solicitud</Link></div>
    <div className="metric-grid">
      <article className="metric-card"><span className="metric-card__icon metric-card__icon--blue"><ClipboardList/></span><div><span>Total de solicitudes</span><strong>{data.totalRequests}</strong><small>Registradas en la plataforma</small></div></article>
      <article className="metric-card"><span className="metric-card__icon metric-card__icon--orange"><Clock3/></span><div><span>Solicitudes abiertas</span><strong>{data.openRequests}</strong><small>Requieren seguimiento</small></div></article>
      <article className="metric-card"><span className="metric-card__icon metric-card__icon--green"><CheckCircle2/></span><div><span>Solicitudes cerradas</span><strong>{data.closedRequests}</strong><small>Completadas exitosamente</small></div></article>
      <article className="metric-card"><span className="metric-card__icon metric-card__icon--red"><AlertTriangle/></span><div><span>Solicitudes vencidas</span><strong>{data.overdueRequests}</strong><small>Fuera de fecha compromiso</small></div></article>
    </div>
    <div className="dashboard-grid">
      <section className="card chart-card"><div className="card__header"><div><h2>Solicitudes por estado</h2><p>Distribución del flujo actual</p></div></div><div className="status-donut-layout"><div className="donut" style={{ background: `conic-gradient(#ed6b2f 0 ${data.closedRequests / Math.max(data.totalRequests, 1) * 100}%, #315f7c 0)` }}><span><strong>{data.totalRequests}</strong><small>Total</small></span></div><div className="legend">{data.byStatus.map((item, index) => <div key={item.name}><i style={{ background: index === 0 ? '#ed6b2f' : `hsl(${202 + index * 16} 45% ${35 + index * 5}%)` }}/><span>{translate(item.name)}</span><strong>{item.count}</strong></div>)}</div></div></section>
      <section className="card chart-card"><div className="card__header"><div><h2>Solicitudes por prioridad</h2><p>Nivel de atención requerido</p></div></div><div className="bar-chart">{data.byPriority.map(item => <div key={item.name}><div><span>{translate(item.name)}</span><strong>{item.count}</strong></div><span className="bar-track"><i className={`bar bar--${item.name.toLowerCase()}`} style={{ width: `${item.count / maxPriority * 100}%` }}/></span></div>)}</div></section>
    </div>
    <section className="card"><div className="card__header"><div><h2>Solicitudes recientes</h2><p>Últimos requerimientos registrados</p></div><Link to="/solicitudes" className="text-link">Ver todas <ArrowRight/></Link></div><RequestTable items={data.latestRequests}/></section>
  </div>
}
