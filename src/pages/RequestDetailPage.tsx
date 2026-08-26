import { useEffect, useState, type FormEvent } from 'react'
import { ArrowLeft, CalendarDays, Check, ExternalLink, FileText, MessageSquare, Send, UserRound, UsersRound } from 'lucide-react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { Spinner } from '../components/Spinner'
import { StatusBadge } from '../components/StatusBadge'
import { Toast, type ToastState } from '../components/Toast'
import { useAuth } from '../context/AuthContext'
import { api, ApiError } from '../services/api'
import type { RequestComment, RequestDetail, User } from '../types'
import { formatDate, initials, translate } from '../utils/format'

export function RequestDetailPage() {
  const { id } = useParams()
  const location = useLocation()
  const { user } = useAuth()
  const [request, setRequest] = useState<RequestDetail | null>(null)
  const [analysts, setAnalysts] = useState<User[]>([])
  const [activeTab, setActiveTab] = useState<'comments' | 'history'>('comments')
  const [comment, setComment] = useState('')
  const [visibility, setVisibility] = useState('Public')
  const [status, setStatus] = useState('')
  const [statusComment, setStatusComment] = useState('')
  const [toast, setToast] = useState<ToastState | null>(location.state?.created ? { type: 'success', message: 'La solicitud fue registrada exitosamente.' } : null)
  const [saving, setSaving] = useState(false)
  const manager = user?.role === 'Administrator' || user?.role === 'Analyst'
  useEffect(() => { api.get<RequestDetail>(`/solicitudes/${id}`).then(setRequest).catch(reason => setToast({ type: 'error', message: reason instanceof ApiError ? reason.message : 'No se pudo cargar la solicitud.' })) }, [id])
  useEffect(() => { if (manager) api.get<User[]>('/usuarios/analistas').then(setAnalysts) }, [manager])

  const assign = async (assigneeId: string) => {
    if (!assigneeId) return
    setSaving(true)
    try { setRequest(await api.patch<RequestDetail>(`/solicitudes/${id}/asignacion`, { assigneeId: Number(assigneeId) })); setToast({ type: 'success', message: 'Responsable actualizado.' }) }
    catch (reason) { setToast({ type: 'error', message: reason instanceof ApiError ? reason.message : 'No se pudo asignar.' }) }
    finally { setSaving(false) }
  }
  const changeStatus = async (event: FormEvent) => {
    event.preventDefault(); if (!status) return; setSaving(true)
    try { setRequest(await api.patch<RequestDetail>(`/solicitudes/${id}/estado`, { status, comment: statusComment || null })); setStatus(''); setStatusComment(''); setToast({ type: 'success', message: 'Estado actualizado correctamente.' }) }
    catch (reason) { setToast({ type: 'error', message: reason instanceof ApiError ? reason.message : 'No se pudo cambiar el estado.' }) }
    finally { setSaving(false) }
  }
  const addComment = async (event: FormEvent) => {
    event.preventDefault(); setSaving(true)
    try { const created = await api.post<RequestComment>(`/solicitudes/${id}/comentarios`, { text: comment, visibility }); setRequest(current => current ? { ...current, comments: [...current.comments, created] } : current); setComment(''); setToast({ type: 'success', message: 'Comentario agregado.' }) }
    catch (reason) { setToast({ type: 'error', message: reason instanceof ApiError ? reason.message : 'No se pudo agregar el comentario.' }) }
    finally { setSaving(false) }
  }

  if (!request) return <Spinner label="Cargando solicitud"/>
  return <div className="detail-page">
    <div className="detail-heading"><Link to="/solicitudes" className="back-link"><ArrowLeft/> Volver</Link><div><span className="code code--large">{request.code}</span><StatusBadge value={request.status}/>{request.isOverdue && <span className="badge badge--overdue">Vencida</span>}</div></div>
    <div className="detail-layout">
      <div className="detail-main">
        <section className="card detail-summary"><div className="detail-summary__top"><div><span className="section-kicker">{request.requestType}</span><h2>{request.title}</h2></div><StatusBadge value={request.priority} type="priority"/></div><p>{request.description}</p>{request.evidenceReference && <a href={request.evidenceReference} target="_blank" rel="noreferrer" className="evidence-link"><ExternalLink/> Ver evidencia adjunta</a>}</section>
        <section className="card activity-card"><div className="tabs"><button className={activeTab === 'comments' ? 'active' : ''} onClick={() => setActiveTab('comments')}><MessageSquare/> Comentarios <span>{request.comments.length}</span></button><button className={activeTab === 'history' ? 'active' : ''} onClick={() => setActiveTab('history')}><FileText/> Historial <span>{request.history.length}</span></button></div>
          {activeTab === 'comments' ? <div className="comments"><form className="comment-form" onSubmit={addComment}><textarea placeholder="Escribe un comentario..." value={comment} onChange={e => setComment(e.target.value)} required maxLength={1000}/><div><select value={visibility} onChange={e => setVisibility(e.target.value)}><option value="Public">Público</option>{manager && <option value="Internal">Interno</option>}</select><button className="button button--primary" disabled={saving || !comment.trim()}><Send/> Enviar</button></div></form>{request.comments.length === 0 ? <div className="empty-inline">Aún no hay comentarios.</div> : [...request.comments].reverse().map(item => <article className="comment" key={item.id}><span className="avatar">{initials(item.author)}</span><div><div><strong>{item.author}</strong><span>{formatDate(item.createdAt, true)}</span><em>{translate(item.visibility)}</em></div><p>{item.text}</p></div></article>)}</div> : <div className="timeline">{[...request.history].reverse().map(item => <article key={item.id}><span className="timeline__icon"><Check/></span><div><strong>{translate(item.newStatus)}</strong><p>{item.comment || `Estado actualizado desde ${translate(item.previousStatus)}`}</p><small>{item.changedBy} · {formatDate(item.changedAt, true)}</small></div></article>)}</div>}
        </section>
      </div>
      <aside className="detail-sidebar">
        {manager && <section className="card manage-card"><h3>Gestionar solicitud</h3><label>Responsable<select value={request.assigneeId ?? ''} onChange={e => assign(e.target.value)} disabled={saving}><option value="">Sin asignar</option>{analysts.map(item => <option key={item.id} value={item.id}>{item.fullName}</option>)}</select></label>{request.allowedTransitions.length > 0 && <form onSubmit={changeStatus}><label>Nuevo estado<select value={status} onChange={e => setStatus(e.target.value)} required><option value="">Seleccionar estado</option>{request.allowedTransitions.map(item => <option key={item} value={item}>{translate(item)}</option>)}</select></label><label>Comentario<textarea value={statusComment} onChange={e => setStatusComment(e.target.value)} placeholder="Describe el cambio realizado..." required={status === 'Resolved' || status === 'Closed'}/></label><button className="button button--primary" disabled={saving}>Actualizar estado</button></form>}</section>}
        <section className="card info-card"><h3>Información</h3><dl><div><dt><UserRound/>Solicitante</dt><dd>{request.requester}</dd></div><div><dt><UsersRound/>Área</dt><dd>{request.area}</dd></div><div><dt><CalendarDays/>Creada</dt><dd>{formatDate(request.createdAt, true)}</dd></div><div><dt><CalendarDays/>Fecha compromiso</dt><dd className={request.isOverdue ? 'overdue' : ''}>{formatDate(request.dueDate)}</dd></div><div><dt><UserRound/>Responsable</dt><dd>{request.assignee ?? 'Sin asignar'}</dd></div></dl></section>
      </aside>
    </div><Toast toast={toast} onClose={() => setToast(null)}/>
  </div>
}
