import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../lib/api'
import useAuthStore from '../stores/authStore'
import type { User } from '../types'

interface RegisterResponse { token: string; user: User }

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
    <div style={{ minHeight: 'calc(100vh - 56px)', display: 'flex', background: 'var(--c-bg)', position: 'relative', overflow: 'hidden' }}>
      {/* Éléments décoratifs d'arrière-plan */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '-5%',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(26,155,196,0.12) 0%, transparent 70%)',
        filter: 'blur(60px)',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        right: '-5%',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(18,118,158,0.08) 0%, transparent 70%)',
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
          background: 'linear-gradient(135deg, rgba(26,155,196,0.08) 0%, rgba(18,118,158,0.05) 100%)',
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
              Rejoignez la communauté ! 🚀
            </h1>
            <p style={{ 
              fontSize: '1.1rem', 
              color: 'var(--c-sub)', 
              lineHeight: 1.7,
              marginBottom: '2rem'
            }}>
              Créez votre compte gratuitement et accédez à toutes les fonctionnalités de la plateforme pour interagir avec l'auteur et la communauté.
            </p>
          </div>

          {/* Avantages */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { icon: '💬', title: 'Commentaires & Réponses', desc: 'Partagez votre avis et échangez sur tous les articles', color: 'rgba(59, 130, 246, 0.1)' },
              { icon: '❤️', title: 'Likes & Favoris', desc: 'Sauvegardez et aimez vos contenus préférés', color: 'rgba(239, 68, 68, 0.1)' },
              { icon: '✉️', title: 'Messagerie directe', desc: 'Contactez directement l\'auteur pour échanger', color: 'rgba(16, 185, 129, 0.1)' },
              { icon: '🔔', title: 'Notifications en temps réel', desc: 'Ne ratez aucune réponse ou nouvel article', color: 'rgba(251, 146, 60, 0.1)' }
            ].map(({ icon, title, desc, color }) => (
              <div key={title} style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: '1rem',
                padding: '1rem',
                background: color,
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.05)',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateX(4px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'translateX(0)')}>
                <div style={{
                  fontSize: '1.5rem',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(255,255,255,0.05)',
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
                Créer un compte
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--c-muted)' }}>
                Déjà membre ?{' '}
                <Link to="/login" style={{ 
                  color: 'var(--c-cyan)', 
                  fontWeight: 600,
                  textDecoration: 'none',
                  borderBottom: '2px solid transparent',
                  transition: 'border-color 0.2s'
                }}
                onMouseEnter={e => (e.currentTarget.style.borderBottomColor = 'var(--c-cyan)')}
                onMouseLeave={e => (e.currentTarget.style.borderBottomColor = 'transparent')}>
                  Se connecter
                </Link>
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {[
                { id: 'name', label: 'Nom complet', type: 'text', value: name, setter: setName, auto: 'name', ph: 'Jean Dupont', icon: '👤' },
                { id: 'email', label: 'Adresse email', type: 'email', value: email, setter: setEmail, auto: 'email', ph: 'vous@exemple.com', icon: '📧' },
                { id: 'password', label: 'Mot de passe', type: 'password', value: password, setter: setPassword, auto: 'new-password', ph: 'Au moins 8 caractères', icon: '🔒' },
              ].map(({ id, label, type, value, setter, auto, ph, icon }) => (
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
                    required autoComplete={auto} placeholder={ph}
                    style={{
                      width: '100%', 
                      padding: '0.875rem 1rem', 
                      borderRadius: '10px',
                      fontSize: '0.95rem', 
                      background: 'var(--c-bg)', 
                      color: 'var(--c-text)',
                      border: `2px solid ${fieldErr(id) ? '#E05252' : 'var(--c-border)'}`,
                      outline: 'none', 
                      transition: 'all 0.2s',
                      fontFamily: type === 'password' ? 'monospace' : 'inherit'
                    }}
                    onFocus={e => {
                      if (!fieldErr(id)) {
                        (e.target as HTMLInputElement).style.borderColor = 'var(--c-cyan)';
                        (e.target as HTMLInputElement).style.background = 'var(--c-surface)';
                      }
                    }}
                    onBlur={e => {
                      if (!fieldErr(id)) {
                        (e.target as HTMLInputElement).style.borderColor = 'var(--c-border)';
                        (e.target as HTMLInputElement).style.background = 'var(--c-bg)';
                      }
                    }}
                  />
                  {fieldErr(id) && (
                    <p style={{ 
                      fontSize: '0.8rem', 
                      color: '#E05252', 
                      marginTop: '0.4rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}>
                      <span>⚠️</span>
                      {fieldErr(id)}
                    </p>
                  )}
                </div>
              ))}

              {errors.general && (
                <div style={{ 
                  padding: '0.875rem 1rem', 
                  borderRadius: '10px', 
                  fontSize: '0.875rem', 
                  background: 'rgba(224,82,82,0.1)', 
                  color: '#E05252', 
                  border: '1px solid rgba(224,82,82,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span style={{ fontSize: '1.2em' }}>⚠️</span>
                  {errors.general[0]}
                </div>
              )}

              <button
                type="submit" disabled={loading}
                style={{
                  padding: '1rem', 
                  borderRadius: '10px', 
                  fontSize: '1rem', 
                  fontWeight: 700,
                  background: loading ? 'var(--c-muted)' : 'linear-gradient(135deg, var(--c-cyan), var(--c-cyan-dim))',
                  color: '#fff', 
                  border: 'none',
                  marginTop: '0.5rem', 
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: loading ? 'none' : '0 8px 24px rgba(26, 155, 196, 0.4)',
                  transition: 'all 0.3s'
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
                    <span>⏳</span> Création en cours...
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    Créer mon compte <span style={{ fontSize: '1.2em' }}>→</span>
                  </span>
                )}
              </button>

              <p style={{ 
                fontSize: '0.75rem', 
                color: 'var(--c-muted)', 
                textAlign: 'center',
                lineHeight: 1.6
              }}>
                En créant un compte, vous acceptez nos{' '}
                <span style={{ color: 'var(--c-cyan)', cursor: 'pointer' }}>conditions d'utilisation</span> et notre{' '}
                <span style={{ color: 'var(--c-cyan)', cursor: 'pointer' }}>politique de confidentialité</span>.
              </p>
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
            Inscription 100% gratuite • Vos données sont protégées
          </p>
        </div>
      </div>
    </div>
  )
}
