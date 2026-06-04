import { Outlet } from 'react-router-dom'
import { Link } from 'react-router-dom'
import Navbar from './Navbar'

export default function AppLayout() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--c-bg)' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <footer style={{ background: 'var(--c-surface)', borderTop: '1px solid var(--c-border)', padding: '2rem 1.25rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%', background: 'var(--c-cyan)' }} />
            <span style={{ fontFamily: 'var(--font-head)', fontWeight: 700, color: 'var(--c-text)' }}>Bocovo Blog</span>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            {[{ to: '/', label: 'Articles' }, { to: '/about', label: 'À propos' }].map(({ to, label }) => (
              <Link key={to} to={to} style={{ fontSize: '0.85rem', color: 'var(--c-muted)' }}>{label}</Link>
            ))}
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--c-muted)' }}>© {new Date().getFullYear()} Bocovo Blog</p>
        </div>
      </footer>
    </div>
  )
}
