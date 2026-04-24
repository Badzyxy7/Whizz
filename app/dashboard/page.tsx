import { createServerSupabaseClient } from '@/lib/supabase-server'
import AppShell from '@/components/layout/AppShell'
import Link from 'next/link'
import {
  BookOpen,
  CheckCircle2,
  Target,
  HelpCircle,
  Upload,
  Play,
  ArrowRight,
  FileText,
} from 'lucide-react'
import type { StudySet, Session } from '@/lib/types'

const MODE_COLORS: Record<string, { bg: string; color: string }> = {
  flashcards:      { bg: 'var(--color-accent-dim)',            color: 'var(--color-accent)' },
  multiple_choice: { bg: 'var(--color-accent-dim)',            color: 'var(--color-text-sub)' },
  identification:  { bg: 'rgba(8,71,52,0.35)',                 color: 'var(--color-text-sub)' },
  enumeration:     { bg: 'var(--color-accent-dim)',            color: 'var(--color-text-muted)' },
}

const MODE_LABELS: Record<string, string> = {
  flashcards:      'Flashcards',
  multiple_choice: 'M. Choice',
  identification:  'Identify',
  enumeration:     'Enumerate',
}

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: profile }, { data: sets }, { data: sessions }, { data: questions }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user!.id).single(),
    supabase.from('study_sets').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }).limit(4),
    supabase.from('sessions').select('*').eq('user_id', user!.id),
    supabase.from('questions').select('id, set_id').in(
      'set_id',
      (await supabase.from('study_sets').select('id').eq('user_id', user!.id)).data?.map(s => s.id) ?? []
    ),
  ])

  const totalSets      = sets?.length ?? 0
  const totalSessions  = sessions?.length ?? 0
  const avgScore       = sessions && sessions.length > 0
    ? Math.round(sessions.reduce((acc, s) => acc + (s.score / s.total) * 100, 0) / sessions.length)
    : 0
  const totalQuestions = questions?.length ?? 0

  const stats = [
    { label: 'Study Sets',    value: totalSets,      icon: BookOpen,     accent: 'var(--color-accent)' },
    { label: 'Sessions Done', value: totalSessions,  icon: CheckCircle2, accent: 'var(--color-text-sub)' },
    { label: 'Avg Score',     value: `${avgScore}%`, icon: Target,       accent: 'var(--color-accent)' },
    { label: 'Questions',     value: totalQuestions, icon: HelpCircle,   accent: 'var(--color-text-sub)' },
  ]

  const firstName = profile?.full_name?.split(' ')[0] ?? 'there'

  return (
    <AppShell>
      <div className="px-4 py-5 pb-24 md:pb-10 sm:px-8 sm:py-10 max-w-5xl">

        {/* ── Header ── */}
        <div className="mb-5 sm:mb-10">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-1.5"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Welcome back
          </p>
          <h1
            className="text-2xl sm:text-4xl font-black leading-tight tracking-tight"
            style={{ color: 'var(--color-text)' }}
          >
            Hey,{' '}
            <span style={{ color: 'var(--color-accent)' }}>{firstName}</span> 👋
          </h1>
          <p className="mt-1 text-xs sm:text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Ready to study? Pick up where you left off.
          </p>
        </div>

        {/* ── Stats ── */}
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
                  <Icon size={13} color={stat.accent} strokeWidth={2} />
                </div>
                <div>
                  <p
                    className="text-lg sm:text-2xl font-black leading-none tracking-tight mb-0.5"
                    style={{ color: stat.accent }}
                  >
                    {stat.value}
                  </p>
                  <p className="text-[0.63rem] font-medium" style={{ color: 'var(--color-text-muted)' }}>
                    {stat.label}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Quick Actions ── */}
        <div className="mb-5 sm:mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--color-text-muted)' }}>
            Quick Actions
          </p>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <Link
              href="/sets"
              className="inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl font-semibold text-sm transition-all hover:brightness-110 hover:-translate-y-0.5 w-full sm:w-auto"
              style={{
                background: 'var(--color-accent)',
                color: 'var(--color-accent-text)',
                boxShadow: '0 4px 20px var(--color-shadow)',
              }}
            >
              <Upload size={15} strokeWidth={2.5} />
              Upload New File
            </Link>
            <Link
              href="/sets"
              className="inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl font-semibold text-sm transition-all hover:brightness-110 hover:-translate-y-0.5 w-full sm:w-auto"
              style={{
                background: 'var(--color-accent-dim)',
                color: 'var(--color-text-sub)',
                border: '1px solid var(--color-border)',
              }}
            >
              <Play size={15} strokeWidth={2.5} />
              Continue Studying
            </Link>
          </div>
        </div>

        {/* ── Recent Study Sets ── */}
        <div className="flex items-center justify-between mb-3 sm:mb-5">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
            Recent Study Sets
          </p>
          <Link
            href="/sets"
            className="inline-flex items-center gap-1 text-xs font-semibold transition-opacity hover:opacity-70"
            style={{ color: 'var(--color-accent)' }}
          >
            View all <ArrowRight size={12} />
          </Link>
        </div>

        {sets && sets.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4">
            {(sets as StudySet[]).map((set) => (
              <div
                key={set.id}
                className="rounded-2xl p-3.5 sm:p-5 flex flex-col justify-between gap-3 transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                {/* Top row */}
                <div className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: 'var(--color-accent-dim)' }}
                  >
                    <FileText size={14} color="var(--color-accent)" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className="font-bold text-sm leading-snug mb-1.5 truncate"
                      style={{ color: 'var(--color-text)', letterSpacing: '-0.01em' }}
                    >
                      {set.title}
                    </h3>
                    {/* Mode badges */}
                    <div className="flex flex-wrap gap-1">
                      {set.modes.map((mode) => {
                        const mc = MODE_COLORS[mode] ?? { bg: 'var(--color-accent-dim)', color: 'var(--color-accent)' }
                        return (
                          <span
                            key={mode}
                            className="text-[0.6rem] font-semibold px-1.5 py-0.5 rounded-md leading-tight"
                            style={{ background: mc.bg, color: mc.color }}
                          >
                            {MODE_LABELS[mode]}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Bottom row — progress + CTA */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-[0.65rem] mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
                      <span>Progress</span>
                      <span style={{ color: 'var(--color-accent)' }}>40%</span>
                    </div>
                    <div
                      className="w-full h-1 rounded-full overflow-hidden"
                      style={{ background: 'var(--color-accent-dim)' }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{ width: '40%', background: 'linear-gradient(90deg, var(--color-surface), var(--color-accent))' }}
                      />
                    </div>
                  </div>
                  <Link
                    href={`/sets/${set.id}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[0.72rem] font-bold transition-all hover:brightness-110 flex-shrink-0"
                    style={{ background: 'var(--color-accent)', color: 'var(--color-accent-text)' }}
                  >
                    <Play size={11} strokeWidth={3} />
                    Study
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty state */
          <div
            className="rounded-2xl p-8 sm:p-16 flex flex-col items-center gap-4 text-center"
            style={{
              background: 'var(--color-card)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: 'var(--color-accent-dim)' }}
            >
              <BookOpen size={22} color="var(--color-accent)" strokeWidth={1.5} />
            </div>
            <div>
              <p className="font-semibold text-sm mb-1" style={{ color: 'var(--color-text)' }}>
                No study sets yet
              </p>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                Upload your first file to get started
              </p>
            </div>
            <Link
              href="/sets"
              className="inline-flex items-center gap-2 font-semibold rounded-xl px-6 py-2.5 text-sm transition-all hover:brightness-110"
              style={{
                background: 'var(--color-accent)',
                color: 'var(--color-accent-text)',
                boxShadow: '0 4px 20px var(--color-shadow)',
              }}
            >
              <Upload size={14} strokeWidth={2.5} />
              Upload a File
            </Link>
          </div>
        )}

      </div>
    </AppShell>
  )
}