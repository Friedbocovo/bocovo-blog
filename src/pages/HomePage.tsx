import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import api from '../lib/api'
import type { Post, Tag, PaginatedResponse } from '../types'
import { usePresence } from '../hooks/usePresence'

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
  const [posts, setPosts] = useState<Post[]>([])
  const [featuredPost, setFeaturedPost] = useState<Post | null>(null)
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)

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
      {/* ═══ FEATURED HERO ═══ */}
      {featuredPost && !loading && (
        <section
          onClick={() => navigate(`/posts/${featuredPost.slug}`)}
          style={{
            position: 'relative', cursor: 'pointer',
            height: 'clamp(300px, 55vw, 600px)',
            overflow: 'hidden',
          }}
        >
          <img
            src={featuredPost.cover_image ?? FALLBACK_IMG}
            onError={e => { (e.target as HTMLImageElement).src = FALLBACK_IMG }}
            alt={featuredPost.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          {/* Gradient overlay */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(5,8,20,0.95) 0%, rgba(5,8,20,0.5) 50%, rgba(5,8,20,0.1) 100%)' }} />

          {/* Contenu */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 'clamp(1.5rem, 4vw, 3rem)' }}>
            <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
              <span style={{ display: 'inline-block', fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '3px', background: 'var(--c-cyan-dim)', color: '#fff', marginBottom: '0.75rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                À la une
              </span>
              <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(1.4rem, 3.5vw, 2.4rem)', color: '#fff', lineHeight: 1.25, marginBottom: '0.75rem', maxWidth: '680px' }}>
                {featuredPost.title}
              </h1>
              {featuredPost.excerpt && (
                <p style={{ fontSize: 'clamp(0.8rem, 1.5vw, 0.95rem)', color: 'rgba(255,255,255,0.75)', maxWidth: '560px', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {featuredPost.excerpt}
                </p>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.75rem' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--c-cyan-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#fff' }}>
                  {(featuredPost.user?.name ?? 'A')[0].toUpperCase()}
                </div>
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>{featuredPost.user?.name ?? 'Auteur'}</span>
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>·</span>
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>
                  {featuredPost.published_at ? fmtDate(featuredPost.published_at) : fmtDate(featuredPost.created_at)}
                </span>
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
