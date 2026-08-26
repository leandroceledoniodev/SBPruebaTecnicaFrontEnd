import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { useAuth } from './context/AuthContext'
import { AdminPage } from './pages/AdminPage'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import { NewRequestPage } from './pages/NewRequestPage'
import { RequestDetailPage } from './pages/RequestDetailPage'
import { RequestsPage } from './pages/RequestsPage'

function ProtectedLayout() {
  const { user } = useAuth()
  return user ? <AppShell/> : <Navigate to="/login" replace/>
}

function AdminRoute() {
  const { user } = useAuth()
  return user?.role === 'Administrator' ? <AdminPage/> : <Navigate to="/" replace/>
}

export default function App() {
  const { user } = useAuth()
  return <Routes>
    <Route path="/login" element={user ? <Navigate to="/" replace/> : <LoginPage/>}/>
    <Route element={<ProtectedLayout/>}>
      <Route index element={<DashboardPage/>}/>
      <Route path="solicitudes" element={<RequestsPage/>}/>
      <Route path="solicitudes/nueva" element={<NewRequestPage/>}/>
      <Route path="solicitudes/:id" element={<RequestDetailPage/>}/>
      <Route path="administracion" element={<AdminRoute/>}/>
    </Route>
    <Route path="*" element={<Navigate to="/" replace/>}/>
  </Routes>
}
