import { useState } from 'react'
import type { Comment } from '../../types'
import Avatar from './Avatar'
import useAuthStore from '../../stores/authStore'

interface CommentThreadProps {
  comments: Comment[]
  onReply: (parentId: number, content: string) => Promise<void>
  onDelete?: (commentId: number) => Promise<void>
  depth?: number
}

interface CommentItemProps {
  comment: Comment
  onReply: (parentId: number, content: string) => Promise<void>
  onDelete?: (commentId: number) => Promise<void>
  depth: number
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function CommentItem({ comment, onReply, onDelete, depth }: CommentItemProps) {
  const { user } = useAuthStore()
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const isAuthor = user && user.id === comment.user_id
  const isAdmin = user && user.role === 'admin'
  const canDelete = isAuthor || isAdmin

  // Fonction pour obtenir le badge de rôle
  const getRoleBadge = () => {
    if (!comment.user) return null
    
    if (comment.user.role === 'admin') {
      return (
        <span 
          className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold"
          style={{
            background: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
            color: 'white'
          }}
        >
          Admin
        </span>
      )
    }
    
    return null
  }

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyContent.trim()) return
    setSubmitting(true)
    try {
      await onReply(comment.id, replyContent.trim())
      setReplyContent('')
      setShowReplyForm(false)
    } finally {
      setSubmitting(false)
    }
  }

  const insertMention = (name: string) => {
    setReplyContent((prev) => `@${name} ${prev}`.trimStart())
    setShowReplyForm(true)
  }

  // Fonction pour parser les @mentions dans le contenu
  const parseContent = (content: string) => {
    const parts = content.split(/(@\w+)/g)
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        return (
          <span 
            key={index} 
            className="font-medium text-blue-400 hover:text-blue-300 cursor-pointer"
          >
            {part}
          </span>
        )
      }
      return part
    })
  }

  return (
    <div className={`${depth > 0 ? 'mt-4' : 'mt-6'}`}>
      <div className="flex gap-3">
        <Avatar
          src={comment.user?.avatar}
          name={comment.user?.name ?? 'Utilisateur'}
          size="sm"
          className="flex-shrink-0 mt-1"
        />

        <div className="flex-1 min-w-0">
          {/* Header avec nom, badge et date */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
              {comment.user?.name ?? 'Utilisateur'}
            </span>
            {getRoleBadge()}
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {formatDate(comment.created_at)}
            </span>
          </div>

          {/* Contenu du commentaire */}
          <p className="text-sm leading-relaxed mb-2" style={{ color: 'var(--text-secondary)' }}>
            {parseContent(comment.content)}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-4 mb-3">
            {user && (
              <button
                onClick={() => {
                  insertMention(comment.user?.name ?? '')
                  setShowReplyForm((v) => !v)
                }}
                className="flex items-center gap-1 text-xs font-medium transition-colors hover:opacity-80"
                style={{ color: 'var(--accent)' }}
              >
                ↩️ Répondre
              </button>
            )}
            {canDelete && onDelete && (
              <button
                onClick={() => onDelete(comment.id)}
                className="flex items-center gap-1 text-xs font-medium transition-colors hover:opacity-80"
                style={{ color: 'var(--danger)' }}
              >
                🗑️ Supprimer
              </button>
            )}
          </div>

          {/* Formulaire de réponse */}
          {showReplyForm && user && (
            <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
              <form onSubmit={handleReplySubmit} className="space-y-2">
                <div className="flex gap-2">
                  <Avatar src={user.avatar} name={user.name} size="sm" className="mt-1 flex-shrink-0" />
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder={`Répondre à ${comment.user?.name}...`}
                    className="flex-1 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border)',
                      minHeight: '60px'
                    }}
                    autoFocus
                    rows={2}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowReplyForm(false)}
                    className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !replyContent.trim()}
                    className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all disabled:opacity-50"
                    style={{ 
                      background: 'linear-gradient(135deg, var(--accent), var(--accent-light))', 
                      color: 'white'
                    }}
                  >
                    {submitting ? '⏳ Envoi...' : 'Répondre'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Réponses imbriquées - DANS un conteneur gris à l'intérieur */}
          {comment.replies && comment.replies.length > 0 && (
            <div 
              className="mt-3 p-4 rounded-lg space-y-4"
              style={{ 
                backgroundColor: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)'
              }}
            >
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  onReply={onReply}
                  onDelete={onDelete}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Fil de commentaires imbriqués avec design professionnel, support des réponses et @mentions.
 */
export default function CommentThread({ comments, onReply, onDelete }: CommentThreadProps) {
  if (comments.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">💬</div>
        <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
          Aucun commentaire pour le moment
        </p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Soyez le premier à partager votre avis !
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-6">
        <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          💬 Commentaires
        </h3>
        <span className="text-sm px-2 py-1 rounded-full" style={{ backgroundColor: 'var(--accent)', color: 'white' }}>
          {comments.length}
        </span>
      </div>
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          onReply={onReply}
          onDelete={onDelete}
          depth={0}
        />
      ))}
    </div>
  )
}
