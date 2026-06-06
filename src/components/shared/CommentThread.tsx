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
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          ✨ Bocovo
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
    <div className={`group ${depth > 0 ? 'ml-6 mt-4' : 'mt-6'}`}>
      <div className="flex gap-3">
        <Avatar
          src={comment.user?.avatar}
          name={comment.user?.name ?? 'Utilisateur'}
          size={depth > 0 ? "sm" : "sm"}
          className="flex-shrink-0 mt-1"
        />

        <div className="flex-1 min-w-0">
          {/* Header avec nom, badge et date */}
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
              {comment.user?.name ?? 'Utilisateur'}
            </span>
            {getRoleBadge()}
            <span className="text-xs opacity-60" style={{ color: 'var(--text-muted)' }}>
              {formatDate(comment.created_at)}
            </span>
          </div>

          {/* Contenu du commentaire avec design amélioré */}
          <div
            className="rounded-2xl p-4 shadow-sm border transition-all hover:shadow-md"
            style={{ 
              backgroundColor: depth > 0 ? 'var(--bg-secondary)' : 'var(--bg-tertiary)',
              border: '1px solid var(--border)',
              borderLeft: depth > 0 ? '3px solid var(--accent)' : '1px solid var(--border)'
            }}
          >
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {parseContent(comment.content)}
            </p>
          </div>

          {/* Actions avec design amélioré */}
          <div className="flex items-center gap-4 mt-2 px-2">
            {user && (
              <button
                onClick={() => {
                  insertMention(comment.user?.name ?? '')
                  setShowReplyForm((v) => !v)
                }}
                className="flex items-center gap-1 text-xs font-medium transition-all hover:scale-105 opacity-0 group-hover:opacity-100"
                style={{ color: 'var(--accent)' }}
              >
                <span>↩️</span>
                Répondre
              </button>
            )}
            {canDelete && onDelete && (
              <button
                onClick={() => onDelete(comment.id)}
                className="flex items-center gap-1 text-xs font-medium transition-all hover:scale-105 opacity-0 group-hover:opacity-100"
                style={{ color: 'var(--danger)' }}
              >
                <span>🗑️</span>
                Supprimer
              </button>
            )}
          </div>

          {/* Formulaire de réponse amélioré */}
          {showReplyForm && user && (
            <div className="mt-4 p-4 rounded-xl border border-dashed" style={{ borderColor: 'var(--accent)', backgroundColor: 'rgba(18,118,158,0.05)' }}>
              <form onSubmit={handleReplySubmit} className="space-y-3">
                <div className="flex gap-2">
                  <Avatar src={user.avatar} name={user.name} size="sm" className="mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder={`Répondre à ${comment.user?.name}... (@mentions supportées)`}
                      className="w-full text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
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
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowReplyForm(false)}
                    className="text-sm px-4 py-2 rounded-lg transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !replyContent.trim()}
                    className="text-sm px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ 
                      background: 'linear-gradient(135deg, var(--accent), var(--accent-light))', 
                      color: 'white'
                    }}
                  >
                    {submitting ? '⏳ Envoi...' : '📤 Répondre'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Réponses imbriquées */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4">
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
