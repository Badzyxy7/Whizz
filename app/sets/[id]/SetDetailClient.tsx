'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import type { StudySet, Question } from '@/lib/types'

const MODE_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  flashcards:      { bg: 'var(--color-accent-dim)',  color: 'var(--color-accent)',    border: 'var(--color-border-hover)' },
  multiple_choice: { bg: 'var(--color-accent-dim)',  color: 'var(--color-accent)',    border: 'var(--color-border-hover)' },
  identification:  { bg: 'var(--color-surface)',     color: 'var(--color-text-muted)', border: 'var(--color-border)'      },
  enumeration:     { bg: 'var(--color-accent-dim)',  color: 'var(--color-accent)',    border: 'var(--color-border)'       },
}

const MODE_LABELS: Record<string, string> = {
  flashcards:      'Flashcards',
  multiple_choice: 'Multiple Choice',
  identification:  'Identification',
  enumeration:     'Enumeration',
}

function getQuestionLabel(q: Question): string {
  const c = q.content as any
  return c.front ?? c.question ?? ''
}

export default function SetDetailClient({ set, questions }: { set: StudySet; questions: Question[] }) {
  const supabase = createClient()
  const router = useRouter()
  const [activeMode, setActiveMode] = useState(set.modes[0])
  const [editingTitle, setEditingTitle] = useState(false)
  const [title, setTitle] = useState(set.title)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState<any>(null)

  const modeQuestions = questions.filter(q => q.mode === activeMode)

  async function saveTitle() {
    await supabase.from('study_sets').update({ title }).eq('id', set.id)
    setEditingTitle(false)
    router.refresh()
  }

  async function deleteQuestion(id: string) {
    await supabase.from('questions').delete().eq('id', id)
    router.refresh()
  }

  async function saveQuestion() {
    if (!editingId) return
    await supabase.from('questions').update({ content: editDraft }).eq('id', editingId)
    setEditingId(null)
    setEditDraft(null)
    router.refresh()
  }

  async function deleteSet() {
    if (!confirm('Delete this study set? This cannot be undone.')) return
    await supabase.from('study_sets').delete().eq('id', set.id)
    router.push('/sets')
  }

  return (
    <div className="px-6 py-8 sm:px-10 sm:py-10 max-w-5xl">

      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div className="flex flex-col gap-2">
          <Link
            href="/sets"
            className="flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Back to Sets
          </Link>

          {editingTitle ? (
            <div className="flex items-center gap-3 flex-wrap">
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="rounded-xl px-4 py-2 text-2xl font-black focus:outline-none"
                style={{
                  background: 'var(--color-card)',
                  border: '1px solid var(--color-border-hover)',
                  color: 'var(--color-text)',
                }}
                autoFocus
              />
              <button
                onClick={saveTitle}
                className="text-sm font-semibold px-4 py-2 rounded-xl transition-all hover:brightness-110"
                style={{ background: 'var(--color-accent)', color: 'var(--color-accent-text)' }}
              >
                Save
              </button>
              <button
                onClick={() => setEditingTitle(false)}
                className="text-sm font-semibold px-3 py-2 rounded-xl transition-all hover:brightness-110"
                style={{
                  background: 'var(--color-accent-dim)',
                  color: 'var(--color-accent)',
                  border: '1px solid var(--color-border)',
                }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <h1
                className="text-3xl sm:text-4xl font-black tracking-tight"
                style={{ color: 'var(--color-text)' }}
              >
                {title}
              </h1>
              <button
                onClick={() => setEditingTitle(true)}
                className="transition-opacity hover:opacity-60"
                style={{ color: 'var(--color-text-sub)' }}
                title="Edit title"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
            </div>
          )}

          <p className="text-xs font-medium" style={{ color: 'var(--color-text-sub)' }}>
            {questions.length} questions · Created{' '}
            {new Date(set.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <button
          onClick={deleteSet}
          className="text-xs font-semibold px-4 py-2 rounded-xl transition-all hover:brightness-110 flex-shrink-0"
          style={{
            background: 'var(--color-surface)',
            color: 'var(--color-text-muted)',
            border: '1px solid var(--color-border)',
          }}
        >
          Delete Set
        </button>
      </div>

      {/* Mode tabs */}
      <div className="flex gap-2.5 mb-8 flex-wrap">
        {set.modes.map(mode => {
          const mc = MODE_COLORS[mode]
          const isActive = activeMode === mode
          return (
            <button
              key={mode}
              onClick={() => setActiveMode(mode)}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 hover:brightness-110"
              style={
                isActive
                  ? { background: mc.bg, color: mc.color, border: `1px solid ${mc.border}` }
                  : {
                      background: 'var(--color-card)',
                      color: 'var(--color-text-sub)',
                      border: '1px solid var(--color-border)',
                    }
              }
            >
              {MODE_LABELS[mode]}
            </button>
          )
        })}
      </div>

      {/* Study Now bar */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-sub)' }}>
          {modeQuestions.length} questions in this mode
        </p>
        <Link
          href={`/sets/${set.id}/study/${activeMode}`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all hover:brightness-110 hover:-translate-y-0.5"
          style={{
            background: 'var(--color-accent)',
            color: 'var(--color-accent-text)',
            boxShadow: '0 4px 20px var(--color-shadow)',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
          Study Now
        </Link>
      </div>

      {/* Questions list */}
      <div className="flex flex-col gap-2.5">
        {modeQuestions.map((q, i) => (
          <div
            key={q.id}
            className="rounded-2xl p-4 transition-all duration-200"
            style={{
              background: 'var(--color-card)',
              border: editingId === q.id
                ? '1px solid var(--color-border-hover)'
                : '1px solid var(--color-border)',
              backdropFilter: 'blur(12px)',
            }}
          >
            {editingId === q.id ? (
              <div className="flex flex-col gap-3">
                <QuestionEditor mode={q.mode} draft={editDraft} onChange={setEditDraft} />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setEditingId(null)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:brightness-110"
                    style={{
                      background: 'var(--color-accent-dim)',
                      color: 'var(--color-accent)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveQuestion}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all hover:brightness-110"
                    style={{ background: 'var(--color-accent)', color: 'var(--color-accent-text)' }}
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                    <span className="mr-2 font-bold" style={{ color: 'var(--color-text-sub)' }}>{i + 1}.</span>
                    {getQuestionLabel(q)}
                  </p>
                  {q.mode === 'flashcards' && (
                    <p className="text-xs mt-1 truncate" style={{ color: 'var(--color-text-muted)' }}>
                      → {(q.content as any).back}
                    </p>
                  )}
                  {q.mode === 'identification' && (
                    <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                      → {(q.content as any).answer}
                    </p>
                  )}
                  {q.mode === 'multiple_choice' && (
                    <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                      Answer: {(q.content as any).answer}
                    </p>
                  )}
                  {q.mode === 'enumeration' && (
                    <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                      {(q.content as any).answers?.length} items
                    </p>
                  )}
                </div>

                <div className="flex gap-1.5 shrink-0">
                  <button
                    onClick={() => { setEditingId(q.id); setEditDraft({ ...q.content }) }}
                    className="text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all hover:brightness-110"
                    style={{
                      background: 'var(--color-accent-dim)',
                      color: 'var(--color-accent)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteQuestion(q.id)}
                    className="text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all hover:brightness-110"
                    style={{
                      background: 'var(--color-surface)',
                      color: 'var(--color-text-muted)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {modeQuestions.length === 0 && (
          <div
            className="rounded-2xl p-12 flex flex-col items-center gap-3"
            style={{
              background: 'var(--color-card)',
              border: '1px solid var(--color-border)',
            }}
          >
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-sub)' }}>
              No questions in this mode.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function QuestionEditor({ mode, draft, onChange }: { mode: string; draft: any; onChange: (d: any) => void }) {
  const baseStyle: React.CSSProperties = {
    background: 'var(--color-card)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text)',
    width: '100%',
  }

  function Input({ value, onChange: onCh, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
    return (
      <input
        value={value}
        onChange={e => onCh(e.target.value)}
        placeholder={placeholder}
        className="rounded-lg px-3 py-2 text-sm focus:outline-none transition-all"
        style={baseStyle}
        onFocus={e => (e.target.style.borderColor = 'var(--color-border-hover)')}
        onBlur={e => (e.target.style.borderColor = 'var(--color-border)')}
      />
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {mode === 'flashcards' && (<>
        <Input value={draft.front} onChange={v => onChange({ ...draft, front: v })} placeholder="Front" />
        <Input value={draft.back} onChange={v => onChange({ ...draft, back: v })} placeholder="Back" />
      </>)}
      {mode === 'identification' && (<>
        <Input value={draft.question} onChange={v => onChange({ ...draft, question: v })} placeholder="Question" />
        <Input value={draft.answer} onChange={v => onChange({ ...draft, answer: v })} placeholder="Answer" />
      </>)}
      {mode === 'multiple_choice' && (<>
        <Input value={draft.question} onChange={v => onChange({ ...draft, question: v })} placeholder="Question" />
        {draft.choices?.map((c: string, i: number) => (
          <Input
            key={i}
            value={c}
            onChange={v => { const ch = [...draft.choices]; ch[i] = v; onChange({ ...draft, choices: ch }) }}
            placeholder={`Choice ${i + 1}`}
          />
        ))}
        <Input value={draft.answer} onChange={v => onChange({ ...draft, answer: v })} placeholder="Correct answer (A/B/C/D)" />
      </>)}
      {mode === 'enumeration' && (<>
        <Input value={draft.question} onChange={v => onChange({ ...draft, question: v })} placeholder="Question" />
        <textarea
          value={draft.answers?.join('\n')}
          onChange={e => onChange({ ...draft, answers: e.target.value.split('\n') })}
          placeholder="Answers (one per line)"
          rows={4}
          className="rounded-lg px-3 py-2 text-sm focus:outline-none transition-all resize-none"
          style={baseStyle}
          onFocus={e => (e.target.style.borderColor = 'var(--color-border-hover)')}
          onBlur={e => (e.target.style.borderColor = 'var(--color-border)')}
        />
      </>)}
    </div>
  )
}