import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { api, clearSession, getSession, saveSession } from '../services/api'
import type { LoginResponse, User } from '../types'

interface AuthValue {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<LoginResponse | null>(() => getSession())

  const value = useMemo<AuthValue>(() => ({
    user: session?.user ?? null,
    login: async (email, password) => {
      const response = await api.post<LoginResponse>('/auth/login', { email, password })
      saveSession(response)
      setSession(response)
    },
    logout: () => {
      clearSession()
      setSession(null)
    },
  }), [session])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('AuthContext no disponible')
  return value
}
