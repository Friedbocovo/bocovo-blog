import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../lib/api'
import type { Post, Comment } from '../types'
import CommentThread from '../components/shared/CommentThread'
import Avatar from '../components/shared/Avatar'
import useAuthStore from '../stores/authStore'
import useInteractionStore from '../stores/interactionStore'

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function PostDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { token, user } = useAuthStore()
  const { isLiked, isFavorited, setLiked, setFavorited, toggleLike, toggleFavorite } = useInteractionStore()

  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [commentInput, setCommentInput] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [likeLoading, setLikeLoading] = useState(false)
  const [favoriteLoading, setFavoriteLoading] = useState(false)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    Promise.all([
      api.get<Post>(`/posts/${slug}`),
      api.get<Comment[]>(`/posts/${slug}/comments`),
      token ? api.get<{ liked: boolean; favorited: boolean }>(`/posts/${slug}/status`) : Promise.resolve({ data: { liked: false, favorited: false } })
    ])
      .then(([pr, cr, sr]) => {
        setPost(pr.data)
        setLikesCount(pr.data.likes_count ?? 0)
        setComments(Array.isArray(cr.data) ? cr.data : [])
        // Mettre à jour le store global avec les statuts réels
        setLiked(pr.data.id, sr.data.liked)
        setFavorited(pr.data.id, sr.data.favorited)
      })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false))
  }, [slug, navigate, token])

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentInput.trim() || !post) return
    if (!token) { navigate(`/login?from=/posts/${slug}`); return }
    setSubmittingComment(true)
    try {
      const res = await api.post<Comment>(`/posts/${post.id}/comments`, { content: commentInput.trim() })
      setComments(prev => [res.data, ...prev]); setCommentInput('')
    } catch { } finally { setSubmittingComment(false) }
  }

  const handleReply = async (parentId: number, content: string) => {
    if (!post) return
    const res = await api.post<Comment>(`/comments/${parentId}/reply`, { content })
    setComments(prev => prev.map(c => c.id === parentId ? { ...c, replies: [...(c.replies ?? []), res.data] } : c))
  }

  const handleDelete = async (commentId: number) => {
    await api.delete(`/comments/${commentId}`)
    const remove = (list: Comment[]): Comment[] =>
      list.filter(c => c.id !== commentId).map(c => ({ ...c, replies: remove(c.replies ?? []) }))
    setComments(prev => remove(prev))
  }

  const handleLike = async () => {
    if (!token) { navigate(`/login?from=/posts/${slug}`); return }
    if (!post || likeLoading) return
    
    setLikeLoading(true)
    const wasLiked = isLiked(post.id)
    const newLikedState = toggleLike(post.id)
    setLikesCount(c => newLikedState ? c + 1 : c - 1)
    
    try { 
      wasLiked ? await api.delete(`/posts/${post.id}/like`) : await api.post(`/posts/${post.id}/like`) 
    } catch { 
      // Revert sur erreur
      toggleLike(post.id)
      setLikesCount(c => wasLiked ? c + 1 : c - 1)
    } finally { 
      setLikeLoading(false) 
    }
  }

  const handleFavorite = async () => {
    if (!token) { navigate(`/login?from=/posts/${slug}`); return }
    if (!post || favoriteLoading) return
    
    setFavoriteLoading(true)
    const wasFavorited = isFavorited(post.id)
    toggleFavorite(post.id)
    
    try { 
      wasFavorited ? await api.delete(`/posts/${post.id}/favorite`) : await api.post(`/posts/${post.id}/favorite`) 
    } catch { 
      // Revert sur erreur
      toggleFavorite(post.id)
    } finally { 
      setFavoriteLoading(false) 
    }
  }

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse space-y-6">
      <div className="h-72 rounded-2xl" style={{ backgroundColor: 'var(--bg-secondary)' }} />
      <div className="h-8 w-3/4 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }} />
      <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-4 rounded" style={{ backgroundColor: 'var(--bg-secondary)', width: `${80 - i * 10}%` }} />)}</div>
    </div>
  )
  if (!post) return null

  return (
    <article>
      {/* Cover hero */}
      {post.cover_image && (
        <div className="w-full relative overflow-hidden" style={{ height: 'clamp(240px, 40vw, 480px)' }}>
          <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 40%, var(--bg-primary) 100%)' }} />
        </div>
      )}

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs mb-6" style={{ color: 'var(--text-muted)' }}>
          <Link to="/" className="hover:opacity-80" style={{ color: 'var(--accent-light)' }}>Accueil</Link>
          <span>/</span>
          <span className="truncate max-w-xs">{post.title}</span>
        </nav>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map(t => (
              <Link key={t.id} to={`/?tag=${t.slug}`}
                className="text-xs font-medium px-3 py-1 rounded-full transition-opacity hover:opacity-80"
                style={{ backgroundColor: 'rgba(18,118,158,0.2)', color: 'var(--accent-light)' }}>
                {t.name}
              </Link>
            ))}
          </div>
        )}

        {/* Titre */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-6 leading-tight"
          style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
          {post.title}
        </h1>

        {/* Meta bar */}
        <div className="flex flex-wrap items-center gap-4 pb-8 mb-8" style={{ borderBottom: '1px solid var(--border)' }}>
          {post.user && (
            <div className="flex items-center gap-2">
              <Avatar src={post.user.avatar} name={post.user.name} size="sm" />
              <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{post.user.name}</span>
            </div>
          )}
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {post.published_at ? formatDate(post.published_at) : formatDate(post.created_at)}
          </span>
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>👁 {post.views_count} vues</span>

          {/* Actions like / favori */}
          <div className="flex items-center gap-2 ml-auto">
            <button onClick={handleLike} disabled={likeLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all disabled:opacity-50"
              style={{ backgroundColor: (post && isLiked(post.id)) ? 'rgba(224,82,82,0.15)' : 'rgba(255,255,255,0.06)', color: (post && isLiked(post.id)) ? 'var(--danger)' : 'var(--text-secondary)', border: `1px solid ${(post && isLiked(post.id)) ? 'rgba(224,82,82,0.4)' : 'var(--border)'}` }}>
              {(post && isLiked(post.id)) ? '❤️' : '🤍'} {likesCount}
            </button>
            <button onClick={handleFavorite} disabled={favoriteLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all disabled:opacity-50"
              style={{ backgroundColor: (post && isFavorited(post.id)) ? 'rgba(18,118,158,0.15)' : 'rgba(255,255,255,0.06)', color: (post && isFavorited(post.id)) ? 'var(--accent-light)' : 'var(--text-secondary)', border: `1px solid ${(post && isFavorited(post.id)) ? 'var(--accent)' : 'var(--border)'}` }}>
              {(post && isFavorited(post.id)) ? '🔖' : '📑'}
            </button>
          </div>
        </div>

        {/* Contenu */}
        <div className="prose max-w-none mb-16"
          dangerouslySetInnerHTML={{ __html: post.content }} />

        {/* Section commentaires */}
        <section>
          <h2 className="text-2xl font-bold mb-8" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
            Commentaires
          </h2>

          {token && user ? (
            <form onSubmit={handleCommentSubmit} className="flex gap-3 mb-10">
              <Avatar src={user.avatar} name={user.name} size="sm" className="mt-1 flex-shrink-0" />
              <div className="flex-1 flex gap-2">
                <input type="text" value={commentInput} onChange={e => setCommentInput(e.target.value)}
                  placeholder="Laissez un commentaire…"
                  className="flex-1 text-sm rounded-xl px-4 py-3 outline-none"
                  style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
                <button type="submit" disabled={submittingComment || !commentInput.trim()}
                  className="px-5 py-3 rounded-xl text-sm font-semibold disabled:opacity-40 transition-opacity hover:opacity-80 flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-light))', color: 'var(--cream)' }}>
                  {submittingComment ? '…' : 'Publier'}
                </button>
              </div>
            </form>
          ) : (
            <div className="rounded-xl p-4 mb-8 text-sm text-center" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
              <Link to={`/login?from=/posts/${slug}`} style={{ color: 'var(--accent-light)' }} className="font-medium">Connectez-vous</Link>
              {' '}pour laisser un commentaire.
            </div>
          )}

          <CommentThread comments={comments} onReply={handleReply} onDelete={handleDelete} />
        </section>
      </div>
    </article>
  )
}
