import { useState, useRef, type FormEvent, type ChangeEvent } from 'react'
import api from '../lib/api'
import useAuthStore from '../stores/authStore'
import type { User } from '../types'

export default function ProfilePage() {
  const { user, setUser } = useAuthStore()
  const [name, setName] = useState(user?.name ?? '')
  const [bio, setBio] = useState(user?.bio ?? '')
  const [website, setWebsite] = useState(user?.website ?? '')
  const [password, setPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar ?? null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); setSaving(true); setMsg(null)
    try {
      const payload: Record<string, string> = { name, bio, website }
      if (password) payload.password = password
      const res = await api.put<User>('/profile', payload)
      setUser(res.data); setMsg({ type: 'ok', text: 'Profil mis à jour.' }); setPassword('')
    } catch { setMsg({ type: 'err', text: 'Erreur lors de la mise à jour.' }) }
    finally { setSaving(false) }
  }

  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setAvatarPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
    setUploadingAvatar(true)
    try {
      const form = new FormData(); form.append('avatar', file)
      const res = await api.post<User>('/profile/avatar', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      setUser(res.data); setAvatarPreview(res.data.avatar)
    } catch { } finally { setUploadingAvatar(false) }
  }

  if (!user) return null

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.65rem 0.875rem', borderRadius: '8px',
    fontSize: '0.9rem', background: 'var(--c-surface2)',
    color: 'var(--c-text)', border: '1px solid var(--c-border)', outline: 'none',
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <h1 style={{ fontFamily: 'var(--font-head)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--c-text)', marginBottom: '2rem' }}>
        Mon profil
      </h1>

      {/* Avatar */}
      <div style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--c-border)' }}>
            {avatarPreview
              ? <img src={avatarPreview} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, var(--c-cyan-dim), var(--c-cyan))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>
                  {user.name[0].toUpperCase()}
                </div>
            }
          </div>
          {uploadingAvatar && (
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} />
            </div>
          )}
        </div>
        <div>
          <p style={{ fontWeight: 600, color: 'var(--c-text)', marginBottom: '2px' }}>{user.name}</p>
          <p style={{ fontSize: '0.825rem', color: 'var(--c-muted)', marginBottom: '0.75rem' }}>{user.email}</p>
          <button onClick={() => fileRef.current?.click()} disabled={uploadingAvatar}
            style={{ padding: '0.35rem 0.875rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 500, background: 'var(--c-surface2)', color: 'var(--c-sub)', border: '1px solid var(--c-border)', cursor: 'pointer', opacity: uploadingAvatar ? 0.5 : 1 }}>
            {uploadingAvatar ? 'Upload…' : 'Changer la photo'}
          </button>
          <p style={{ fontSize: '0.72rem', color: 'var(--c-muted)', marginTop: '0.3rem' }}>JPG, PNG, GIF — max 5 Mo</p>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
        </div>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit}
        style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--c-sub)', marginBottom: '0.4rem' }}>Nom</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--c-sub)', marginBottom: '0.4rem' }}>Site web</label>
            <input type="url" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://…" style={inputStyle} />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--c-sub)', marginBottom: '0.4rem' }}>
            Email <span style={{ color: 'var(--c-muted)', fontWeight: 400 }}>(non modifiable)</span>
          </label>
          <input type="email" value={user.email} readOnly style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }} />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--c-sub)', marginBottom: '0.4rem' }}>Bio</label>
          <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
            style={{ ...inputStyle, resize: 'none' }} />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--c-sub)', marginBottom: '0.4rem' }}>
            Nouveau mot de passe <span style={{ color: 'var(--c-muted)', fontWeight: 400 }}>(laisser vide pour ne pas changer)</span>
          </label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" style={inputStyle} />
        </div>

        {msg && (
          <div style={{ padding: '0.625rem 0.875rem', borderRadius: '8px', fontSize: '0.85rem', background: msg.type === 'ok' ? 'rgba(29,184,122,0.1)' : 'rgba(224,82,82,0.1)', color: msg.type === 'ok' ? 'var(--c-green)' : 'var(--c-red)', border: `1px solid ${msg.type === 'ok' ? 'rgba(29,184,122,0.2)' : 'rgba(224,82,82,0.2)'}` }}>
            {msg.text}
          </div>
        )}

        <button type="submit" disabled={saving}
          style={{ padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600, background: saving ? 'var(--c-muted)' : 'var(--c-cyan-dim)', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', border: 'none' }}>
          {saving ? 'Enregistrement…' : 'Enregistrer les modifications'}
        </button>
      </form>
    </div>
  )
}
