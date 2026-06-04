import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../lib/api'
import useAuthStore from '../stores/authStore'
import type { User } from '../types'

interface RegisterResponse { token: string; user: User }

const BG_IMAGE = 'https://images.unsplash.com/photo-1484417894907-623942c8ee29?w=900&q=80&auto=format&fit=crop'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { setToken } = useAuthStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)
    try {
      const res = await api.post<RegisterResponse>('/auth/register', { name, email, password })
      setToken(res.data.token, res.data.user)
      navigate('/', { replace: true })
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { errors?: Record<string, string[]> } } }).response?.data
      setErrors(data?.errors ?? { general: ['Une erreur est survenue.'] })
    } finally { setLoading(false) }
  }

  const fieldErr = (f: string) => errors[f]?.[0]

  return (
    <div style={{ minHeight: 'calc(100vh - 56px)', display: 'flex' }}>
      {/* Colonne image */}
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
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, rgba(4,55,117,0.9) 0%, rgba(18,118,158,0.7) 100%)',
        }} />
        <div style={{
          position: 'relative', zIndex: 1,
          height: '100%',
          display: 'flex', flexDirection: 'column',
          justifyContent: 'center',
          padding: '3rem',
          gap: '1.5rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#fff' }} />
            <span style={{ fontFamily: 'var(--font-head)', fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>Bocovo Blog</span>
          </div>
          <div>
            <p style={{ fontSize: '1.75rem', fontFamily: 'var(--font-head)', color: '#fff', lineHeight: 1.35, marginBottom: '0.75rem' }}>
              Rejoignez la communauté
            </p>
            <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.7 }}>
              Commentez, likez vos articles préférés et échangez directement avec l'auteur.
            </p>
          </div>
          {/* Bénéfices */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {['💬 Commentez et répondez aux articles', '❤️ Likez et sauvegardez vos favoris', '✉️ Messagerie directe avec l\'auteur'].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.85)' }}>
                {item}
              </div>
            ))}
          </div>
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
              Créer un compte
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--c-muted)' }}>
              Déjà inscrit ?{' '}
              <Link to="/login" style={{ color: 'var(--c-cyan)', fontWeight: 500 }}>Se connecter</Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {[
              { id: 'name', label: 'Nom complet', type: 'text', value: name, setter: setName, auto: 'name', ph: 'Jean Dupont' },
              { id: 'email', label: 'Adresse email', type: 'email', value: email, setter: setEmail, auto: 'email', ph: 'vous@exemple.com' },
              { id: 'password', label: 'Mot de passe', type: 'password', value: password, setter: setPassword, auto: 'new-password', ph: 'Au moins 8 caractères' },
            ].map(({ id, label, type, value, setter, auto, ph }) => (
              <div key={id}>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 500, color: 'var(--c-sub)', marginBottom: '0.4rem' }}>{label}</label>
                <input
                  type={type} value={value} onChange={e => setter(e.target.value)}
                  required autoComplete={auto} placeholder={ph}
                  style={{
                    width: '100%', padding: '0.7rem 0.875rem', borderRadius: '8px',
                    fontSize: '0.9rem', background: 'var(--c-surface)', color: 'var(--c-text)',
                    border: `1px solid ${fieldErr(id) ? 'rgba(224,82,82,0.5)' : 'var(--c-border)'}`,
                    outline: 'none', transition: 'border-color 0.15s',
                  }}
                  onFocus={e => { if (!fieldErr(id)) e.target.style.borderColor = 'var(--c-cyan-dim)' }}
                  onBlur={e => { if (!fieldErr(id)) e.target.style.borderColor = 'var(--c-border)' }}
                />
                {fieldErr(id) && <p style={{ fontSize: '0.78rem', color: 'var(--c-red)', marginTop: '0.3rem' }}>{fieldErr(id)}</p>}
              </div>
            ))}

            {errors.general && (
              <div style={{ padding: '0.65rem 0.875rem', borderRadius: '8px', fontSize: '0.85rem', background: 'rgba(224,82,82,0.08)', color: 'var(--c-red)', border: '1px solid rgba(224,82,82,0.2)' }}>
                {errors.general[0]}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              style={{
                padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600,
                background: loading ? 'var(--c-muted)' : 'var(--c-cyan-dim)',
                color: '#fff', marginTop: '0.25rem',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Création du compte…' : 'Créer mon compte →'}
            </button>

            <p style={{ fontSize: '0.75rem', color: 'var(--c-muted)', textAlign: 'center' }}>
              En vous inscrivant, vous acceptez nos{' '}
              <span style={{ color: 'var(--c-cyan)' }}>conditions d'utilisation</span>.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
