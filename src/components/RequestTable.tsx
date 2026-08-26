import { ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { RequestSummary } from '../types'
import { formatDate } from '../utils/format'
import { EmptyState } from './EmptyState'
import { StatusBadge } from './StatusBadge'

export function RequestTable({ items }: { items: RequestSummary[] }) {
  const navigate = useNavigate()
  if (!items.length) return <EmptyState/>
  return (
    <div className="table-wrap">
      <table>
        <thead><tr><th>Código</th><th>Solicitud</th><th>Estado</th><th>Prioridad</th><th>Responsable</th><th>Fecha límite</th><th/></tr></thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id} onClick={() => navigate(`/solicitudes/${item.id}`)} tabIndex={0} onKeyDown={event => event.key === 'Enter' && navigate(`/solicitudes/${item.id}`)}>
              <td><span className="code">{item.code}</span></td>
              <td><strong>{item.title}</strong><small>{item.area} · {item.requestType}</small></td>
              <td><StatusBadge value={item.status}/></td>
              <td><StatusBadge value={item.priority} type="priority"/></td>
              <td>{item.assignee ?? <span className="muted">Sin asignar</span>}</td>
              <td className={item.isOverdue ? 'overdue' : ''}>{formatDate(item.dueDate)}</td>
              <td><ArrowRight size={17}/></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
