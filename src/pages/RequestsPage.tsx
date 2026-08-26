import { useEffect, useState, type FormEvent } from 'react'
import { ChevronLeft, ChevronRight, Filter, Plus, Search, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { RequestTable } from '../components/RequestTable'
import { Spinner } from '../components/Spinner'
import { api } from '../services/api'
import type { CatalogItem, PagedResult, RequestSummary, RequestType, StatusCatalog } from '../types'
import { translate } from '../utils/format'

interface Filters { search: string; status: string; priority: string; areaId: string; requestTypeId: string; overdueOnly: boolean }
const initial: Filters = { search: '', status: '', priority: '', areaId: '', requestTypeId: '', overdueOnly: false }

export function RequestsPage() {
  const [data, setData] = useState<PagedResult<RequestSummary> | null>(null)
  const [areas, setAreas] = useState<CatalogItem[]>([])
  const [types, setTypes] = useState<RequestType[]>([])
  const [catalog, setCatalog] = useState<StatusCatalog | null>(null)
  const [filters, setFilters] = useState(initial)
  const [applied, setApplied] = useState(initial)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => { Promise.all([api.get<CatalogItem[]>('/catalogos/areas'), api.get<RequestType[]>('/catalogos/tipos-solicitud'), api.get<StatusCatalog>('/catalogos/estados')]).then(([a, t, c]) => { setAreas(a); setTypes(t); setCatalog(c) }) }, [])
  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), pageSize: '10' })
    Object.entries(applied).forEach(([key, value]) => value && params.set(key, String(value)))
    api.get<PagedResult<RequestSummary>>(`/solicitudes?${params}`).then(setData).finally(() => setLoading(false))
  }, [applied, page])
  const submit = (event: FormEvent) => { event.preventDefault(); setPage(1); setApplied(filters) }
  const clear = () => { setFilters(initial); setApplied(initial); setPage(1) }

  return <div className="page-stack">
    <div className="page-actions"><div><span className="result-count">{data?.totalCount ?? 0} solicitudes encontradas</span></div><Link to="/solicitudes/nueva" className="button button--primary"><Plus/> Nueva solicitud</Link></div>
    <form className="card filters" onSubmit={submit}>
      <div className="search-field"><Search/><input value={filters.search} onChange={e => setFilters({ ...filters, search: e.target.value })} placeholder="Buscar por código, título o descripción"/></div>
      <select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}><option value="">Todos los estados</option>{catalog?.statuses.map(item => <option key={item.value} value={item.name}>{translate(item.name)}</option>)}</select>
      <select value={filters.priority} onChange={e => setFilters({ ...filters, priority: e.target.value })}><option value="">Todas las prioridades</option>{catalog?.priorities.map(item => <option key={item.value} value={item.name}>{translate(item.name)}</option>)}</select>
      <select value={filters.areaId} onChange={e => setFilters({ ...filters, areaId: e.target.value })}><option value="">Todas las áreas</option>{areas.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
      <select value={filters.requestTypeId} onChange={e => setFilters({ ...filters, requestTypeId: e.target.value })}><option value="">Todos los tipos</option>{types.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
      <label className="check-filter"><input type="checkbox" checked={filters.overdueOnly} onChange={e => setFilters({ ...filters, overdueOnly: e.target.checked })}/><span>Solo vencidas</span></label>
      <div className="filter-actions"><button className="button button--primary"><Filter/> Aplicar filtros</button><button type="button" className="button button--ghost" onClick={clear}><X/> Limpiar</button></div>
    </form>
    <section className="card requests-card">{loading ? <Spinner/> : <RequestTable items={data?.items ?? []}/>}<div className="pagination"><span>Página {data?.page ?? 1} de {Math.max(data?.totalPages ?? 1, 1)}</span><div><button disabled={page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft/></button><button disabled={page >= (data?.totalPages ?? 1)} onClick={() => setPage(page + 1)}><ChevronRight/></button></div></div></section>
  </div>
}
