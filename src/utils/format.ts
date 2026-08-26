const labels: Record<string, string> = {
  Registered: 'Registrada',
  InAnalysis: 'En análisis',
  InProgress: 'En progreso',
  WaitingForRequester: 'En espera',
  Resolved: 'Resuelta',
  Closed: 'Cerrada',
  Low: 'Baja',
  Medium: 'Media',
  High: 'Alta',
  Critical: 'Crítica',
  Administrator: 'Administrador',
  Analyst: 'Analista',
  Requester: 'Solicitante',
  Internal: 'Interno',
  Public: 'Público',
}

export const translate = (value?: string) => value ? labels[value] ?? value : 'Sin asignar'

export const formatDate = (value?: string, includeTime = false) => {
  if (!value) return '—'
  return new Intl.DateTimeFormat('es-DO', includeTime
    ? { dateStyle: 'medium', timeStyle: 'short' }
    : { dateStyle: 'medium' }).format(new Date(value))
}

export const initials = (name: string) => name.split(' ').slice(0, 2).map(part => part[0]).join('').toUpperCase()

export const classToken = (value: string) => value.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
