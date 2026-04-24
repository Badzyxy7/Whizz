'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import type { Question } from '@/lib/types'

export default function EnumerationMode({ questions, setId, setTitle }: { questions: Question[]; setId: string; setTitle: string }) {
  const supabase = createClient()
  const [index, setIndex] = useState(0)
  const [chipInput, setChipInput] = useState('')
  const [chips, setChips] = useState<string[]>([])
  const [allAnswers, setAllAnswers] = useState<string[][]>([])
  const [showResults, setShowResults] = useState(false)
  const [startTime] = useState(Date.now())

  const q = questions[index]
  const content = q?.content as any
  const progress = ((index + 1) / questions.length) * 100

  function addChip() {
    if (!chipInput.trim()) return
    setChips(prev => [...prev, chipInput.trim()])
    setChipInput('')
  }

  function removeChip(i: number) {
    setChips(prev => prev.filter((_, idx) => idx !== i))
  }

  function submit() {
    const newAllAnswers = [...allAnswers, chips]
    setAllAnswers(newAllAnswers)
    setChips([])
    setChipInput('')
    if (index < questions.length - 1) setIndex(i => i + 1)
    else finishSession(newAllAnswers)
  }

  async function finishSession(finalAnswers: string[][]) {
    let totalCorrect = 0
    let totalItems = 0
    questions.forEach((q, i) => {
      const c = q.content as any
      const correct = c.answers as string[]
      totalItems += correct.length
      const userAnswers = finalAnswers[i] ?? []
      correct.forEach(ans => {
        if (userAnswers.some(u => u.toLowerCase() === ans.toLowerCase())) totalCorrect++
      })
    })
    const duration = Math.round((Date.now() - startTime) / 1000)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('sessions').insert({
        user_id: user.id, set_id: setId, mode: 'enumeration',
        score: totalCorrect, total: totalItems, duration_seconds: duration
      })
    }
    setShowResults(true)
  }

  if (showResults) {
    let totalCorrect = 0
    let totalItems = 0
    questions.forEach((q, i) => {
      const c = q.content as any
      const correct = c.answers as string[]
      totalItems += correct.length
      const userAnswers = allAnswers[i] ?? []
      correct.forEach(ans => {
        if (userAnswers.some(u => u.toLowerCase() === ans.toLowerCase())) totalCorrect++
      })
    })
    const pct = Math.round((totalCorrect / totalItems) * 100)
    const scoreColor = pct >= 70 ? '#CEF17B' : pct >= 50 ? '#CDEDB3' : '#5db88a'

    return (
      <div className="min-h-screen px-8 py-10 max-w-3xl mx-auto">

        {/* Score */}
        <div className="text-center mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#3a5a40' }}>
            Your Score
          </p>
          <p className="text-7xl font-black leading-none tracking-tight" style={{ color: scoreColor }}>
            {pct}%
          </p>
          <p className="mt-3 text-sm" style={{ color: '#4a6a50' }}>
            {totalCorrect} out of {totalItems} items correct
          </p>
        </div>

        {/* Per-question breakdown */}
        <div className="flex flex-col gap-3 mb-10">
          {questions.map((q, i) => {
            const c = q.content as any
            const correct = c.answers as string[]
            const userAnswers = allAnswers[i] ?? []
            return (
              <div
                key={q.id}
                className="rounded-2xl p-4"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(206,241,123,0.1)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <p className="text-sm font-semibold mb-3" style={{ color: '#ffffff' }}>
                  {i + 1}. {c.question}
                </p>
                <div className="flex flex-wrap gap-2">
                  {correct.map((ans, j) => {
                    const matched = userAnswers.some(u => u.toLowerCase() === ans.toLowerCase())
                    return (
                      <span
                        key={j}
                        className="text-xs px-3 py-1 rounded-full font-semibold"
                        style={
                          matched
                            ? { background: 'rgba(206,241,123,0.15)', color: '#CEF17B' }
                            : { background: 'rgba(8,71,52,0.4)', color: '#5db88a' }
                        }
                      >
                        {ans}
                      </span>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => { setIndex(0); setAllAnswers([]); setChips([]); setChipInput(''); setShowResults(false) }}
            className="rounded-xl px-6 py-3 font-semibold text-sm transition-all hover:brightness-110 hover:-translate-y-0.5"
            style={{
              background: 'rgba(206,241,123,0.08)',
              color: '#CDEDB3',
              border: '1px solid rgba(206,241,123,0.15)',
            }}
          >
            Study Again
          </button>
          <Link
            href={`/sets/${setId}`}
            className="rounded-xl px-6 py-3 font-semibold text-sm transition-all hover:brightness-110 hover:-translate-y-0.5"
            style={{
              background: 'rgba(206,241,123,0.08)',
              color: '#CDEDB3',
              border: '1px solid rgba(206,241,123,0.15)',
            }}
          >
            Back to Set
          </Link>
          <Link
            href="/progress"
            className="rounded-xl px-6 py-3 font-semibold text-sm transition-all hover:brightness-110 hover:-translate-y-0.5"
            style={{
              background: '#CEF17B',
              color: '#084734',
              boxShadow: '0 4px 20px rgba(206,241,123,0.25)',
            }}
          >
            View Progress
          </Link>
        </div>

      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">

      {/* Top bar */}
      <div
        className="px-6 py-4 flex items-center justify-between"
        style={{ borderBottom: '1px solid rgba(206,241,123,0.08)' }}
      >
        <Link
          href={`/sets/${setId}`}
          className="flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-70"
          style={{ color: '#4a6a50' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          {setTitle}
        </Link>

        <span className="text-sm font-semibold" style={{ color: '#3a5a40' }}>
          {index + 1} / {questions.length}
        </span>

        {/* Progress bar */}
        <div
          className="w-28 h-1.5 rounded-full overflow-hidden"
          style={{ background: 'rgba(206,241,123,0.1)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #084734, #CEF17B)' }}
          />
        </div>
      </div>

      {/* Question area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-2xl mx-auto w-full">

        <p className="text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: '#3a5a40' }}>
          Enumeration
        </p>

        <h2
          className="text-2xl font-black text-center mb-8 leading-snug tracking-tight"
          style={{ color: '#ffffff' }}
        >
          {content.question}
        </h2>

        {/* Chips */}
        {chips.length > 0 && (
          <div
            className="w-full flex flex-wrap gap-2 mb-4 p-4 rounded-2xl"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(206,241,123,0.1)',
            }}
          >
            {chips.map((chip, i) => (
              <span
                key={i}
                className="flex items-center gap-2 text-sm px-3 py-1 rounded-full font-semibold"
                style={{ background: 'rgba(206,241,123,0.12)', color: '#CEF17B' }}
              >
                {chip}
                <button
                  onClick={() => removeChip(i)}
                  className="transition-opacity hover:opacity-60 leading-none"
                  style={{ color: '#CEF17B' }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Input row */}
        <div className="w-full flex gap-3 mb-6">
          <input
            type="text"
            value={chipInput}
            onChange={e => setChipInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addChip()}
            placeholder="Type an item and press Enter..."
            autoFocus
            className="flex-1 rounded-2xl px-6 py-4 text-sm font-medium placeholder:font-normal transition-all duration-200 focus:outline-none"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(206,241,123,0.1)',
              color: '#ffffff',
              // placeholder color via Tailwind's placeholder: above; override inline isn't possible, but the class handles it
            }}
            onFocus={e => (e.target.style.borderColor = 'rgba(206,241,123,0.35)')}
            onBlur={e => (e.target.style.borderColor = 'rgba(206,241,123,0.1)')}
          />
          <button
            onClick={addChip}
            disabled={!chipInput.trim()}
            className="w-14 rounded-2xl text-xl font-black flex items-center justify-center transition-all duration-200 disabled:opacity-30 hover:brightness-110"
            style={{
              background: 'rgba(206,241,123,0.1)',
              color: '#CEF17B',
              border: '1px solid rgba(206,241,123,0.15)',
            }}
          >
            +
          </button>
        </div>

        {/* Submit */}
        <button
          onClick={submit}
          className="rounded-xl px-10 py-3 font-bold text-sm transition-all hover:brightness-110 hover:-translate-y-0.5"
          style={{
            background: '#CEF17B',
            color: '#084734',
            boxShadow: '0 4px 20px rgba(206,241,123,0.25)',
          }}
        >
          {index === questions.length - 1 ? 'See Results →' : 'Submit & Next →'}
        </button>

      </div>
    </div>
  )
}