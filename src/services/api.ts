import type { LoginResponse } from '../types'

const API_URL = '/api'
const SESSION_KEY = 'sb-session'

export class ApiError extends Error {
  status: number
  details?: Record<string, string[]>

  constructor(message: string, status: number, details?: Record<string, string[]>) {
    super(message)
    this.status = status
    this.details = details
  }
}

export function getSession(): LoginResponse | null {
  try {
    const value = localStorage.getItem(SESSION_KEY)
    return value ? JSON.parse(value) : null
  } catch {
    return null
  }
}

export function saveSession(session: LoginResponse) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const session = getSession()
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
      ...init.headers,
    },
  })

  if (response.status === 401 && !path.includes('/auth/login')) {
    clearSession()
    window.location.assign('/login')
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    const message = body.detail ?? body.title ?? 'No fue posible completar la operación.'
    throw new ApiError(message, response.status, body.errors)
  }

  if (response.status === 204) return undefined as T
  return response.json()
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body: body === undefined ? undefined : JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) => request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
}
