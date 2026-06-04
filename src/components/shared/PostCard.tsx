import { useNavigate } from 'react-router-dom'
import type { Post } from '../../types'

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric' })
}

interface Props { post: Post; featured?: boolean }

export default function PostCard({ post, featured = false }: Props) {
  const navigate = useNavigate()
  const date = post.published_at ? fmtDate(post.published_at) : fmtDate(post.created_at)
  const tags = post.tags?.slice(0, 3) ?? []

  if (featured) {
    // Card horizontale large — posts épinglés
    return (
      <article
        onClick={() => navigate(`/posts/${post.slug}`)}
        style={{
          display: 'flex', gap: 0, borderRadius: '10px', overflow: 'hidden',
          background: 'var(--c-surface)', border: '1px solid var(--c-border)',
          cursor: 'pointer', transition: 'border-color 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--c-cyan-dim)')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--c-border)')}
      >
        {post.cover_image && (
          <div style={{ width: '240px', flexShrink: 0, overflow: 'hidden' }}>
            <img src={post.cover_image} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}
        <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.6rem', borderRadius: '4px', background: 'var(--c-cyan-dim)', color: '#fff', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              À la une
            </span>
            {tags.map(t => (
              <span key={t.id} style={{ fontSize: '0.72rem', color: 'var(--c-cyan)', padding: '0.15rem 0.5rem', borderRadius: '4px', background: 'rgba(26,155,196,0.1)', border: '1px solid rgba(26,155,196,0.2)' }}>#{t.name}</span>
            ))}
          </div>
          <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '1.3rem', color: 'var(--c-text)', lineHeight: 1.3 }}>{post.title}</h2>
          {post.excerpt && (
            <p style={{ fontSize: '0.875rem', color: 'var(--c-sub)', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.excerpt}</p>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--c-border)' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--c-muted)' }}>{date}</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--c-muted)' }}>👁 {post.views_count}</span>
            {post.likes_count !== undefined && <span style={{ fontSize: '0.78rem', color: 'var(--c-muted)' }}>❤️ {post.likes_count}</span>}
          </div>
        </div>
      </article>
    )
  }

  // Card standard Dev.to style (liste verticale)
  return (
    <article
      onClick={() => navigate(`/posts/${post.slug}`)}
      style={{
        background: 'var(--c-surface)', border: '1px solid var(--c-border)',
        borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', transition: 'border-color 0.2s',
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--c-cyan-dim)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--c-border)')}
    >
      {post.cover_image && (
        <div style={{ height: '180px', overflow: 'hidden' }}>
          <img src={post.cover_image} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}
      <div style={{ padding: '1rem 1.25rem' }}>
        {/* Tags */}
        {tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.6rem' }}>
            {tags.map(t => (
              <span key={t.id} style={{ fontSize: '0.72rem', color: 'var(--c-cyan)', padding: '0.1rem 0.45rem', borderRadius: '4px', background: 'rgba(26,155,196,0.08)', border: '1px solid rgba(26,155,196,0.15)' }}>
                #{t.name}
              </span>
            ))}
          </div>
        )}

        <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '1.05rem', color: 'var(--c-text)', lineHeight: 1.35, marginBottom: '0.4rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {post.title}
        </h3>

        {post.excerpt && (
          <p style={{ fontSize: '0.825rem', color: 'var(--c-sub)', lineHeight: 1.6, marginBottom: '0.75rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {post.excerpt}
          </p>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.625rem', borderTop: '1px solid var(--c-border)', fontSize: '0.75rem', color: 'var(--c-muted)' }}>
          <span>{date}</span>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <span>👁 {post.views_count}</span>
            {post.likes_count !== undefined && <span>❤️ {post.likes_count}</span>}
          </div>
        </div>
      </div>
    </article>
  )
}
