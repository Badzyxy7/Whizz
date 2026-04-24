'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { Profile } from '@/lib/types'
import {
  LayoutDashboard,
  BookOpen,
  BarChart2,
  User,
  LogOut,
  X,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/sets',      label: 'Study Sets', icon: BookOpen         },
  { href: '/progress',  label: 'Progress',   icon: BarChart2        },
  { href: '/profile',   label: 'Profile',    icon: User             },
]

export default function Sidebar({ profile }: { profile: Profile | null }) {
  const pathname = usePathname()
  const router   = useRouter()
  const supabase = createClient()

  const [showConfirm, setShowConfirm] = useState(false)
  const [signingOut, setSigningOut]   = useState(false)

  function openConfirm() { setShowConfirm(true) }
  function closeConfirm() { if (signingOut) return; setShowConfirm(false) }

  async function handleSignOut() {
    setSigningOut(true)
    await supabase.auth.signOut()
    router.push('/login')
  }

  const initial = profile?.full_name?.[0]?.toUpperCase() ?? '?'

  return (
    <>
      {/* ── Keyframes ── */}
      <style>{`
        @keyframes sidebarModalIn {
          from { opacity: 0; transform: scale(0.95) translateY(6px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);   }
        }
        @keyframes sidebarSpin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* ── Confirmation Modal ── */}
      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
          onClick={closeConfirm}
        >
          <div
            className="relative w-full max-w-sm rounded-2xl p-6 flex flex-col gap-4"
            style={{
              background: 'var(--color-card)',
              border: '1px solid var(--color-border)',
              boxShadow: '0 24px 60px var(--color-shadow)',
              animation: 'sidebarModalIn 0.18s ease both',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            {!signingOut && (
              <button
                onClick={closeConfirm}
                className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:bg-white/5"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <X size={15} strokeWidth={2} />
              </button>
            )}

            {/* Icon */}
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.18)' }}
            >
              <LogOut size={18} strokeWidth={2} color="var(--color-danger)" />
            </div>

            {/* Copy */}
            <div>
              <h2 className="text-base font-black tracking-tight mb-1" style={{ color: 'var(--color-text)' }}>
                Sign out?
              </h2>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                You'll be redirected to the login page.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-1">
              <button
                onClick={closeConfirm}
                disabled={signingOut}
                className="flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 disabled:opacity-40"
                style={{
                  background: 'var(--color-accent-dim)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-muted)',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 disabled:opacity-70 flex items-center justify-center gap-2"
                style={{
                  background: signingOut ? 'rgba(248,113,113,0.14)' : 'rgba(248,113,113,0.08)',
                  border: '1px solid rgba(248,113,113,0.2)',
                  color: 'var(--color-danger)',
                }}
              >
                {signingOut ? (
                  <>
                    <span
                      className="inline-block w-3.5 h-3.5 rounded-full border-2"
                      style={{
                        borderColor: 'rgba(248,113,113,0.4)',
                        borderTopColor: 'var(--color-danger)',
                        animation: 'sidebarSpin 0.6s linear infinite',
                      }}
                    />
                    Signing out…
                  </>
                ) : (
                  <>
                    <LogOut size={14} strokeWidth={2} />
                    Sign Out
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Desktop Sidebar ── */}
      <div
        className="hidden md:flex w-[240px] min-h-screen fixed left-0 top-0 z-20 flex-col py-7 px-3"
        style={{
          background: 'var(--color-sidebar)',
          borderRight: '1px solid var(--color-border)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-10 px-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: 'var(--color-accent)',
              boxShadow: '0 4px 16px var(--color-shadow)',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-text)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
          </div>
          <Link
            href="/dashboard"
            className="text-[1.15rem] font-black tracking-tight hover:opacity-80 transition-opacity"
            style={{ color: 'var(--color-accent)', letterSpacing: '-0.04em', textDecoration: 'none' }}
          >
            Whizz
          </Link>
        </div>

        {/* Nav */}
        <div className="flex-1 flex flex-col gap-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150"
                style={{
                  background: isActive ? 'var(--color-surface)' : 'transparent',
                  borderLeft: isActive ? '2px solid var(--color-accent)' : '2px solid transparent',
                  textDecoration: 'none',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <Icon
                  size={16}
                  strokeWidth={isActive ? 2.5 : 2}
                  color={isActive ? 'var(--color-accent)' : 'var(--color-text-muted)'}
                />
                <span
                  className="text-[0.82rem] font-semibold"
                  style={{ color: isActive ? 'var(--color-accent)' : 'var(--color-text-muted)' }}
                >
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>

        {/* Divider */}
        <div
          className="mx-3 mb-3"
          style={{ height: '1px', background: 'var(--color-border)' }}
        />

        {/* User row */}
        <div
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
          style={{
            background: 'var(--color-accent-dim)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div
            className="w-7 h-7 rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center text-xs font-bold"
            style={{
              border: '1.5px solid var(--color-border-hover)',
              background: 'var(--color-surface)',
              color: 'var(--color-accent)',
            }}
          >
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              initial
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[0.7rem] font-bold truncate" style={{ color: 'var(--color-text)' }}>
              {profile?.full_name ?? 'User'}
            </p>
            <p className="text-[0.62rem] truncate" style={{ color: 'var(--color-text-muted)' }}>
              {profile?.email ?? ''}
            </p>
          </div>
          <button
            onClick={openConfirm}
            title="Sign out"
            className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-white/5"
            style={{ color: 'var(--color-text-muted)', background: 'transparent' }}
          >
            <LogOut size={13} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* ── Mobile Bottom Nav ── */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around px-2 py-2"
        style={{
          background: 'var(--color-sidebar)',
          borderTop: '1px solid var(--color-border)',
        }}
      >
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center gap-1 px-4 py-1.5 rounded-xl transition-all duration-150"
              style={{
                background: isActive ? 'var(--color-surface)' : 'transparent',
                textDecoration: 'none',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <Icon
                size={20}
                strokeWidth={isActive ? 2.5 : 2}
                color={isActive ? 'var(--color-accent)' : 'var(--color-text-muted)'}
              />
              <span
                className="text-[0.55rem] font-semibold"
                style={{ color: isActive ? 'var(--color-accent)' : 'var(--color-text-muted)' }}
              >
                {item.label}
              </span>
            </Link>
          )
        })}

        <button
          onClick={openConfirm}
          className="flex flex-col items-center justify-center gap-1 px-4 py-1.5 rounded-xl transition-all duration-150"
          style={{
            background: 'transparent',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <LogOut size={20} strokeWidth={2} color="var(--color-text-muted)" />
          <span className="text-[0.55rem] font-semibold" style={{ color: 'var(--color-text-muted)' }}>
            Sign Out
          </span>
        </button>
      </div>
    </>
  )
}