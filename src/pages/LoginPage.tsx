import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import api from '../lib/api'
import useAuthStore from '../stores/authStore'
import type { User } from '../types'

interface LoginResponse { token: string; user: User }

// Image Unsplash — photo code/tech (libre d'utilisation)
const BG_IMAGE = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=900&q=80&auto=format&fit=crop'

export default function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setToken } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const from = searchParams.get('from') ?? '/'

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post<LoginResponse>('/auth/login', { email, password })
      setToken(res.data.token, res.data.user)
      navigate(decodeURIComponent(from), { replace: true })
    } catch (err: unknown) {
      const s = (err as { response?: { status: number } }).response?.status
      setError(
        s === 401 ? 'Email ou mot de passe incorrect.'
        : s === 429 ? 'Trop de tentatives. Réessayez dans une minute.'
        : 'Une erreur est survenue. Veuillez réessayer.'
      )
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 56px)', display: 'flex' }}>
      {/* Colonne image — cachée sur mobile */}
      <div
        className="auth-image-col"
        style={{
          flex: '0 0 50%',
          position: 'relative',
          overflow: 'hidden',
          backgroundImage: `url(${BG_IMAGE})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay gradient */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, rgba(10,15,39,0.85) 0%, rgba(18,118,158,0.6) 100%)',
        }} />
        {/* Texte overlay */}
        <div style={{
          position: 'relative', zIndex: 1,
          height: '100%',
          display: 'flex', flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '3rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--c-cyan)' }} />
            <span style={{ fontFamily: 'var(--font-head)', fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>Bocovo Blog</span>
          </div>
          <p style={{ fontSize: '1.5rem', fontFamily: 'var(--font-head)', color: '#fff', lineHeight: 1.4, marginBottom: '0.75rem' }}>
            "Partager des idées,<br />c'est multiplier leur impact."
          </p>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
            Rejoignez une communauté de passionnés de tech.
          </p>
        </div>
      </div>

      {/* Colonne formulaire */}
      <div style={{
        flex: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '2rem 1.5rem',
        background: 'var(--c-bg)',
      }}>
        <div style={{ width: '100%', maxWidth: '380px' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '1.75rem', color: 'var(--c-text)', marginBottom: '0.4rem' }}>
              Bon retour 👋
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--c-muted)' }}>
              Pas encore de compte ?{' '}
              <Link to="/register" style={{ color: 'var(--c-cyan)', fontWeight: 500 }}>S'inscrire</Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {[
              { id: 'email', label: 'Adresse email', type: 'email', value: email, setter: setEmail, auto: 'email', placeholder: 'vous@exemple.com' },
              { id: 'password', label: 'Mot de passe', type: 'password', value: password, setter: setPassword, auto: 'current-password', placeholder: '••••••••' },
            ].map(({ id, label, type, value, setter, auto, placeholder }) => (
              <div key={id}>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 500, color: 'var(--c-sub)', marginBottom: '0.4rem' }}>
                  {label}
                </label>
                <input
                  type={type} value={value} onChange={e => setter(e.target.value)}
                  required autoComplete={auto} placeholder={placeholder}
                  style={{
                    width: '100%', padding: '0.7rem 0.875rem', borderRadius: '8px',
                    fontSize: '0.9rem', background: 'var(--c-surface)',
                    color: 'var(--c-text)', border: '1px solid var(--c-border)', outline: 'none',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={e => (e.target.style.borderColor = 'var(--c-cyan-dim)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--c-border)')}
                />
              </div>
            ))}

            {error && (
              <div style={{
                padding: '0.65rem 0.875rem', borderRadius: '8px', fontSize: '0.85rem',
                background: 'rgba(224,82,82,0.08)', color: 'var(--c-red)',
                border: '1px solid rgba(224,82,82,0.2)', display: 'flex', alignItems: 'center', gap: '0.5rem',
              }}>
                <span>⚠</span> {error}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              style={{
                padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600,
                background: loading ? 'var(--c-muted)' : 'var(--c-cyan-dim)',
                color: '#fff', marginTop: '0.25rem', transition: 'background 0.15s',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Connexion en cours…' : 'Se connecter →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
