import { useEffect, useState } from 'react'
import api from '../lib/api'

interface AboutData {
  bio: string | null
  links: Record<string, string> | null
  extra_sections: Array<{ title: string; content: string }> | null
  profile_photo: string | null
}

export default function AboutPage() {
  const [about, setAbout] = useState<AboutData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<AboutData>('/about').then(r => setAbout(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ height: i === 0 ? '200px' : '80px', borderRadius: '10px', background: 'var(--c-surface)' }} />
          ))}
        </div>
        <div style={{ height: '200px', borderRadius: '10px', background: 'var(--c-surface)' }} />
      </div>
    </div>
  )

  if (!about) return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '4rem 1.5rem', textAlign: 'center' }}>
      <p style={{ fontSize: '0.9rem', color: 'var(--c-muted)' }}>Page À propos non disponible.</p>
    </div>
  )

  const socialLinks = Object.entries(about.links ?? {}).filter(([, v]) => v)

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: '2rem', alignItems: 'start' }}
        className="about-grid">

        {/* Contenu principal */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <div style={{ width: '12px', height: '2px', background: 'var(--c-cyan)' }} />
            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--c-muted)', fontWeight: 600 }}>À propos</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '2.25rem', fontWeight: 700, color: 'var(--c-text)', marginBottom: '1.75rem' }}>
            Bocovo Blog
          </h1>

          {about.bio && (
            <div style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)', borderRadius: '10px', padding: '1.5rem', marginBottom: '1.25rem' }}>
              <p style={{ fontSize: '1rem', color: 'var(--c-sub)', lineHeight: 1.85, whiteSpace: 'pre-wrap' }}>{about.bio}</p>
            </div>
          )}

          {about.extra_sections?.map((s, i) => (
            <div key={i} style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)', borderRadius: '10px', padding: '1.5rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <div style={{ width: '3px', height: '1.2em', background: 'var(--c-cyan)', borderRadius: '2px' }} />
                <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '1.15rem', color: 'var(--c-text)' }}>{s.title}</h2>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--c-sub)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{s.content}</p>
            </div>
          ))}
        </div>

        {/* Sidebar profil */}
        <aside style={{ position: 'sticky', top: '72px' }}>
          <div style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)', borderRadius: '10px', padding: '1.5rem', textAlign: 'center' }}>
            {about.profile_photo
              ? <img src={about.profile_photo} alt="Profil"
                  style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 1rem', border: '2px solid var(--c-cyan-dim)', display: 'block' }} />
              : <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--c-cyan-dim), var(--c-cyan))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', fontWeight: 700, color: '#fff', margin: '0 auto 1rem' }}>B</div>
            }
            <p style={{ fontFamily: 'var(--font-head)', fontWeight: 700, color: 'var(--c-text)', marginBottom: '0.25rem' }}>Bocovo Blog</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--c-muted)', marginBottom: socialLinks.length ? '1.25rem' : 0 }}>Développeur &amp; auteur</p>

            {socialLinks.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {socialLinks.map(([k, v]) => (
                  <a key={k} href={v} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', color: 'var(--c-sub)', background: 'var(--c-surface2)', border: '1px solid var(--c-border)', textDecoration: 'none', transition: 'color 0.15s' }}>
                    <span style={{ textTransform: 'capitalize' }}>{k}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>

      <style>{`
        @media (max-width: 640px) { .about-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  )
}
