import type { Message } from '../../types'

interface ChatBubbleProps {
  message: Message
  /** true si le message a été envoyé par l'utilisateur courant */
  isSent: boolean
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Bulle de message pour l'interface de chat.
 * Les messages envoyés apparaissent à droite (accent), les reçus à gauche (secondaire).
 */
export default function ChatBubble({ message, isSent }: ChatBubbleProps) {
  return (
    <div className={`flex ${isSent ? 'justify-end' : 'justify-start'} mb-2`}>
      <div
        className="max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl"
        style={{
          backgroundColor: isSent ? 'var(--accent)' : 'var(--bg-tertiary)',
          color: isSent ? '#0A0A0F' : 'var(--text-primary)',
          borderBottomRightRadius: isSent ? '4px' : undefined,
          borderBottomLeftRadius: !isSent ? '4px' : undefined,
        }}
      >
        <p className="text-sm break-words">{message.content}</p>
        <div
          className={`flex items-center gap-1 mt-1 ${isSent ? 'justify-end' : 'justify-start'}`}
        >
          <span
            className="text-xs"
            style={{ color: isSent ? 'rgba(10,10,15,0.6)' : 'var(--text-muted)' }}
          >
            {formatTime(message.created_at)}
          </span>
          {isSent && message.read_at && (
            <span
              className="text-xs"
              style={{ color: 'rgba(10,10,15,0.6)' }}
              title="Lu"
            >
              ✓✓
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
