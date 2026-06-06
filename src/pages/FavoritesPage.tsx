import { useEffect, useState } from 'react'
import api from '../lib/api'
import type { Post } from '../types'
import PostCard from '../components/shared/PostCard'

export default function FavoritesPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  const fetchFavorites = async () => {
    setLoading(true)
    try {
      const res = await api.get('/user/favorites')
      // L'API renvoie { data: Post[] } avec pagination
      const favoritesData = res.data.data || res.data
      setPosts(Array.isArray(favoritesData) ? favoritesData : [])
    } catch (error) {
      console.error('Error fetching favorites:', error)
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFavorites()
  }, [])

  // Rafraîchir quand on revient sur la page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchFavorites()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--c-text)' }}>
          Mes favoris
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--c-muted)', marginTop: '0.25rem' }}>
          Les articles que vous avez mis en favoris
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} style={{ borderRadius: '10px', overflow: 'hidden', background: 'var(--c-surface)' }}>
              <div style={{ height: '180px', background: 'var(--c-surface2)' }} />
              <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ height: '12px', width: '60%', background: 'var(--c-surface2)', borderRadius: '4px' }} />
                <div style={{ height: '16px', width: '80%', background: 'var(--c-surface2)', borderRadius: '4px' }} />
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--c-surface)', border: '1px solid var(--c-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="28" height="28" fill="none" stroke="var(--c-muted)" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--c-text)' }}>Aucun favori</p>
          <p style={{ fontSize: '0.875rem', color: 'var(--c-muted)' }}>
            Ajoutez des articles à vos favoris depuis la page de lecture.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {posts.map(p => <PostCard key={p.id} post={p} />)}
        </div>
      )}
    </div>
  )
}
