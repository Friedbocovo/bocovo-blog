import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import api from '../lib/api'
import type { Post, Tag, PaginatedResponse } from '../types'
import { usePresence } from '../hooks/usePresence'
import useAuthStore from '../stores/authStore'

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&q=80&auto=format&fit=crop'

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

function PostGrid({ post }: { post: Post }) {
  const navigate = useNavigate()
  const date = post.published_at ? fmtDate(post.published_at) : fmtDate(post.created_at)
  return (
    <article
      onClick={() => navigate(`/posts/${post.slug}`)}
      style={{ cursor: 'pointer', background: 'var(--c-surface)', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--c-border)', transition: 'transform 0.2s, box-shadow 0.2s' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
    >
      <div style={{ height: '180px', overflow: 'hidden' }}>
        <img
          src={post.cover_image ?? `https://images.unsplash.com/photo-${1550000000000 + post.id * 1234567}?w=600&q=70&auto=format&fit=crop`}
          onError={e => { (e.target as HTMLImageElement).src = FALLBACK_IMG }}
          alt={post.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
        />
      </div>
      <div style={{ padding: '1rem 1.1rem 1.1rem' }}>
        {post.tags && post.tags.length > 0 && (
          <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
            {post.tags.slice(0, 2).map(t => (
              <span key={t.id} style={{ fontSize: '0.68rem', color: 'var(--c-cyan)', padding: '0.1rem 0.5rem', borderRadius: '3px', background: 'rgba(26,155,196,0.1)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {t.name}
              </span>
            ))}
          </div>
        )}
        <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '1rem', color: 'var(--c-text)', lineHeight: 1.35, marginBottom: '0.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {post.title}
        </h3>
        {post.excerpt && (
          <p style={{ fontSize: '0.8rem', color: 'var(--c-sub)', lineHeight: 1.6, marginBottom: '0.75rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {post.excerpt}
          </p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.6rem', borderTop: '1px solid var(--c-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--c-cyan-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
              {(post.user?.name ?? 'A')[0].toUpperCase()}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--c-muted)' }}>{post.user?.name ?? 'Auteur'}</span>
          </div>
          <span style={{ fontSize: '0.73rem', color: 'var(--c-muted)' }}>{date}</span>
        </div>
      </div>
    </article>
  )
}

export default function HomePage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuthStore()
  const [posts, setPosts] = useState<Post[]>([])
  const [featuredPost, setFeaturedPost] = useState<Post | null>(null)
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [isMobile, setIsMobile] = useState(false)

  // Détection mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const currentTag = searchParams.get('tag') ?? ''
  const currentSearch = searchParams.get('search') ?? ''

  const fetchPosts = useCallback(async (p: number, tag: string, q: string) => {
    setLoading(true)
    try {
      const params: Record<string, string | number> = { page: p }
      if (tag) params.tag = tag
      if (q) params.search = q
      const res = await api.get<PaginatedResponse<Post>>('/posts', { params })
      const data = res.data.data
      if (p === 1 && !tag && !q) {
        const pinned = data.find(p => p.pinned) ?? data[0] ?? null
        setFeaturedPost(pinned)
        setPosts(pinned ? data.filter(p => p.id !== pinned.id) : data)
      } else {
        setFeaturedPost(null)
        setPosts(data)
      }
      setLastPage(res.data.last_page)
    } catch { setPosts([]); setFeaturedPost(null) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { api.get<Tag[]>('/tags').then(r => setTags(Array.isArray(r.data) ? r.data : [])).catch(() => {}) }, [])
  useEffect(() => { fetchPosts(page, currentTag, currentSearch) }, [page, currentTag, currentSearch, fetchPosts])
  usePresence(useCallback(() => { fetchPosts(page, currentTag, currentSearch) }, [fetchPosts, page, currentTag, currentSearch]))

  return (
    <div>
      {/* ═══ HERO SECTION REDESIGNÉE ═══ */}
      <section style={{
        background: 'radial-gradient(circle at 20% 80%, rgba(18,118,158,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(26,155,196,0.1) 0%, transparent 50%), linear-gradient(135deg, var(--c-surface) 0%, var(--c-surface2) 100%)',
        padding: 'clamp(4rem, 10vw, 6rem) 2rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Éléments décoratifs flottants */}
        <div style={{
          position: 'absolute',
          top: '20%',
          right: '10%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(18,118,158,0.08) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 6s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '10%',
          left: '5%',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(26,155,196,0.05) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 4s ease-in-out infinite reverse'
        }} />
        
        {/* Container avec largeur limitée et bordures arrondies */}
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto',
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: '32px',
          border: '1px solid var(--c-border)',
          padding: 'clamp(2rem, 5vw, 4rem)',
          position: 'relative',
          zIndex: 1,
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'auto 1fr',
            alignItems: 'center', 
            gap: 'clamp(3rem, 6vw, 5rem)',
            textAlign: isMobile ? 'center' : 'left'
          }}>
            {/* Avatar amélioré avec animation */}
            <div style={{
              position: 'relative',
              justifySelf: isMobile ? 'center' : 'start'
            }}>
              <div style={{
                width: 'clamp(140px, 22vw, 200px)',
                height: 'clamp(140px, 22vw, 200px)',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--c-cyan), var(--c-cyan-dim))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'clamp(2.5rem, 6vw, 4rem)',
                fontWeight: 'bold',
                color: 'var(--c-cream)',
                flexShrink: 0,
                boxShadow: '0 20px 40px rgba(26, 155, 196, 0.3), 0 0 0 8px rgba(18,118,158,0.1)',
                border: '6px solid var(--c-surface)',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = 'scale(1.05) rotate(2deg)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 25px 50px rgba(26, 155, 196, 0.4), 0 0 0 12px rgba(18,118,158,0.15)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = 'scale(1) rotate(0deg)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 20px 40px rgba(26, 155, 196, 0.3), 0 0 0 8px rgba(18,118,158,0.1)';
              }}
              >
                <img 
                  src="/favicon.png" 
                  alt="Bocovo" 
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).parentElement!.innerHTML = 'BC';
                  }}
                />
              </div>
              
              {/* Badge flottant */}
              <div style={{
                position: 'absolute',
                bottom: '10px',
                right: '10px',
                background: 'linear-gradient(135deg, #10B981, #059669)',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '0.7rem',
                fontWeight: '600',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span>🟢</span>
                Actif
              </div>
            </div>

            {/* Contenu texte redesigné */}
            <div style={{ flex: 1 }}>
              {/* Tag d'introduction */}
              <div style={{ marginBottom: '1.5rem' }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  color: 'var(--c-cyan)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  padding: '8px 16px',
                  background: 'rgba(18,118,158,0.1)',
                  borderRadius: '20px',
                  border: '1px solid rgba(18,118,158,0.2)'
                }}>
                  <span>✨</span>
                  Bienvenue sur mon univers
                </span>
              </div>

              {/* Titre principal avec effet */}
              <h1 style={{
                fontFamily: 'var(--font-head)',
                fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
                fontWeight: '900',
                color: 'var(--c-text)',
                lineHeight: 1.1,
                marginBottom: '1.5rem',
                background: 'linear-gradient(135deg, var(--c-text) 0%, var(--c-cyan) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Salut, moi c'est{' '}
                <span style={{
                  background: 'linear-gradient(135deg, var(--c-cyan), var(--c-cyan-dim))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  position: 'relative'
                }}>
                  Bocovo
                </span>
                {' '}👋
              </h1>

              {/* Description avec typographie améliorée */}
              <div style={{ marginBottom: '2.5rem', maxWidth: '600px' }}>
                <p style={{
                  fontSize: 'clamp(1rem, 2.2vw, 1.2rem)',
                  color: 'var(--c-sub)',
                  lineHeight: 1.7,
                  marginBottom: '1.5rem',
                  fontWeight: '400'
                }}>
                  <strong style={{ color: 'var(--c-text)' }}>Développeur passionné</strong>, je partage mes découvertes, mes projets et mes réflexions sur le monde du développement web, les nouvelles technologies et l'innovation numérique.
                </p>
                <p style={{
                  fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
                  color: 'var(--c-muted)',
                  lineHeight: 1.6
                }}>
                  Ici, vous trouverez des <em style={{ color: 'var(--c-sub)' }}>tutoriels</em>, des <em style={{ color: 'var(--c-sub)' }}>analyses techniques</em>, des retours d'expérience et des astuces pour améliorer vos compétences de développeur. Rejoignez-moi dans cette aventure !
                </p>
              </div>

              {/* Actions redesignées */}
              <div style={{ 
                display: 'flex', 
                gap: '1.5rem', 
                alignItems: 'center',
                justifyContent: isMobile ? 'center' : 'flex-start',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={() => navigate('/about')}
                  style={{
                    padding: '1rem 2.5rem',
                    borderRadius: '12px',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    background: 'linear-gradient(135deg, var(--c-cyan), var(--c-cyan-dim))',
                    color: 'var(--c-cream)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    boxShadow: '0 8px 25px rgba(26, 155, 196, 0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px) scale(1.02)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 35px rgba(26, 155, 196, 0.5), inset 0 1px 0 rgba(255,255,255,0.1)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0) scale(1)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 25px rgba(26, 155, 196, 0.4), inset 0 1px 0 rgba(255,255,255,0.1)';
                  }}
                >
                  🚀 Découvrir mon parcours
                </button>
                
                {/* Stats améliorées */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '1rem',
                  fontSize: '0.9rem',
                  color: 'var(--c-muted)'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '20px',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    <span style={{ fontSize: '1.1em' }}>📚</span>
                    <span style={{ fontWeight: '600' }}>{posts.length + (featuredPost ? 1 : 0)}</span>
                    <span>articles</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '20px',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    <span style={{ fontSize: '1.1em' }}>💡</span>
                    <span style={{ fontWeight: '600' }}>Tech</span>
                    <span>& Innovation</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Animation CSS intégrée */}
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(5deg); }
          }
        `}</style>
      </section>
      {/* ═══ FEATURED ARTICLE CARD (only for non-authenticated users) ═══ */}
      {featuredPost && !loading && !user && (
        <section style={{
          maxWidth: '1100px',
          margin: '2rem auto',
          padding: '0 1.25rem'
        }}>
          <div
            onClick={() => navigate(`/posts/${featuredPost.slug}`)}
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '380px 1fr',
              gap: isMobile ? '0' : '2rem',
              background: 'var(--c-surface)',
              borderRadius: '16px',
              overflow: 'hidden',
              border: '1px solid var(--c-border)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              cursor: 'pointer',
              transition: 'transform 0.3s, box-shadow 0.3s'
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 40px rgba(26, 155, 196, 0.3)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)';
            }}
          >
            {/* Image à gauche */}
            <div style={{
              position: 'relative',
              height: isMobile ? '240px' : '100%',
              minHeight: isMobile ? '240px' : '280px',
              overflow: 'hidden'
            }}>
              <img
                src={featuredPost.cover_image ?? FALLBACK_IMG}
                onError={e => { (e.target as HTMLImageElement).src = FALLBACK_IMG }}
                alt={featuredPost.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.5s'
                }}
              />
              {/* Badge "À la une" */}
              <div style={{
                position: 'absolute',
                top: '1rem',
                left: '1rem',
                background: 'linear-gradient(135deg, var(--c-cyan), var(--c-cyan-dim))',
                color: '#fff',
                padding: '0.4rem 0.85rem',
                borderRadius: '20px',
                fontSize: '0.7rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                boxShadow: '0 4px 12px rgba(18, 118, 158, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}>
                <span>✨</span> À la une
              </div>
            </div>

            {/* Contenu à droite */}
            <div style={{
              padding: isMobile ? '1.5rem' : '2rem 2rem 2rem 0',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              {/* Tags */}
              {featuredPost.tags && featuredPost.tags.length > 0 && (
                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  marginBottom: '1rem',
                  flexWrap: 'wrap'
                }}>
                  {featuredPost.tags.slice(0, 3).map(t => (
                    <span key={t.id} style={{
                      fontSize: '0.7rem',
                      color: 'var(--c-cyan)',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '6px',
                      background: 'rgba(26,155,196,0.1)',
                      border: '1px solid rgba(26,155,196,0.2)',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em'
                    }}>
                      {t.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Titre */}
              <h2 style={{
                fontFamily: 'var(--font-head)',
                fontSize: isMobile ? '1.5rem' : '2rem',
                color: 'var(--c-text)',
                lineHeight: 1.3,
                marginBottom: '1rem',
                fontWeight: 800
              }}>
                {featuredPost.title}
              </h2>

              {/* Extrait */}
              {featuredPost.excerpt && (
                <p style={{
                  fontSize: '0.95rem',
                  color: 'var(--c-sub)',
                  lineHeight: 1.7,
                  marginBottom: '1.5rem',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {featuredPost.excerpt}
                </p>
              )}

              {/* Métadonnées et CTA */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                marginTop: 'auto'
              }}>
                {/* Auteur et date */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--c-cyan), var(--c-cyan-dim))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: '#fff',
                    boxShadow: '0 4px 12px rgba(26, 155, 196, 0.3)'
                  }}>
                    {(featuredPost.user?.name ?? 'A')[0].toUpperCase()}
                  </div>
                  <div>
                    <p style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: 'var(--c-text)',
                      marginBottom: '0.15rem'
                    }}>
                      {featuredPost.user?.name ?? 'Auteur'}
                    </p>
                    <p style={{
                      fontSize: '0.75rem',
                      color: 'var(--c-muted)'
                    }}>
                      {featuredPost.published_at ? fmtDate(featuredPost.published_at) : fmtDate(featuredPost.created_at)}
                    </p>
                  </div>
                </div>

                {/* Bouton CTA */}
                <button
                  style={{
                    padding: '0.65rem 1.5rem',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    background: 'var(--c-cyan-dim)',
                    color: '#fff',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 12px rgba(26, 155, 196, 0.3)'
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = 'var(--c-cyan)';
                    (e.currentTarget as HTMLElement).style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = 'var(--c-cyan-dim)';
                    (e.currentTarget as HTMLElement).style.transform = 'translateX(0)';
                  }}
                >
                  Lire l'article
                  <span style={{ fontSize: '1.1em' }}>→</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═══ CONTENU PRINCIPAL ═══ */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.25rem' }}>

        {/* Barre filtres */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            <button onClick={() => { setPage(1); setSearchParams({}) }}
              style={{ padding: '0.3rem 0.85rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600, background: !currentTag && !currentSearch ? 'var(--c-cyan-dim)' : 'var(--c-surface)', color: !currentTag && !currentSearch ? '#fff' : 'var(--c-sub)', border: '1px solid var(--c-border)' }}>
              Tous
            </button>
            {tags.map(t => (
              <button key={t.id} onClick={() => { setPage(1); setSearchParams({ tag: t.slug }) }}
                style={{ padding: '0.3rem 0.85rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 500, background: currentTag === t.slug ? 'var(--c-cyan-dim)' : 'var(--c-surface)', color: currentTag === t.slug ? '#fff' : 'var(--c-sub)', border: `1px solid ${currentTag === t.slug ? 'var(--c-cyan-dim)' : 'var(--c-border)'}` }}>
                {t.name}
              </button>
            ))}
          </div>

          {/* Recherche */}
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <input
              type="search"
              defaultValue={currentSearch}
              placeholder="Rechercher…"
              onKeyDown={e => { if (e.key === 'Enter') { setPage(1); setSearchParams({ search: (e.target as HTMLInputElement).value }) } }}
              style={{ padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.85rem', background: 'var(--c-surface)', color: 'var(--c-text)', border: '1px solid var(--c-border)', outline: 'none', width: '180px' }}
            />
          </div>
        </div>

        {/* Titre section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '1.1rem', color: 'var(--c-text)' }}>
            {currentSearch ? `Résultats pour "${currentSearch}"` : currentTag ? `#${currentTag}` : 'Articles récents'}
          </h2>
          <div style={{ flex: 1, height: '1px', background: 'var(--c-border)' }} />
          {(currentTag || currentSearch) && (
            <button onClick={() => { setPage(1); setSearchParams({}) }}
              style={{ fontSize: '0.78rem', color: 'var(--c-cyan)' }}>✕ Effacer</button>
          )}
        </div>

        {/* Grille */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ borderRadius: '10px', overflow: 'hidden', background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
                <div style={{ height: '180px', background: 'var(--c-surface2)' }} />
                <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <div style={{ height: '10px', width: '30%', background: 'var(--c-surface2)', borderRadius: '3px' }} />
                  <div style={{ height: '14px', width: '80%', background: 'var(--c-surface2)', borderRadius: '3px' }} />
                  <div style={{ height: '10px', width: '100%', background: 'var(--c-surface2)', borderRadius: '3px' }} />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--c-surface)', borderRadius: '10px', border: '1px solid var(--c-border)' }}>
            <p style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📭</p>
            <p style={{ fontFamily: 'var(--font-head)', fontSize: '1.1rem', color: 'var(--c-text)', marginBottom: '0.4rem' }}>Aucun article trouvé</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--c-muted)' }}>Essayez d'autres termes ou effacez le filtre.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {posts.map(p => <PostGrid key={p.id} post={p} />)}
          </div>
        )}

        {/* Pagination */}
        {lastPage > 1 && !loading && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', marginTop: '2.5rem' }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{ padding: '0.45rem 1.1rem', borderRadius: '6px', fontSize: '0.85rem', background: 'var(--c-surface)', border: '1px solid var(--c-border)', color: 'var(--c-sub)', opacity: page === 1 ? 0.4 : 1 }}>
              ← Précédent
            </button>
            {[...Array(Math.min(lastPage, 5))].map((_, i) => (
              <button key={i} onClick={() => setPage(i + 1)}
                style={{ width: '36px', height: '36px', borderRadius: '6px', fontSize: '0.85rem', background: page === i + 1 ? 'var(--c-cyan-dim)' : 'var(--c-surface)', border: '1px solid var(--c-border)', color: page === i + 1 ? '#fff' : 'var(--c-sub)', fontWeight: page === i + 1 ? 600 : 400 }}>
                {i + 1}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(lastPage, p + 1))} disabled={page === lastPage}
              style={{ padding: '0.45rem 1.1rem', borderRadius: '6px', fontSize: '0.85rem', background: 'var(--c-surface)', border: '1px solid var(--c-border)', color: 'var(--c-sub)', opacity: page === lastPage ? 0.4 : 1 }}>
              Suivant →
            </button>
          </div>
        )}

        {/* CTA bas de page */}
        {!currentTag && !currentSearch && posts.length > 0 && page === lastPage && (
          <div style={{ marginTop: '3rem', background: 'var(--c-navy-deep, #043775)', borderRadius: '12px', padding: '2.5rem', textAlign: 'center', border: '1px solid var(--c-border)' }}>
            <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '1.4rem', color: '#fff', marginBottom: '0.5rem' }}>
              Envie de participer ?
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.65)', marginBottom: '1.25rem' }}>
              Créez un compte pour commenter, liker et échanger avec l'auteur.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <a href="/register" style={{ padding: '0.6rem 1.5rem', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 600, background: 'var(--c-cyan-dim)', color: '#fff' }}>Créer un compte</a>
              <a href="/login" style={{ padding: '0.6rem 1.5rem', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 500, background: 'transparent', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.25)' }}>Se connecter</a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
