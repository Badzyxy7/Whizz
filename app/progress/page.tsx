import { createServerSupabaseClient } from '@/lib/supabase-server'
import AppShell from '@/components/layout/AppShell'
import { BarChart2, Trophy, Target, Clock } from 'lucide-react'
import type { Session } from '@/lib/types'

const MODE_COLORS: Record<string, string> = {
  flashcards:      'bg-[var(--color-accent-dim)] text-[var(--color-accent)]',
  multiple_choice: 'bg-[var(--color-accent-dim)] text-[var(--color-text)]',
  identification:  'bg-[var(--color-surface)] text-[var(--color-text-muted)]',
  enumeration:     'bg-[var(--color-accent-dim)] text-[var(--color-text-sub)]',
}

const MODE_LABELS: Record<string, string> = {
  flashcards:      'Flashcards',
  multiple_choice: 'M. Choice',
  identification:  'Identify',
  enumeration:     'Enumerate',
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return '—'
  if (seconds < 60) return `${seconds}s`
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit',
  })
}

export default async function ProgressPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: sessions } = await supabase
    .from('sessions')
    .select('*, study_sets(title)')
    .eq('user_id', user!.id)
    .order('completed_at', { ascending: false })

  const typedSessions = (sessions ?? []) as (Session & { study_sets: { title: string } | null })[]

  const totalSessions = typedSessions.length
  const bestScore = totalSessions > 0
    ? Math.max(...typedSessions.map(s => Math.round((s.score / s.total) * 100)))
    : 0
  const avgScore = totalSessions > 0
    ? Math.round(typedSessions.reduce((acc, s) => acc + (s.score / s.total) * 100, 0) / totalSessions)
    : 0
  const totalTime = typedSessions.reduce((acc, s) => acc + (s.duration_seconds ?? 0), 0)

  const stats = [
    { label: 'Total Sessions', value: totalSessions,             icon: BarChart2 },
    { label: 'Best Score',     value: `${bestScore}%`,           icon: Trophy    },
    { label: 'Avg Score',      value: `${avgScore}%`,            icon: Target    },
    { label: 'Study Time',     value: formatDuration(totalTime), icon: Clock     },
  ]

  return (
    <AppShell>
      <div className="px-4 py-5 pb-24 md:pb-10 sm:px-8 sm:py-10 max-w-5xl">

        {/* Header */}
        <div className="mb-5 sm:mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: 'var(--color-text-sub)' }}>
            Overview
          </p>
          <h1 className="text-2xl sm:text-4xl font-black leading-tight tracking-tight" style={{ color: 'var(--color-text)' }}>
            Progress
          </h1>
          <p className="mt-1 text-xs sm:text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Track your study history and performance
          </p>
        </div>

        {/* Stats — 2×2 on mobile, 4-col on sm+ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 mb-5 sm:mb-10">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="rounded-2xl px-3.5 py-3.5 sm:px-5 sm:py-5 flex flex-col gap-2.5 transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <div
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'var(--color-accent-dim)' }}
                >
                  <Icon size={13} color="var(--color-accent)" strokeWidth={2} />
                </div>
                <div>
                  <p
                    className="text-lg sm:text-2xl font-black leading-none tracking-tight mb-0.5"
                    style={{ color: 'var(--color-accent)' }}
                  >
                    {stat.value}
                  </p>
                  <p className="text-[0.63rem] font-medium" style={{ color: 'var(--color-text-sub)' }}>
                    {stat.label}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Session History label */}
        <div className="mb-3 sm:mb-5">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-sub)' }}>
            Session History
          </p>
        </div>

        {typedSessions.length === 0 ? (
          <div
            className="rounded-2xl p-10 sm:p-16 flex flex-col items-center gap-4 text-center"
            style={{
              background: 'var(--color-card)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: 'var(--color-accent-dim)' }}
            >
              <BarChart2 size={22} color="var(--color-accent)" strokeWidth={1.5} />
            </div>
            <div>
              <p className="font-semibold text-sm mb-1" style={{ color: 'var(--color-text)' }}>No sessions yet</p>
              <p className="text-xs" style={{ color: 'var(--color-text-sub)' }}>
                Complete a study session to see your history here.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* DESKTOP TABLE — hidden on mobile */}
            <div
              className="hidden sm:block rounded-2xl overflow-hidden"
              style={{
                background: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <div
                className="grid grid-cols-5 px-6 py-3 text-[0.65rem] font-semibold uppercase tracking-wider"
                style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-sub)' }}
              >
                <span className="col-span-2">Study Set</span>
                <span>Mode</span>
                <span>Score</span>
                <span>Date</span>
              </div>

              {typedSessions.map((session, i) => {
                const pct = Math.round((session.score / session.total) * 100)
                const scoreColor = pct >= 70 ? 'var(--color-accent)' : pct >= 50 ? 'var(--color-text-muted)' : 'var(--color-danger)'
                return (
                  <div
                    key={session.id}
                    className="grid grid-cols-5 px-6 py-4 items-center text-sm transition-colors duration-150"
                    style={{ borderBottom: i < typedSessions.length - 1 ? '1px solid var(--color-border)' : 'none' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-accent-dim)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span className="col-span-2 font-medium truncate pr-4" style={{ color: 'var(--color-text)' }}>
                      {session.study_sets?.title ?? 'Deleted Set'}
                    </span>
                    <span>
                      <span className={`text-[0.62rem] font-semibold px-2.5 py-1 rounded-full ${MODE_COLORS[session.mode]}`}>
                        {MODE_LABELS[session.mode]}
                      </span>
                    </span>
                    <span className="font-bold" style={{ color: scoreColor }}>
                      {session.mode === 'flashcards' ? (
                        <span className="font-normal text-xs" style={{ color: 'var(--color-text-sub)' }}>Review</span>
                      ) : (
                        <>
                          {pct}%
                          <span className="font-normal ml-1 text-xs" style={{ color: 'var(--color-text-sub)' }}>
                            ({session.score}/{session.total})
                          </span>
                        </>
                      )}
                    </span>
                    <span>
                      <span className="block text-xs" style={{ color: 'var(--color-text-muted)' }}>{formatDate(session.completed_at)}</span>
                      <span className="text-xs" style={{ color: 'var(--color-text-sub)' }}>{formatDuration(session.duration_seconds)}</span>
                    </span>
                  </div>
                )
              })}
            </div>

            {/* MOBILE CARDS — hidden on sm+ */}
            <div className="flex flex-col gap-2.5 sm:hidden">
              {typedSessions.map((session) => {
                const pct = Math.round((session.score / session.total) * 100)
                const scoreColor = pct >= 70 ? 'var(--color-accent)' : pct >= 50 ? 'var(--color-text-muted)' : 'var(--color-danger)'
                return (
                  <div
                    key={session.id}
                    className="rounded-2xl p-3.5 flex flex-col gap-2.5"
                    style={{
                      background: 'var(--color-card)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    {/* Title + score */}
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-sm leading-snug flex-1 min-w-0 truncate" style={{ color: 'var(--color-text)' }}>
                        {session.study_sets?.title ?? 'Deleted Set'}
                      </p>
                      <span className="font-black text-sm flex-shrink-0" style={{ color: scoreColor }}>
                        {session.mode === 'flashcards' ? (
                          <span className="font-normal text-xs" style={{ color: 'var(--color-text-sub)' }}>Review</span>
                        ) : (
                          `${pct}%`
                        )}
                      </span>
                    </div>

                    {/* Mode badge + score detail */}
                    <div className="flex items-center justify-between">
                      <span className={`text-[0.6rem] font-semibold px-2 py-0.5 rounded-full ${MODE_COLORS[session.mode]}`}>
                        {MODE_LABELS[session.mode]}
                      </span>
                      {session.mode !== 'flashcards' && (
                        <span className="text-[0.65rem]" style={{ color: 'var(--color-text-sub)' }}>
                          {session.score}/{session.total} correct
                        </span>
                      )}
                    </div>

                    {/* Date + duration */}
                    <div className="flex items-center justify-between">
                      <span className="text-[0.65rem]" style={{ color: 'var(--color-text-muted)' }}>
                        {formatDate(session.completed_at)} · {formatTime(session.completed_at)}
                      </span>
                      <span className="text-[0.65rem]" style={{ color: 'var(--color-text-sub)' }}>
                        {formatDuration(session.duration_seconds)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

      </div>
    </AppShell>
  )
}