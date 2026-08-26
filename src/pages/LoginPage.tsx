import { useState, type FormEvent } from 'react'
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { ApiError } from '../services/api'
import { Logo } from '../components/Logo'

export function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('admin@sb.gob.do')
  const [password, setPassword] = useState('Password123!')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : 'No fue posible conectar con el servidor.')
    } finally {
      setLoading(false)
    }
  }

  return <main className="login-page">
    <section className="login-visual">
      <div className="login-visual__glow"/>
      <Logo/>
      <div className="login-visual__content">
        <span className="eyebrow">Plataforma institucional</span>
        <h1>Solicitudes internas,<br/><em>gestión más simple.</em></h1>
        <p>Registra, consulta y da seguimiento a tus requerimientos tecnológicos desde un solo lugar.</p>
      </div>
      <span className="login-visual__footer">Superintendencia de Bancos · República Dominicana</span>
    </section>
    <section className="login-form-panel">
      <div className="login-mobile-logo"><Logo compact/></div>
      <form className="login-form" onSubmit={submit}>
        <span className="eyebrow">Bienvenido</span>
        <h2>Inicia sesión</h2>
        <p>Ingresa tus credenciales para acceder a la plataforma.</p>
        {error && <div className="form-error" role="alert">{error}</div>}
        <label>Correo electrónico<div className="input-icon"><Mail/><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="nombre@sb.gob.do" required autoComplete="email"/></div></label>
        <label>Contraseña<div className="input-icon"><LockKeyhole/><input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password"/><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label="Mostrar contraseña">{showPassword ? <EyeOff/> : <Eye/>}</button></div></label>
        <button className="button button--primary button--large" disabled={loading}>{loading ? <span className="spinner spinner--light"/> : <>Ingresar <ArrowRight/></>}</button>
      </form>
    </section>
  </main>
}
