import { Inbox } from 'lucide-react'

export function EmptyState({ title = 'No hay resultados', text = 'Intenta ajustar los filtros de búsqueda.' }: { title?: string; text?: string }) {
  return <div className="empty-state"><Inbox size={38}/><strong>{title}</strong><span>{text}</span></div>
}
