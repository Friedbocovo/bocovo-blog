import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { createEcho } from '../lib/echo'
import useAuthStore from '../stores/authStore'
import type { Message } from '../types'

export default function MessagingPage() {
  const navigate = useNavigate()
  const { token, user } = useAuthStore()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const echoRef = useRef<ReturnType<typeof createEcho> | null>(null)
  const ADMIN_ID = 1

  useEffect(() => {
    if (!token || !user) return
    api.get<Message[]>(`/conversations/${ADMIN_ID}`)
      .then(r => setMessages(Array.isArray(r.data) ? r.data : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token, user])

  useEffect(() => {
    // Désactivé temporairement - Railway ne supporte pas les WebSockets
    return
    
    if (!token || !user) return
    const echo = createEcho(token)
    echoRef.current = echo
    echo.private(`chat.${user.id}`).listen('NewMessage', (e: { message: Message }) => {
      setMessages(prev => [...prev, e.message])
      api.patch(`/messages/${e.message.id}/read`).catch(() => {})
    })
    return () => { echo.leave(`chat.${user.id}`); echo.disconnect() }
  }, [token, user])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !user) return
    setSending(true)
    try {
      const res = await api.post<Message>('/messages', { receiver_id: ADMIN_ID, content: input.trim() })
      setMessages(prev => [...prev, res.data])
      setInput('')
    } catch { } finally { setSending(false) }
  }

  if (!token || !user) { navigate('/login?from=/messages'); return null }

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '1rem', marginBottom: '1rem', borderBottom: '1px solid var(--c-border)' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--c-cyan-dim), var(--c-cyan))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
          A
        </div>
        <div>
          <p style={{ fontWeight: 600, color: 'var(--c-text)', fontSize: '0.95rem' }}>Administrateur</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--c-green)' }}>● En ligne</p>
        </div>
      </div>

      {/* Zone messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <div style={{ width: '24px', height: '24px', border: '2px solid var(--c-cyan-dim)', borderTopColor: 'transparent', borderRadius: '50%' }} />
          </div>
        ) : messages.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '0.75rem' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--c-surface)', border: '1px solid var(--c-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="24" height="24" fill="none" stroke="var(--c-muted)" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--c-muted)' }}>Démarrez la conversation !</p>
          </div>
        ) : (
          messages.map(msg => {
            const isSent = msg.sender_id === user.id
            return (
              <div key={msg.id} style={{ display: 'flex', justifyContent: isSent ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '70%', padding: '0.625rem 1rem', borderRadius: '16px',
                  background: isSent ? 'linear-gradient(135deg, var(--c-cyan-dim), var(--c-cyan))' : 'var(--c-surface)',
                  color: isSent ? '#fff' : 'var(--c-text)',
                  border: isSent ? 'none' : '1px solid var(--c-border)',
                  borderBottomRightRadius: isSent ? '4px' : undefined,
                  borderBottomLeftRadius: !isSent ? '4px' : undefined,
                }}>
                  <p style={{ fontSize: '0.875rem', lineHeight: 1.5, wordBreak: 'break-word' }}>{msg.content}</p>
                  <p style={{ fontSize: '0.7rem', marginTop: '0.25rem', opacity: 0.65, textAlign: isSent ? 'right' : 'left' }}>
                    {new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    {isSent && msg.read_at && ' ✓✓'}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--c-border)', marginTop: '0.5rem' }}>
        <input
          type="text" value={input} onChange={e => setInput(e.target.value)}
          placeholder="Votre message…"
          style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '12px', fontSize: '0.9rem', background: 'var(--c-surface)', color: 'var(--c-text)', border: '1px solid var(--c-border)', outline: 'none' }}
        />
        <button type="submit" disabled={sending || !input.trim()}
          style={{ padding: '0.75rem 1.25rem', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 600, background: sending || !input.trim() ? 'var(--c-muted)' : 'var(--c-cyan-dim)', color: '#fff', border: 'none', cursor: sending || !input.trim() ? 'not-allowed' : 'pointer', flexShrink: 0 }}>
          {sending ? '…' : '→'}
        </button>
      </form>
    </div>
  )
}
