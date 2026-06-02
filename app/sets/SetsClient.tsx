'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import CreateSetModal from '@/components/ui/CreateSetModal'
import type { StudySet } from '@/lib/types'
import {
  Plus,
  BookOpen,
  Play,
  Calendar,
  FileText,
  Layers,
} from 'lucide-react'

const MODE_COLORS: Record<string, { bg: string; color: string }> = {
  flashcards:      { bg: 'var(--color-accent-dim)',  color: 'var(--color-accent)'    },
  multiple_choice: { bg: 'var(--color-accent-dim)',  color: 'var(--color-text-sub)'  },
  identification:  { bg: 'var(--color-surface)',     color: 'var(--color-text-sub)'  },
  enumeration:     { bg: 'var(--color-accent-dim)',  color: 'var(--color-text-muted)' },
}

const MODE_LABELS: Record<string, string> = {
  flashcards:      'Flashcards',
  multiple_choice: 'M. Choice',
  identification:  'Identify',
  enumeration:     'Enumerate',
}

const CARD_ACCENTS = [
  { from: 'var(--color-surface)', to: 'var(--color-card)' },
  { from: 'var(--color-surface)', to: 'var(--color-accent-dim)' },
  { from: 'var(--color-card)',    to: 'var(--color-surface)' },
  { from: 'var(--color-surface)', to: 'var(--color-card)' },
  { from: 'var(--color-card)',    to: 'var(--color-accent-dim)' },
]

export default function SetsClient({ initialSets }: { initialSets: StudySet[] }) {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)

  return (
    <div className="px-4 py-5 pb-24 md:pb-10 sm:px-8 sm:py-10 max-w-6xl">

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-6 sm:mb-10 gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
            Your Library
          </p>
          <h1
            className="text-2xl sm:text-4xl font-black tracking-tight leading-tight"
            style={{ color: 'var(--color-text)' }}
          >
            Study Sets
          </h1>
          <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            {initialSets.length} set{initialSets.length !== 1 ? 's' : ''} in your library
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 font-semibold rounded-xl px-4 py-2.5 sm:px-5 sm:py-3 text-sm transition-all hover:brightness-110 hover:-translate-y-0.5 flex-shrink-0"
          style={{
            background: 'var(--color-accent)',
            color: 'var(--color-accent-text)',
            boxShadow: '0 4px 20px var(--color-shadow)',
          }}
        >
          <Plus size={15} strokeWidth={2.5} />
          <span className="hidden sm:inline">New Study Set</span>
          <span className="sm:hidden">New</span>
        </button>
      </div>

      {/* ── Grid ── */}
      {initialSets.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {initialSets.map((set, i) => {
            const accent = CARD_ACCENTS[i % CARD_ACCENTS.length]
            return (
              <div
                key={set.id}
                className="rounded-2xl overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-1"
                style={{
                  background: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                {/* Card top accent bar */}
                <div
                  className="h-14 sm:h-20 flex items-center justify-center flex-shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${accent.from} 0%, ${accent.to} 100%)`,
                  }}
                >
                  <div
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'var(--color-accent-dim)' }}
                  >
                    <FileText size={15} color="var(--color-accent)" strokeWidth={1.8} />
                  </div>
                </div>

                {/* Card body */}
                <div className="p-3 sm:p-4 flex flex-col gap-2 sm:gap-3 flex-1">
                  {/* Title */}
                  <p
                    className="font-bold text-xs sm:text-sm leading-snug line-clamp-2"
                    style={{ color: 'var(--color-text)', letterSpacing: '-0.01em' }}
                  >
                    {set.title}
                  </p>

                  {/* Mode badges */}
                  <div className="flex flex-wrap gap-1">
                    {set.modes.map((mode) => {
                      const mc = MODE_COLORS[mode] ?? { bg: 'var(--color-accent-dim)', color: 'var(--color-accent)' }
                      return (
                        <span
                          key={mode}
                          className="text-[0.55rem] sm:text-[0.62rem] font-semibold px-1.5 py-0.5 rounded-md leading-tight"
                          style={{ background: mc.bg, color: mc.color }}
                        >
                          {MODE_LABELS[mode]}
                        </span>
                      )
                    })}
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
                    <Calendar size={10} strokeWidth={2} />
                    <p className="text-[0.58rem] sm:text-[0.65rem]">
                      {new Date(set.created_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </p>
                  </div>

                  {/* Spacer */}
                  <div className="flex-1" />

                  {/* CTA */}
                  <Link
                    href={`/sets/${set.id}`}
                    className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-[0.7rem] sm:text-[0.75rem] font-bold transition-all hover:brightness-110"
                    style={{ background: 'var(--color-accent)', color: 'var(--color-accent-text)' }}
                  >
                    <Play size={10} strokeWidth={3} />
                    Study
                  </Link>
                </div>
              </div>
            )
          })}

          {/* ── Add new card (inline) ── */}
          <button
            onClick={() => setShowModal(true)}
            className="rounded-2xl flex flex-col items-center justify-center gap-2 sm:gap-3 min-h-[160px] sm:min-h-[200px] transition-all duration-200 hover:-translate-y-1 group"
            style={{
              background: 'var(--color-card)',
              border: '1px dashed var(--color-border-hover)',
            }}
          >
            <div
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all group-hover:scale-110"
              style={{ background: 'var(--color-accent-dim)' }}
            >
              <Plus size={15} color="var(--color-accent)" strokeWidth={2} />
            </div>
            <p className="text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>
              New Set
            </p>
          </button>
        </div>
      ) : (
        /* ── Empty state ── */
        <div
          className="rounded-2xl p-10 sm:p-20 flex flex-col items-center gap-4 sm:gap-5 text-center"
          style={{
            background: 'var(--color-card)',
            border: '1px dashed var(--color-border)',
          }}
        >
          <div
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'var(--color-accent-dim)' }}
          >
            <Layers size={24} color="var(--color-accent)" strokeWidth={1.5} />
          </div>
          <div>
            <p className="font-bold text-sm sm:text-base mb-1" style={{ color: 'var(--color-text)' }}>
              Your library is empty
            </p>
            <p className="text-xs sm:text-sm max-w-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
              Upload a PDF or DOCX and Whizz will generate study questions for you automatically.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 font-semibold rounded-xl px-5 py-2.5 sm:px-6 sm:py-3 text-sm transition-all hover:brightness-110"
            style={{
              background: 'var(--color-accent)',
              color: 'var(--color-accent-text)',
              boxShadow: '0 4px 20px var(--color-shadow)',
            }}
          >
            <Plus size={15} strokeWidth={2.5} />
            Create your first set
          </button>
        </div>
      )}

      {showModal && (
        <CreateSetModal
  onClose={() => setShowModal(false)}
  onSuccess={(setId) => {
    setShowModal(false)
    router.push(`/sets/${setId}`)
  }}
/>
      )}
    </div>
  )
}