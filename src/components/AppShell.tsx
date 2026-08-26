import { useEffect, useState } from 'react'
import { Bell, ChevronDown, ClipboardList, Gauge, LogOut, Menu, PlusCircle, Users, X } from 'lucide-react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'
import type { Notification } from '../types'
import { formatDate, initials, translate } from '../utils/format'
import { Logo } from './Logo'

const titles: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Panel de control', subtitle: 'Resumen general de las solicitudes internas' },
  '/solicitudes': { title: 'Solicitudes', subtitle: 'Consulta y seguimiento de solicitudes' },
  '/solicitudes/nueva': { title: 'Nueva solicitud', subtitle: 'Registra un nuevo requerimiento de servicio' },
  '/administracion': { title: 'Administración', subtitle: 'Gestión de usuarios y catálogos' },
}

export function AppShell() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const route = location.pathname.startsWith('/solicitudes/') && location.pathname !== '/solicitudes/nueva'
    ? { title: 'Detalle de solicitud', subtitle: 'Información, actividad y gestión del caso' }
    : titles[location.pathname] ?? titles['/']

  useEffect(() => {
    api.get<Notification[]>('/notificaciones').then(setNotifications).catch(() => undefined)
  }, [location.pathname])

  const unread = notifications.filter(item => !item.isRead).length
  const markRead = async (notification: Notification) => {
    if (!notification.isRead) await api.patch(`/notificaciones/${notification.id}/leida`)
    setNotifications(current => current.map(item => item.id === notification.id ? { ...item, isRead: true } : item))
    if (notification.requestId) navigate(`/solicitudes/${notification.requestId}`)
    setNotificationsOpen(false)
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar__top"><Logo/><button className="mobile-close" onClick={() => setMenuOpen(false)}><X/></button></div>
        <nav>
          <span className="nav-label">Principal</span>
          <NavLink to="/" end onClick={() => setMenuOpen(false)}><Gauge/><span>Panel de control</span></NavLink>
          <NavLink to="/solicitudes" onClick={() => setMenuOpen(false)}><ClipboardList/><span>Solicitudes</span></NavLink>
          <NavLink to="/solicitudes/nueva" onClick={() => setMenuOpen(false)}><PlusCircle/><span>Crear solicitud</span></NavLink>
          {user?.role === 'Administrator' && <><span className="nav-label nav-label--second">Configuración</span><NavLink to="/administracion" onClick={() => setMenuOpen(false)}><Users/><span>Administración</span></NavLink></>}
        </nav>
        <div className="sidebar__user"><span className="avatar">{initials(user?.fullName ?? 'Usuario')}</span><div><strong>{user?.fullName}</strong><span>{translate(user?.role)}</span></div><button onClick={logout} title="Cerrar sesión"><LogOut/></button></div>
      </aside>
      {menuOpen && <button className="overlay" onClick={() => setMenuOpen(false)} aria-label="Cerrar menú"/>}
      <main className="main-area">
        <header className="topbar">
          <button className="menu-button" onClick={() => setMenuOpen(true)}><Menu/></button>
          <div><h1>{route.title}</h1><p>{route.subtitle}</p></div>
          <div className="topbar__actions">
            <div className="notifications">
              <button className="icon-button" onClick={() => setNotificationsOpen(!notificationsOpen)} aria-label="Notificaciones"><Bell/>{unread > 0 && <span>{unread}</span>}</button>
              {notificationsOpen && <div className="notification-panel">
                <div className="notification-panel__head"><strong>Notificaciones</strong><span>{unread} sin leer</span></div>
                <div className="notification-panel__list">
                  {notifications.length === 0 ? <p className="notification-empty">No tienes notificaciones.</p> : notifications.slice(0, 8).map(item => <button key={item.id} className={!item.isRead ? 'unread' : ''} onClick={() => markRead(item)}><span className="notification-dot"/><span><strong>{item.subject}</strong><small>{item.message}</small><time>{formatDate(item.createdAt, true)}</time></span></button>)}
                </div>
              </div>}
            </div>
            <div className="topbar__profile"><span className="avatar">{initials(user?.fullName ?? 'Usuario')}</span><div><strong>{user?.fullName}</strong><span>{translate(user?.role)}</span></div><ChevronDown/></div>
          </div>
        </header>
        <section className="page-content"><Outlet/></section>
      </main>
    </div>
  )
}
