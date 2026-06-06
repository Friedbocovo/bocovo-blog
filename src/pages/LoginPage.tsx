import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import api from '../lib/api'
import useAuthStore from '../stores/authStore'
import type { User } from '../types'

interface LoginResponse { token: string; user: User }

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
    <div style={{ minHeight: 'calc(100vh - 56px)', display: 'flex', background: 'var(--c-bg)', position: 'relative', overflow: 'hidden' }}>
      {/* Éléments décoratifs d'arrière-plan */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        right: '-5%',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(18,118,158,0.12) 0%, transparent 70%)',
        filter: 'blur(60px)',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        left: '-5%',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(26,155,196,0.08) 0%, transparent 70%)',
        filter: 'blur(60px)',
        zIndex: 0
      }} />

      {/* Colonne gauche - Illustration/Message d'accueil */}
      <div
        style={{
          flex: '0 0 50%',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '3rem',
          background: 'linear-gradient(135deg, rgba(18,118,158,0.08) 0%, rgba(26,155,196,0.05) 100%)',
          borderRight: '1px solid var(--c-border)'
        }}
        className="auth-image-col"
      >
        <div style={{ maxWidth: '480px', zIndex: 1 }}>
          {/* Logo/Brand */}
          <div style={{ marginBottom: '3rem' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, var(--c-cyan), var(--c-cyan-dim))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(26, 155, 196, 0.3)'
              }}>
                <img 
                  src="/favicon.png" 
                  alt="Logo" 
                  style={{ width: '32px', height: '32px', borderRadius: '8px' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).parentElement!.innerHTML = '<span style="font-size: 1.5rem; font-weight: 800; color: #fff;">B</span>';
                  }}
                />
              </div>
              <span style={{ 
                fontFamily: 'var(--font-head)', 
                fontSize: '1.5rem', 
                fontWeight: 800, 
                color: 'var(--c-text)',
                background: 'linear-gradient(135deg, var(--c-text) 0%, var(--c-cyan) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Bocovo Blog
              </span>
            </div>
          </div>

          {/* Message d'accueil */}
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ 
              fontFamily: 'var(--font-head)', 
              fontSize: 'clamp(2rem, 4vw, 2.75rem)', 
              fontWeight: 900, 
              color: 'var(--c-text)', 
              lineHeight: 1.2,
              marginBottom: '1rem'
            }}>
              Bon retour parmi nous ! 👋
            </h1>
            <p style={{ 
              fontSize: '1.1rem', 
              color: 'var(--c-sub)', 
              lineHeight: 1.7,
              marginBottom: '2rem'
            }}>
              Connectez-vous pour accéder à votre espace personnel, commenter les articles et échanger avec la communauté.
            </p>
          </div>

          {/* Fonctionnalités */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { icon: '💬', title: 'Commentaires illimités', desc: 'Partagez votre avis sur tous les articles' },
              { icon: '🔖', title: 'Favoris personnalisés', desc: 'Sauvegardez vos articles préférés' },
              { icon: '✉️', title: 'Messages directs', desc: 'Échangez directement avec l\'auteur' }
            ].map(({ icon, title, desc }) => (
              <div key={title} style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: '1rem',
                padding: '1rem',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.05)'
              }}>
                <div style={{
                  fontSize: '1.5rem',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(26,155,196,0.1)',
                  borderRadius: '8px',
                  flexShrink: 0
                }}>
                  {icon}
                </div>
                <div>
                  <p style={{ 
                    fontSize: '0.95rem', 
                    fontWeight: 600, 
                    color: 'var(--c-text)',
                    marginBottom: '0.25rem'
                  }}>
                    {title}
                  </p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--c-muted)', lineHeight: 1.5 }}>
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Colonne droite - Formulaire */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          {/* Carte formulaire */}
          <div style={{
            background: 'var(--c-surface)',
            borderRadius: '20px',
            padding: '2.5rem',
            border: '1px solid var(--c-border)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
              <h2 style={{ 
                fontFamily: 'var(--font-head)', 
                fontSize: '1.75rem', 
                fontWeight: 800,
                color: 'var(--c-text)', 
                marginBottom: '0.5rem' 
              }}>
                Connexion
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--c-muted)' }}>
                Pas encore de compte ?{' '}
                <Link to="/register" style={{ 
                  color: 'var(--c-cyan)', 
                  fontWeight: 600,
                  textDecoration: 'none',
                  borderBottom: '2px solid transparent',
                  transition: 'border-color 0.2s'
                }}
                onMouseEnter={e => (e.currentTarget.style.borderBottomColor = 'var(--c-cyan)')}
                onMouseLeave={e => (e.currentTarget.style.borderBottomColor = 'transparent')}>
                  S'inscrire gratuitement
                </Link>
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {[
                { id: 'email', label: 'Adresse email', type: 'email', value: email, setter: setEmail, auto: 'email', placeholder: 'vous@exemple.com', icon: '📧' },
                { id: 'password', label: 'Mot de passe', type: 'password', value: password, setter: setPassword, auto: 'current-password', placeholder: '••••••••', icon: '🔒' },
              ].map(({ id, label, type, value, setter, auto, placeholder, icon }) => (
                <div key={id}>
                  <label style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.875rem', 
                    fontWeight: 600, 
                    color: 'var(--c-text)', 
                    marginBottom: '0.5rem' 
                  }}>
                    <span>{icon}</span>
                    {label}
                  </label>
                  <input
                    type={type} value={value} onChange={e => setter(e.target.value)}
                    required autoComplete={auto} placeholder={placeholder}
                    style={{
                      width: '100%', 
                      padding: '0.875rem 1rem', 
                      borderRadius: '10px',
                      fontSize: '0.95rem', 
                      background: 'var(--c-bg)',
                      color: 'var(--c-text)', 
                      border: '2px solid var(--c-border)', 
                      outline: 'none',
                      transition: 'all 0.2s',
                      fontFamily: type === 'password' ? 'monospace' : 'inherit'
                    }}
                    onFocus={e => {
                      (e.target as HTMLInputElement).style.borderColor = 'var(--c-cyan)';
                      (e.target as HTMLInputElement).style.background = 'var(--c-surface)';
                    }}
                    onBlur={e => {
                      (e.target as HTMLInputElement).style.borderColor = 'var(--c-border)';
                      (e.target as HTMLInputElement).style.background = 'var(--c-bg)';
                    }}
                  />
                </div>
              ))}

              {error && (
                <div style={{
                  padding: '0.875rem 1rem', 
                  borderRadius: '10px', 
                  fontSize: '0.875rem',
                  background: 'rgba(224,82,82,0.1)', 
                  color: '#E05252',
                  border: '1px solid rgba(224,82,82,0.3)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                }}>
                  <span style={{ fontSize: '1.2em' }}>⚠️</span> 
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit" 
                disabled={loading}
                style={{
                  padding: '1rem', 
                  borderRadius: '10px', 
                  fontSize: '1rem', 
                  fontWeight: 700,
                  background: loading ? 'var(--c-muted)' : 'linear-gradient(135deg, var(--c-cyan), var(--c-cyan-dim))',
                  color: '#fff', 
                  border: 'none',
                  marginTop: '0.5rem', 
                  transition: 'all 0.3s',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: loading ? 'none' : '0 8px 24px rgba(26, 155, 196, 0.4)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={e => {
                  if (!loading) {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 32px rgba(26, 155, 196, 0.5)';
                  }
                }}
                onMouseLeave={e => {
                  if (!loading) {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(26, 155, 196, 0.4)';
                  }
                }}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <span>⏳</span> Connexion en cours...
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    Se connecter <span style={{ fontSize: '1.2em' }}>→</span>
                  </span>
                )}
              </button>
            </form>
          </div>

          {/* Message de sécurité */}
          <p style={{ 
            textAlign: 'center', 
            fontSize: '0.8rem', 
            color: 'var(--c-muted)', 
            marginTop: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem'
          }}>
            <span>🔒</span>
            Vos données sont sécurisées et protégées
          </p>
        </div>
      </div>
    </div>
  )
}
