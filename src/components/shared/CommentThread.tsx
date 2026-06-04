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

  return (
    <div className={`flex gap-3 ${depth > 0 ? 'ml-8 mt-3' : 'mt-4'}`}>
      <Avatar
        src={comment.user?.avatar}
        name={comment.user?.name ?? 'Utilisateur'}
        size="sm"
        className="flex-shrink-0 mt-0.5"
      />

      <div className="flex-1 min-w-0">
        <div
          className="rounded-lg p-3"
          style={{ backgroundColor: 'var(--bg-tertiary)' }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {comment.user?.name ?? 'Utilisateur'}
            </span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {formatDate(comment.created_at)}
            </span>
          </div>

          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {comment.content}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-1 px-1">
          {user && depth < 3 && (
            <button
              onClick={() => {
                insertMention(comment.user?.name ?? '')
                setShowReplyForm((v) => !v)
              }}
              className="text-xs transition-colors hover:opacity-80"
              style={{ color: 'var(--text-muted)' }}
            >
              Répondre
            </button>
          )}
          {canDelete && onDelete && (
            <button
              onClick={() => onDelete(comment.id)}
              className="text-xs transition-colors hover:opacity-80"
              style={{ color: 'var(--danger)' }}
            >
              Supprimer
            </button>
          )}
        </div>

        {/* Formulaire de réponse */}
        {showReplyForm && user && (
          <form onSubmit={handleReplySubmit} className="mt-2 flex gap-2">
            <input
              type="text"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Votre réponse… (@mention supportée)"
              className="flex-1 text-sm rounded-lg px-3 py-2 outline-none focus:ring-1"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
              }}
              autoFocus
            />
            <button
              type="submit"
              disabled={submitting || !replyContent.trim()}
              className="text-sm px-3 py-2 rounded-lg font-medium transition-opacity disabled:opacity-50"
              style={{ backgroundColor: 'var(--accent)', color: '#0A0A0F' }}
            >
              {submitting ? '…' : 'Envoyer'}
            </button>
            <button
              type="button"
              onClick={() => setShowReplyForm(false)}
              className="text-sm px-3 py-2 rounded-lg"
              style={{ color: 'var(--text-muted)' }}
            >
              Annuler
            </button>
          </form>
        )}

        {/* Réponses imbriquées */}
        {comment.replies && comment.replies.length > 0 && (
          <div>
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
  )
}

/**
 * Fil de commentaires imbriqués avec support des réponses et @mentions.
 */
export default function CommentThread({ comments, onReply, onDelete }: CommentThreadProps) {
  if (comments.length === 0) {
    return (
      <p className="text-sm py-4 text-center" style={{ color: 'var(--text-muted)' }}>
        Aucun commentaire pour le moment.
      </p>
    )
  }

  return (
    <div>
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
