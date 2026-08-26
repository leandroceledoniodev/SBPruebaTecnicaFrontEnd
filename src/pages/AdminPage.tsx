import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Building2, Edit3, Plus, Tags, UserCog, X } from 'lucide-react'
import { EmptyState } from '../components/EmptyState'
import { Spinner } from '../components/Spinner'
import { Toast, type ToastState } from '../components/Toast'
import { api, ApiError } from '../services/api'
import type { CatalogItem, RequestType, User, UserRole } from '../types'
import { translate } from '../utils/format'

type Tab = 'users' | 'areas' | 'types'

export function AdminPage() {
  const [tab, setTab] = useState<Tab>('users')
  const [users, setUsers] = useState<User[]>([])
  const [areas, setAreas] = useState<CatalogItem[]>([])
  const [types, setTypes] = useState<RequestType[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<{ kind: Tab; item?: User | CatalogItem | RequestType } | null>(null)
  const [toast, setToast] = useState<ToastState | null>(null)
  const load = useCallback(() => { setLoading(true); Promise.all([api.get<User[]>('/usuarios'), api.get<CatalogItem[]>('/catalogos/areas?includeInactive=true'), api.get<RequestType[]>('/catalogos/tipos-solicitud?includeInactive=true')]).then(([u, a, t]) => { setUsers(u); setAreas(a); setTypes(t) }).finally(() => setLoading(false)) }, [])
  useEffect(() => { load() }, [load])
  if (loading) return <Spinner/>

  return <div className="page-stack">
    <div className="admin-tabs"><button className={tab === 'users' ? 'active' : ''} onClick={() => setTab('users')}><UserCog/> Usuarios <span>{users.length}</span></button><button className={tab === 'areas' ? 'active' : ''} onClick={() => setTab('areas')}><Building2/> Áreas <span>{areas.length}</span></button><button className={tab === 'types' ? 'active' : ''} onClick={() => setTab('types')}><Tags/> Tipos de solicitud <span>{types.length}</span></button></div>
    <section className="card admin-card"><div className="card__header"><div><h2>{tab === 'users' ? 'Usuarios' : tab === 'areas' ? 'Áreas institucionales' : 'Tipos de solicitud'}</h2><p>Administra los registros disponibles en la plataforma.</p></div><button className="button button--primary" onClick={() => setModal({ kind: tab })}><Plus/> Agregar</button></div>
      {tab === 'users' && <AdminTable headers={['Nombre', 'Correo', 'Rol', 'Estado', '']} rows={users.map(item => [item.fullName, item.email, translate(item.role), <span className={`active-state ${item.isActive ? 'on' : ''}`}>{item.isActive ? 'Activo' : 'Inactivo'}</span>, <button className="row-action" onClick={() => setModal({ kind: 'users', item })}><Edit3/></button>])}/>} 
      {tab === 'areas' && <AdminTable headers={['Nombre', 'Estado', '']} rows={areas.map(item => [item.name, <span className={`active-state ${item.isActive ? 'on' : ''}`}>{item.isActive ? 'Activa' : 'Inactiva'}</span>, <button className="row-action" onClick={() => setModal({ kind: 'areas', item })}><Edit3/></button>])}/>} 
      {tab === 'types' && <AdminTable headers={['Nombre', 'Descripción', 'SLA', 'Estado', '']} rows={types.map(item => [item.name, item.description ?? '—', `${item.slaDays} días`, <span className={`active-state ${item.isActive ? 'on' : ''}`}>{item.isActive ? 'Activo' : 'Inactivo'}</span>, <button className="row-action" onClick={() => setModal({ kind: 'types', item })}><Edit3/></button>])}/>} 
    </section>
    {modal && <AdminModal data={modal} onClose={() => setModal(null)} onSaved={() => { setModal(null); load(); setToast({ type: 'success', message: 'Registro guardado correctamente.' }) }} onError={message => setToast({ type: 'error', message })}/>}<Toast toast={toast} onClose={() => setToast(null)}/>
  </div>
}

function AdminTable({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) {
  if (!rows.length) return <EmptyState/>
  return <div className="table-wrap"><table><thead><tr>{headers.map((header, i) => <th key={i}>{header}</th>)}</tr></thead><tbody>{rows.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>)}</tbody></table></div>
}

function AdminModal({ data, onClose, onSaved, onError }: { data: { kind: Tab; item?: User | CatalogItem | RequestType }; onClose: () => void; onSaved: () => void; onError: (message: string) => void }) {
  const item = data.item
  const isUser = data.kind === 'users'
  const isType = data.kind === 'types'
  const [name, setName] = useState(item ? ('fullName' in item ? item.fullName : item.name) : '')
  const [email, setEmail] = useState(item && 'email' in item ? item.email : '')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>(item && 'role' in item ? item.role : 'Requester')
  const [description, setDescription] = useState(item && 'description' in item ? item.description ?? '' : '')
  const [slaDays, setSlaDays] = useState(item && 'slaDays' in item ? item.slaDays : 5)
  const [active, setActive] = useState(item ? item.isActive : true)
  const [saving, setSaving] = useState(false)
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setSaving(true)
    try {
      if (isUser) {
        const body = item ? { fullName: name, role, isActive: active } : { fullName: name, email, password, role }
        if (item) await api.put(`/usuarios/${item.id}`, body)
        else await api.post('/usuarios', body)
      } else {
        const path = isType ? '/catalogos/tipos-solicitud' : '/catalogos/areas'
        const body = isType ? { name, description: description || null, slaDays, isActive: active } : { name, isActive: active }
        if (item) await api.put(`${path}/${item.id}`, body)
        else await api.post(path, body)
      }
      onSaved()
    } catch (reason) { onError(reason instanceof ApiError ? reason.message : 'No se pudo guardar el registro.') }
    finally { setSaving(false) }
  }
  return <div className="modal-backdrop" role="dialog" aria-modal="true"><form className="modal" onSubmit={submit}><div className="modal__head"><div><h2>{item ? 'Editar' : 'Agregar'} {isUser ? 'usuario' : isType ? 'tipo de solicitud' : 'área'}</h2><p>Completa la información del registro.</p></div><button type="button" onClick={onClose}><X/></button></div><div className="modal__body"><label className="field">Nombre <span>*</span><input value={name} onChange={e => setName(e.target.value)} required/></label>{isUser && !item && <><label className="field">Correo electrónico <span>*</span><input type="email" value={email} onChange={e => setEmail(e.target.value)} required/></label><label className="field">Contraseña <span>*</span><input type="password" minLength={8} value={password} onChange={e => setPassword(e.target.value)} required/></label></>}{isUser && <label className="field">Rol <span>*</span><select value={role} onChange={e => setRole(e.target.value as UserRole)}><option value="Administrator">Administrador</option><option value="Analyst">Analista</option><option value="Requester">Solicitante</option></select></label>}{isType && <><label className="field">Descripción<textarea value={description} onChange={e => setDescription(e.target.value)}/></label><label className="field">Días de SLA <span>*</span><input type="number" min="1" max="365" value={slaDays} onChange={e => setSlaDays(Number(e.target.value))} required/></label></>}{item && <label className="toggle"><input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)}/><span/> Registro activo</label>}</div><div className="modal__actions"><button type="button" className="button button--secondary" onClick={onClose}>Cancelar</button><button className="button button--primary" disabled={saving}>{saving ? <span className="spinner spinner--light"/> : 'Guardar'}</button></div></form></div>
}
