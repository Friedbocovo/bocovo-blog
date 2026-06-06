import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import useAuthStore from '../../stores/authStore'
import useNotificationStore from '../../stores/notificationStore'
import Avatar from '../shared/Avatar'
import api from '../../lib/api'
import { createEcho } from '../../lib/echo'
import type { Notification } from '../../types'

const S = {
  nav: {
    position: 'sticky' as const, top: 0, zIndex: 100,
    background: 'var(--c-surface)',
    borderBottom: '1px solid var(--c-border)',
    height: '56px',
    display: 'flex', alignItems: 'center',
  },
  inner: {
    width: '100%', maxWidth: '1100px', margin: '0 auto',
    padding: '0 1.25rem',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  logo: {
    fontFamily: 'var(--font-head)', fontSize: '1.3rem', fontWeight: 700,
    color: 'var(--c-text)', display: 'flex', alignItems: 'center', gap: '0.4rem',
  },
  dot: {
    display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #12769E, #1A9BC4)',
  },
  link: (active: boolean): React.CSSProperties => ({
    padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 500,
    color: active ? 'var(--c-cyan)' : 'var(--c-sub)',
    background: active ? 'rgba(26,155,196,0.1)' : 'transparent',
    transition: 'all 0.15s',
  }),
  btnOutline: {
    padding: '0.35rem 1rem', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 500,
    color: 'var(--c-cyan)', border: '1px solid var(--c-cyan-dim)',
    background: 'transparent', transition: 'all 0.15s',
  } as React.CSSProperties,
  btnFill: {
    padding: '0.35rem 1rem', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600,
    color: '#fff', background: 'var(--c-cyan-dim)', transition: 'all 0.15s',
  } as React.CSSProperties,
  dropdown: {
    position: 'absolute' as const, top: 'calc(100% + 8px)', right: 0,
    minWidth: '180px', borderRadius: '8px', overflow: 'hidden',
    background: 'var(--c-surface2)', border: '1px solid var(--c-border)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
  },
}

export default function Navbar() {
  const { token, user, logout } = useAuthStore()
  const { notifications, unreadCount, setNotifications, addNotification, markRead, markAllRead } = useNotificationStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [showNotif, setShowNotif] = useState(false)
  const [showUser, setShowUser] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const userRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setMenuOpen(false) }, [location.pathname])
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (!notifRef.current?.contains(e.target as Node)) setShowNotif(false)
      if (!userRef.current?.contains(e.target as Node)) setShowUser(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])
  useEffect(() => {
    if (!token) return
    api.get<Notification[]>('/notifications').then(r => {
      const d = Array.isArray(r.data) ? r.data : (r.data as { data: Notification[] }).data ?? []
      setNotifications(d)
    }).catch(() => {})
  }, [token, setNotifications])
  
  useEffect(() => {
    if (!token || !user) return
    const echo = createEcho(token)
    echo.private(`user.${user.id}`).listen('NewNotification', (e: { notification: Notification }) => addNotification(e.notification))
    return () => { echo.leave(`user.${user.id}`); echo.disconnect() }
  }, [token, user, addNotification])

  const handleLogout = async () => {
    try { await api.post('/auth/logout') } catch { }
    logout(); navigate('/')
  }

  return (
    <nav style={S.nav}>
      <div style={S.inner}>
        {/* Logo */}
        <Link to="/" style={S.logo}>
          <div style={{ padding: '1.1rem 1rem', borderBottom: '1px solid var(--c-border)', display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
        <img src="/favicon.png" alt="Blog Logo" style={{ width: '28px', height: '28px', borderRadius: '6px', flexShrink: 0, objectFit: 'cover' }} />
                <img src="/blog-logo.png" alt="Blog Logo" style={{ width: '100px', height: '100px', borderRadius: '6px', flexShrink: 0, objectFit: 'cover' }} />

      </div>
        </Link>

        {/* Nav links desktop */}
        <div id="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Link to="/" style={S.link(location.pathname === '/')}>Articles</Link>
          <Link to="/about" style={S.link(location.pathname === '/about')}>À propos</Link>
        </div>

        {/* Auth / user */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {token && user ? (
            <>
              {/* Cloche */}
              <div ref={notifRef} style={{ position: 'relative' }}>
                <button onClick={() => setShowNotif(v => !v)}
                  style={{ width: '36px', height: '36px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--c-sub)', background: showNotif ? 'rgba(26,155,196,0.1)' : 'transparent', position: 'relative' }}>
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
                  </svg>
                  {unreadCount > 0 && (
                    <span style={{ position: 'absolute', top: '4px', right: '4px', width: '14px', height: '14px', borderRadius: '50%', fontSize: '9px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--c-red)', color: '#fff' }}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                {showNotif && (
                  <div style={S.dropdown}>
                    <div style={{ padding: '0.625rem 1rem', borderBottom: '1px solid var(--c-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--c-text)' }}>Notifications</span>
                      {unreadCount > 0 && <button onClick={async () => { await api.patch('/notifications/read-all'); markAllRead() }} style={{ fontSize: '0.72rem', color: 'var(--c-cyan)' }}>Tout lu</button>}
                    </div>
                    <div style={{ maxHeight: '260px', overflowY: 'auto' }}>
                      {notifications.length === 0
                        ? <p style={{ textAlign: 'center', padding: '1.25rem', fontSize: '0.8rem', color: 'var(--c-muted)' }}>Aucune notification</p>
                        : notifications.slice(0, 8).map(n => (
                          <div key={n.id} onClick={() => { 
                            if (!n.read_at) { 
                              api.patch(`/notifications/${n.id}/read`); 
                              markRead(n.id) 
                            }
                            // Redirection basée sur le type de notification
                            if (n.data.post_slug) {
                              navigate(`/posts/${n.data.post_slug}`)
                            } else if (n.data.post_id) {
                              // Fallback si on a l'ID mais pas le slug
                              navigate(`/posts/${n.data.post_id}`)
                            }
                            setShowNotif(false)
                          }}
                            style={{ padding: '0.625rem 1rem', borderBottom: '1px solid var(--c-border)', cursor: 'pointer', background: !n.read_at ? 'rgba(26,155,196,0.06)' : 'transparent' }}>
                            <p style={{ fontSize: '0.8rem', color: 'var(--c-text)' }}>{n.data.message}</p>
                            <p style={{ fontSize: '0.7rem', color: 'var(--c-muted)', marginTop: '2px' }}>{new Date(n.created_at).toLocaleDateString('fr-FR')}</p>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                )}
              </div>

              {/* User menu */}
              <div ref={userRef} style={{ position: 'relative' }}>
                <button onClick={() => setShowUser(v => !v)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.25rem 0.5rem', borderRadius: '6px', background: showUser ? 'rgba(26,155,196,0.1)' : 'transparent' }}>
                  <Avatar src={user.avatar} name={user.name} size="sm" />
                  <span className="hidden sm:block" style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--c-text)', maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</span>
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ color: 'var(--c-muted)' }}><path d="m6 9 6 6 6-6" /></svg>
                </button>
                {showUser && (
                  <div style={S.dropdown}>
                    <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--c-border)' }}>
                      <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--c-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--c-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
                    </div>
                    {[{ to: '/profile', icon: '👤', label: 'Mon profil' }, { to: '/favorites', icon: '🔖', label: 'Mes favoris' }, { to: '/messages', icon: '✉️', label: 'Messages' }].map(({ to, icon, label }) => (
                      <Link key={to} to={to} onClick={() => setShowUser(false)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', fontSize: '0.875rem', color: 'var(--c-sub)' }}>
                        <span style={{ fontSize: '0.9rem' }}>{icon}</span>{label}
                      </Link>
                    ))}
                    <button onClick={handleLogout}
                      style={{ display: 'flex', width: '100%', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', fontSize: '0.875rem', color: 'var(--c-red)', borderTop: '1px solid var(--c-border)', cursor: 'pointer' }}>
                      <span>↩</span> Se déconnecter
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }} className="hidden md:flex">
              <Link to="/login"><button style={S.btnOutline}>Connexion</button></Link>
              <Link to="/register"><button style={S.btnFill}>S'inscrire</button></Link>
            </div>
          )}

          {/* Burger mobile */}
          <button onClick={() => setMenuOpen(v => !v)} className="md:hidden"
            style={{ width: '36px', height: '36px', borderRadius: '6px', display: 'none', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', color: 'var(--c-sub)' }}
            id="burger-btn">
            {[0, 1, 2].map(i => (
              <span key={i} style={{ display: 'block', width: '18px', height: '2px', background: 'currentColor', borderRadius: '2px', transition: 'all 0.2s',
                transform: menuOpen && i === 0 ? 'rotate(45deg) translate(4px, 4px)' : menuOpen && i === 2 ? 'rotate(-45deg) translate(4px, -4px)' : 'none',
                opacity: menuOpen && i === 1 ? 0 : 1 }} />
            ))}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ position: 'absolute', top: '56px', left: 0, right: 0, background: 'var(--c-surface)', borderBottom: '1px solid var(--c-border)', padding: '0.75rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', zIndex: 99 }}>
          <Link to="/" style={{ padding: '0.5rem', fontSize: '0.9rem', color: location.pathname === '/' ? 'var(--c-cyan)' : 'var(--c-sub)' }}>Articles</Link>
          <Link to="/about" style={{ padding: '0.5rem', fontSize: '0.9rem', color: location.pathname === '/about' ? 'var(--c-cyan)' : 'var(--c-sub)' }}>À propos</Link>
          {!token && (
            <>
              <Link to="/login" style={{ padding: '0.5rem', fontSize: '0.9rem', color: 'var(--c-sub)' }}>Connexion</Link>
              <Link to="/register" style={{ display: 'inline-block', marginTop: '0.25rem', padding: '0.5rem 1.25rem', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600, background: 'var(--c-cyan-dim)', color: '#fff', alignSelf: 'flex-start' }}>S'inscrire</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
