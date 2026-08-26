import { CheckCircle2, XCircle, X } from 'lucide-react'

export interface ToastState {
  type: 'success' | 'error'
  message: string
}

export function Toast({ toast, onClose }: { toast: ToastState | null; onClose: () => void }) {
  if (!toast) return null
  return (
    <div className={`toast toast--${toast.type}`} role="status">
      {toast.type === 'success' ? <CheckCircle2 size={20}/> : <XCircle size={20}/>}
      <span>{toast.message}</span>
      <button onClick={onClose} aria-label="Cerrar mensaje"><X size={17}/></button>
    </div>
  )
}
