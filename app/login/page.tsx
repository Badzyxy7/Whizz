'use client'

import { createClient } from '@/lib/supabase'
import { useState } from 'react'
import { FileText, Sparkles, BarChart2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

const FEATURES = [
  { icon: FileText, label: 'Upload PDF or DOCX' },
  { icon: Sparkles, label: 'AI Question Generator' },
  { icon: BarChart2, label: 'Track Your Progress' },
]

export default function LoginPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  async function signInWithGoogle() {
    setLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#0a0a0a' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        .login-wrap {
          font-family: 'DM Sans', ui-sans-serif, system-ui, sans-serif;
        }
        .login-wrap h1,
        .login-wrap h2,
        .login-wrap h3,
        .login-wrap .syne {
          font-family: 'Syne', ui-sans-serif, system-ui, sans-serif;
        }
        .login-wrap button {
          font-family: 'Syne', ui-sans-serif, system-ui, sans-serif;
        }
      `}</style>

      {/* Back button */}
      <Link
        href="/"
        className="fixed top-6 left-6 flex items-center gap-2 text-sm font-semibold z-50 transition-all duration-200 hover:gap-3"
        style={{ color: '#CEF17B', fontFamily: "'Syne', sans-serif" }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
        Back
      </Link>

      <div
        className="login-wrap w-full max-w-5xl flex rounded-3xl overflow-hidden shadow-2xl min-h-[600px]"
        style={{ border: '1px solid rgba(206,241,123,0.15)' }}
      >

        {/* ── LEFT — Form Panel ── */}
        <div className="flex-1 flex flex-col justify-between p-10 lg:p-14" style={{ background: '#0f0f0f' }}>

          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#CEF17B' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#084734" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
            </div>
            <span className="syne font-black text-xl tracking-tight" style={{ color: '#CEF17B' }}>Whizz</span>
          </div>

          {/* Heading */}
          <div className="mt-12">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#CDEDB3' }}>
              AI-powered study tool
            </p>
            <h1 className="text-4xl font-black leading-tight mb-4" style={{ color: '#ffffff' }}>
              Study smarter,<br />
              <span style={{ color: '#CEF17B' }}>not harder.</span>
            </h1>
            <p className="text-sm leading-relaxed max-w-xs" style={{ color: '#5a7a60' }}>
              Upload your notes, let AI generate questions, and track your progress over time.
            </p>
          </div>

          {/* Feature list */}
          <div className="mt-8 flex flex-col gap-3">
            {FEATURES.map((f) => (
              <div key={f.label} className="flex items-center gap-3">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(206,241,123,0.1)' }}
                >
                  <f.icon size={14} color="#CEF17B" strokeWidth={2} />
                </div>
                <span className="text-sm" style={{ color: '#CDEDB3' }}>{f.label}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-10 flex flex-col gap-3">
            <button
              onClick={signInWithGoogle}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 font-bold rounded-2xl py-4 text-sm transition-all duration-200 disabled:opacity-60 shadow-lg hover:brightness-110"
              style={{ background: '#CEF17B', color: '#084734' }}
            >
              {loading ? (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              {loading ? 'Signing in...' : 'Continue with Google'}
            </button>

            <p className="text-center text-xs" style={{ color: '#3a5a40' }}>
              By signing in, your study data stays private and secure.
            </p>
          </div>

          {/* Footer */}
          <div className="mt-10 flex items-center gap-2 text-xs" style={{ color: '#3a5a40' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="16" x="2" y="4" rx="2"/>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
            Help@Whizz.com
          </div>
        </div>

        {/* ── RIGHT — 3D Cat Image Panel ── */}
        <div
          className="hidden lg:flex w-[48%] relative overflow-hidden items-center justify-center"
          style={{ background: '#CEF17B' }}
        >
          {/* Subtle gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at 30% 20%, rgba(206,241,123,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(8,71,52,0.6) 0%, transparent 55%)',
            }}
          />

          {/* Noise texture */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E")`,
            }}
          />

          {/* 3D Cat Image */}
          <div className="relative z-10 w-full h-full flex items-center justify-center p-8">
            <div className="relative w-full h-full">
              <Image
                src="/cat.png"
                alt="Whizz mascot"
                fill
                className="object-contain drop-shadow-2xl"
                style={{
                  filter: 'drop-shadow(0 20px 60px rgba(206,241,123,0.2))',
                }}
                priority
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}