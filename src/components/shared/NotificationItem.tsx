import { useNavigate } from 'react-router-dom'
import type { Notification } from '../../types'

interface NotificationItemProps {
  notification: Notification
  onMarkRead: (id: string) => void
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Retourne l'icône et le libellé selon le type de notification */
function getNotificationMeta(type: string): { icon: string; label: string } {
  switch (type) {
    case 'like':
      return { icon: '❤️', label: 'Like' }
    case 'comment':
      return { icon: '💬', label: 'Commentaire' }
    case 'message':
      return { icon: '✉️', label: 'Message' }
    case 'mention':
      return { icon: '@', label: 'Mention' }
    default:
      return { icon: '🔔', label: 'Notification' }
  }
}

/**
 * Item de notification avec icône selon le type, fond différencié si non lu.
 */
export default function NotificationItem({ notification, onMarkRead }: NotificationItemProps) {
  const navigate = useNavigate()
  const { icon } = getNotificationMeta(notification.data.type)
  const isUnread = !notification.read_at

  const handleClick = () => {
    if (isUnread) onMarkRead(notification.id)
    if (notification.data.post_slug) {
      navigate(`/posts/${notification.data.post_slug}`)
    }
  }

  return (
    <div
      onClick={handleClick}
      className="flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors hover:opacity-90"
      style={{
        backgroundColor: isUnread ? 'var(--bg-tertiary)' : 'transparent',
        borderBottom: '1px solid var(--border)',
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
    >
      {/* Icône */}
      <span className="text-xl flex-shrink-0 mt-0.5">{icon}</span>

      {/* Contenu */}
      <div className="flex-1 min-w-0">
        <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
          {notification.data.message}
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
          {formatDate(notification.created_at)}
        </p>
      </div>

      {/* Pastille non lu */}
      {isUnread && (
        <span
          className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
          style={{ backgroundColor: 'var(--accent)' }}
          aria-label="Non lu"
        />
      )}
    </div>
  )
}
