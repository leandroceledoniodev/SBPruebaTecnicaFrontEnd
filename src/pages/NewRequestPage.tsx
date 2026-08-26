import { useEffect, useState, type FormEvent } from 'react'
import { ArrowLeft, CheckCircle2, ExternalLink, Send } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Toast, type ToastState } from '../components/Toast'
import { api, ApiError } from '../services/api'
import type { CatalogItem, RequestDetail, RequestType } from '../types'

export function NewRequestPage() {
  const navigate = useNavigate()
  const [areas, setAreas] = useState<CatalogItem[]>([])
  const [types, setTypes] = useState<RequestType[]>([])
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<ToastState | null>(null)
  const [form, setForm] = useState({ title: '', description: '', priority: 'Medium', areaId: '', requestTypeId: '', evidenceReference: '' })
  useEffect(() => { Promise.all([api.get<CatalogItem[]>('/catalogos/areas'), api.get<RequestType[]>('/catalogos/tipos-solicitud')]).then(([a, t]) => { setAreas(a); setTypes(t) }) }, [])
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setLoading(true)
    try {
      const created = await api.post<RequestDetail>('/solicitudes', { ...form, areaId: Number(form.areaId), requestTypeId: Number(form.requestTypeId), evidenceReference: form.evidenceReference || null })
      navigate(`/solicitudes/${created.id}`, { state: { created: true } })
    } catch (reason) {
      setToast({ type: 'error', message: reason instanceof ApiError ? reason.message : 'No se pudo crear la solicitud.' })
    } finally { setLoading(false) }
  }
  const selectedType = types.find(item => item.id === Number(form.requestTypeId))

  return <div className="form-page">
    <Link to="/solicitudes" className="back-link"><ArrowLeft/> Volver a solicitudes</Link>
    <form className="request-form" onSubmit={submit}>
      <section className="card form-card"><div className="form-card__head"><span>1</span><div><h2>Información de la solicitud</h2><p>Describe el requerimiento con la mayor claridad posible.</p></div></div><div className="form-grid">
        <label className="field field--full">Título de la solicitud <span>*</span><input maxLength={150} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Ej.: Acceso al sistema de reportes" required/><small>{form.title.length}/150 caracteres</small></label>
        <label className="field field--full">Descripción <span>*</span><textarea maxLength={2000} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Detalla el problema o requerimiento, su impacto y cualquier información relevante..." required/><small>{form.description.length}/2000 caracteres</small></label>
      </div></section>
      <section className="card form-card"><div className="form-card__head"><span>2</span><div><h2>Clasificación</h2><p>Estos datos permiten canalizar correctamente tu solicitud.</p></div></div><div className="form-grid">
        <label className="field">Tipo de solicitud <span>*</span><select value={form.requestTypeId} onChange={e => setForm({ ...form, requestTypeId: e.target.value })} required><option value="">Selecciona un tipo</option>{types.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select>{selectedType && <small>Tiempo objetivo: {selectedType.slaDays} días</small>}</label>
        <label className="field">Área solicitante <span>*</span><select value={form.areaId} onChange={e => setForm({ ...form, areaId: e.target.value })} required><option value="">Selecciona un área</option>{areas.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <fieldset className="field field--full priority-options"><legend>Prioridad <span>*</span></legend>{['Low', 'Medium', 'High', 'Critical'].map((value, index) => <label key={value} className={form.priority === value ? 'selected' : ''}><input type="radio" name="priority" value={value} checked={form.priority === value} onChange={e => setForm({ ...form, priority: e.target.value })}/><i className={`priority-dot priority-dot--${value.toLowerCase()}`}/><span><strong>{['Baja', 'Media', 'Alta', 'Crítica'][index]}</strong><small>{['Puede esperar', 'Atención normal', 'Atención prioritaria', 'Impacto severo'][index]}</small></span><CheckCircle2/></label>)}</fieldset>
      </div></section>
      <section className="card form-card"><div className="form-card__head"><span>3</span><div><h2>Evidencia</h2><p>Opcionalmente agrega un enlace relacionado.</p></div></div><label className="field field--full">URL o referencia de evidencia<div className="input-icon input-icon--right"><ExternalLink/><input type="url" value={form.evidenceReference} onChange={e => setForm({ ...form, evidenceReference: e.target.value })} placeholder="https://ejemplo.com/evidencia"/></div></label></section>
      <div className="form-submit"><Link to="/solicitudes" className="button button--secondary">Cancelar</Link><button className="button button--primary button--large" disabled={loading}>{loading ? <span className="spinner spinner--light"/> : <><Send/> Registrar solicitud</>}</button></div>
    </form><Toast toast={toast} onClose={() => setToast(null)}/>
  </div>
}
