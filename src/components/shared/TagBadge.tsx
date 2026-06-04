import { useNavigate } from 'react-router-dom'
import type { Tag } from '../../types'

interface TagBadgeProps {
  tag: Tag
  /** Si true, un clic redirige vers la page d'accueil filtrée par ce tag */
  clickable?: boolean
  className?: string
}

/**
 * Badge coloré représentant un tag.
 * Cliquable par défaut — redirige vers /?tag=<slug>.
 */
export default function TagBadge({ tag, clickable = true, className = '' }: TagBadgeProps) {
  const navigate = useNavigate()

  const handleClick = () => {
    if (clickable) {
      navigate(`/?tag=${encodeURIComponent(tag.slug)}`)
    }
  }

  return (
    <span
      onClick={handleClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={clickable ? (e) => e.key === 'Enter' && handleClick() : undefined}
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
        clickable ? 'cursor-pointer hover:opacity-80' : 'cursor-default'
      } ${className}`}
      style={{
        backgroundColor: 'var(--bg-tertiary)',
        color: 'var(--accent)',
        border: '1px solid var(--border)',
      }}
    >
      #{tag.name}
    </span>
  )
}
