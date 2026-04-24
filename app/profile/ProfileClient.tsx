'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { LogOut, X, Pencil, Check, Upload } from 'lucide-react'
import { useTheme, type Theme } from '@/lib/theme-context'
import type { Profile } from '@/lib/types'

const THEME_OPTIONS: { value: Theme; label: string; desc: string; dots: string[] }[] = [
  { value: 'dark',  label: 'Dark',  desc: 'Easy on the eyes at night', dots: ['#121A0D', '#CEF17B', '#0e1508'] },
  { value: 'light', label: 'Light', desc: 'Clean and minimal',         dots: ['#f4f6f0', '#5a7a10', '#ffffff'] },
  { value: 'pink',  label: 'Pink',  desc: 'Soft pastel vibes',         dots: ['#FCF8F8', '#F5AFAF', '#FBEFEF'] },
]

const PRESET_AVATARS = [
   { id: 'avatar1', src: '/avatars/avatar1.jpg'}, 
  { id: 'avatar2', src: '/avatars/avatar2.jpg'}, 
  { id: 'avatar3', src: '/avatars/avatar3.jpg'}, 
  { id: 'avatar4', src: '/avatars/avatar4.jpg'}, 
  { id: 'avatar5', src: '/avatars/avatar5.jpg'}, 
  { id: 'avatar6', src: '/avatars/avatar6.jpg'}, 
]

export default function ProfileClient({ profile }: { profile: Profile | null }) {
  const supabase = createClient()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Sign out
  const [showConfirm, setShowConfirm] = useState(false)
  const [signingOut, setSigningOut]   = useState(false)

  // Edit mode
  const [editing, setEditing]       = useState(false)
  const [saving, setSaving]         = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Editable fields
  const [firstName, setFirstName] = useState(profile?.first_name ?? profile?.full_name?.split(' ')[0] ?? '')
  const [lastName,  setLastName]  = useState(profile?.last_name  ?? profile?.full_name?.split(' ').slice(1).join(' ') ?? '')

  // Avatar
  const [avatarUrl, setAvatarUrl]       = useState(profile?.avatar_url ?? '')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile]     = useState<File | null>(null)
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)
  const [uploadError, setUploadError]   = useState('')

  function openConfirm()  { setShowConfirm(true) }
  function closeConfirm() { if (signingOut) return; setShowConfirm(false) }

  async function handleSignOut() {
    setSigningOut(true)
    await supabase.auth.signOut()
    router.push('/login')
  }

  // Handle custom image upload
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    setUploadError('')
    if (!file) return

    const allowed = ['image/png', 'image/jpeg', 'image/jpg']
    if (!allowed.includes(file.type)) {
      setUploadError('Only PNG and JPG files are allowed.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setUploadError('File must be under 2MB.')
      return
    }

    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
    setShowAvatarPicker(false)
  }

  // Select preset avatar
  function selectPreset(src: string) {
    setAvatarUrl(src)
    setAvatarPreview(null)
    setAvatarFile(null)
    setShowAvatarPicker(false)
  }

  async function handleSave() {
  setSaving(true)
  setUploadError('')

  try {
    // ← use getSession() instead of getUser() — reads locally, no network needed
    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user
    if (!user) { setUploadError('Not authenticated.'); setSaving(false); return }

    let finalAvatarUrl = avatarUrl

    if (avatarFile) {
      const ext  = avatarFile.name.split('.').pop()
      const path = `avatars/${user.id}.${ext}`

      const { error: uploadErr } = await supabase.storage
        .from('avatars')
        .upload(path, avatarFile, { upsert: true })

      if (uploadErr) {
        setUploadError('Upload failed. Check your connection and try again.')
        setSaving(false)
        return
      }

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(path)

      finalAvatarUrl = urlData.publicUrl
    }

    const { error: updateErr } = await supabase.from('profiles').update({
      first_name: firstName.trim(),
      last_name:  lastName.trim(),
      full_name:  `${firstName.trim()} ${lastName.trim()}`,
      avatar_url: finalAvatarUrl,
    }).eq('id', user.id)

    if (updateErr) {
      setUploadError('Failed to save. Try again.')
      setSaving(false)
      return
    }

    setAvatarUrl(finalAvatarUrl)
    setAvatarFile(null)
    setAvatarPreview(null)
    setSaving(false)
    setEditing(false)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
    router.refresh()

  } catch (err) {
    setUploadError('Network error. Check your connection and try again.')
    setSaving(false)
  }
}

  const displayAvatar = avatarPreview ?? avatarUrl

  return (
    <>
      {/* ── Sign Out Modal ── */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)' }} onClick={closeConfirm}>
          <div className="w-full max-w-sm rounded-2xl p-6 flex flex-col gap-4"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base" style={{ color: 'var(--color-text)' }}>Sign out?</h3>
              <button onClick={closeConfirm} style={{ color: 'var(--color-text-muted)' }}><X size={18}/></button>
            </div>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              You'll be redirected to the login page.
            </p>
            <div className="flex gap-3">
              <button onClick={closeConfirm}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
                Cancel
              </button>
              <button onClick={handleSignOut} disabled={signingOut}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold"
                style={{ background: 'var(--color-danger)', color: '#fff' }}>
                {signingOut ? 'Signing out…' : 'Sign Out'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto flex flex-col gap-6 px-6 py-8">

        {/* Header */}
        <div>
          <h1 className="text-xl font-black" style={{ color: 'var(--color-text)' }}>Profile</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Manage your account and preferences
          </p>
        </div>

        {/* ── Account Card ── */}
        <div className="rounded-2xl p-6 border flex flex-col gap-5"
          style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}>

          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
              Account
            </p>
            {!editing ? (
              <button onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
                <Pencil size={12}/> Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => { setEditing(false); setAvatarPreview(null); setAvatarFile(null); setUploadError(''); setShowAvatarPicker(false) }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                  style={{ background: 'var(--color-accent)', color: 'var(--color-accent-text)' }}>
                  <Check size={12}/> {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            )}
          </div>

          {saveSuccess && (
            <div className="px-4 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: 'var(--color-accent-dim)', color: 'var(--color-accent)', border: '1px solid var(--color-border-hover)' }}>
              ✓ Profile updated successfully!
            </div>
          )}

          {/* Avatar + name row */}
          <div className="flex items-start gap-5">

            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {displayAvatar ? (
                <img src={displayAvatar} alt="avatar"
                  className="w-20 h-20 rounded-full object-cover"
                  style={{ border: '2px solid var(--color-border)' }} />
              ) : (
                <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-black"
                  style={{ background: 'var(--color-accent)', color: 'var(--color-accent-text)' }}>
                  {firstName?.[0] ?? 'U'}
                </div>
              )}
              {editing && (
                <button
                  onClick={() => setShowAvatarPicker(p => !p)}
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all"
                  style={{
                    background: 'var(--color-accent)',
                    borderColor: 'var(--color-card)',
                    color: 'var(--color-accent-text)',
                  }}>
                  <Pencil size={11}/>
                </button>
              )}
            </div>

            {/* Name fields */}
            <div className="flex-1 flex flex-col gap-3">
              {editing ? (
                <>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold uppercase tracking-widest"
                      style={{ color: 'var(--color-text-muted)' }}>First Name</label>
                    <input value={firstName} onChange={e => setFirstName(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
                      style={{
                        background: 'var(--color-surface)',
                        color: 'var(--color-text)',
                        border: '1px solid var(--color-border)',
                      }}
                      onFocus={e => e.target.style.borderColor = 'var(--color-accent)'}
                      onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold uppercase tracking-widest"
                      style={{ color: 'var(--color-text-muted)' }}>Last Name</label>
                    <input value={lastName} onChange={e => setLastName(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
                      style={{
                        background: 'var(--color-surface)',
                        color: 'var(--color-text)',
                        border: '1px solid var(--color-border)',
                      }}
                      onFocus={e => e.target.style.borderColor = 'var(--color-accent)'}
                      onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="font-bold text-base" style={{ color: 'var(--color-text)' }}>
                      {profile?.full_name ?? `${firstName} ${lastName}`.trim() ?? 'Unknown User'}
                    </p>
                    <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                      {profile?.email ?? ''}
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--color-text-sub)' }}>
                      Member since{' '}
                      {profile?.created_at
                        ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                        : '—'}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ── Avatar Picker Panel ── */}
          {editing && showAvatarPicker && (
            <div className="rounded-2xl p-4 flex flex-col gap-4 border"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>

              {/* Preset avatars */}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-3"
                  style={{ color: 'var(--color-text-muted)' }}>Choose a preset</p>
                <div className="grid grid-cols-6 gap-2">
                  {PRESET_AVATARS.map(a => (
                    <button key={a.id} onClick={() => selectPreset(a.src)}
                      className="relative rounded-xl overflow-hidden border-2 transition-all"
                      style={{
                        borderColor: avatarUrl === a.src && !avatarPreview
                          ? 'var(--color-accent)'
                          : 'transparent',
                      }}>
                      <img src={a.src} alt={a.id} className="w-full aspect-square object-cover"/>
                      {avatarUrl === a.src && !avatarPreview && (
                        <div className="absolute inset-0 flex items-center justify-center"
                          style={{ background: 'rgba(0,0,0,0.35)' }}>
                          <Check size={16} color="white"/>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }}/>
                <span className="text-xs" style={{ color: 'var(--color-text-sub)' }}>or upload your own</span>
                <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }}/>
              </div>

              {/* Upload button */}
              <div className="flex flex-col gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold border transition-all"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)', borderStyle: 'dashed' }}>
                  <Upload size={15}/>
                  Click to upload (PNG or JPG, max 2MB)
                </button>

                {uploadError && (
                  <p className="text-xs font-semibold" style={{ color: 'var(--color-danger)' }}>
                    ⚠ {uploadError}
                  </p>
                )}

                {avatarPreview && (
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                    style={{ background: 'var(--color-accent-dim)', border: '1px solid var(--color-border-hover)' }}>
                    <img src={avatarPreview} alt="preview"
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"/>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate" style={{ color: 'var(--color-accent)' }}>
                        {avatarFile?.name}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--color-text-sub)' }}>
                        Ready to save
                      </p>
                    </div>
                    <button onClick={() => { setAvatarPreview(null); setAvatarFile(null) }}
                      style={{ color: 'var(--color-text-muted)' }}>
                      <X size={14}/>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Theme Card ── */}
        <div className="rounded-2xl p-6 border flex flex-col gap-4"
          style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
              Appearance
            </p>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-sub)' }}>
              Choose how Whizz looks for you
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {THEME_OPTIONS.map(opt => {
              const active = theme === opt.value
              return (
                <button key={opt.value} onClick={() => setTheme(opt.value)}
                  className="flex flex-col gap-3 p-4 rounded-2xl border text-left transition-all duration-200"
                  style={{
                    background: active ? 'var(--color-accent-dim)' : 'var(--color-surface)',
                    borderColor: active ? 'var(--color-accent)' : 'var(--color-border)',
                  }}>
                  <div className="flex gap-1.5">
                    {opt.dots.map((c, i) => (
                      <div key={i} className="w-4 h-4 rounded-full border"
                        style={{ background: c, borderColor: 'rgba(128,128,128,0.2)' }}/>
                    ))}
                  </div>
                  <div>
                    <p className="text-sm font-bold flex items-center gap-1.5"
                      style={{ color: active ? 'var(--color-accent)' : 'var(--color-text)' }}>
                      {opt.label}
                      {active && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      )}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-sub)' }}>{opt.desc}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Sign Out Card ── */}
        <div className="rounded-2xl p-6 border"
          style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--color-text-muted)' }}>
            Session
          </p>
          <button onClick={openConfirm}
            className="flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-bold border transition-all"
            style={{ borderColor: 'rgba(248,113,113,0.3)', color: 'var(--color-danger)', background: 'rgba(248,113,113,0.06)' }}>
            <LogOut size={16}/> Sign Out
          </button>
        </div>

      </div>
    </>
  )
}