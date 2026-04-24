'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

interface Props {
  studySet: any
  questions: any[]
  mode: string
}

export default function StudyClient({ studySet, questions, mode }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [current, setCurrent] = useState(0)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [flipped, setFlipped] = useState(false)
  const [startTime] = useState(Date.now())

  const question = questions[current]
  const progress = (current / questions.length) * 100

  async function saveSession(finalScore: number) {
    const duration = Math.round((Date.now() - startTime) / 1000)
    await supabase.from('sessions').insert({
      set_id: studySet.id,
      mode,
      score: finalScore,
      total: questions.length,
      duration_seconds: duration,
    })
  }

  function next(correct: boolean) {
    const newScore = correct ? score + 1 : score
    if (current + 1 >= questions.length) {
      setScore(newScore)
      setFinished(true)
      saveSession(newScore)
    } else {
      setScore(newScore)
      setCurrent(c => c + 1)
      setSelected(null)
      setInput('')
      setFlipped(false)
    }
  }

  if (finished) {
    const pct = Math.round((score / questions.length) * 100)
    const emoji = pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '💪'

    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-6">
        <div
          className="rounded-3xl p-12 max-w-md w-full text-center flex flex-col items-center gap-6"
          style={{
            background: 'var(--color-card)',
            border: '1px solid var(--color-border)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div className="text-6xl">{emoji}</div>
          <h1
            className="text-3xl font-black tracking-tight"
            style={{ color: 'var(--color-text)' }}
          >
            Session Complete!
          </h1>

          {/* Score ring */}
          <div
            className="w-28 h-28 rounded-full flex items-center justify-center"
            style={{
              border: '4px solid var(--color-accent)',
              boxShadow: 'var(--color-shadow)',
            }}
          >
            <span className="text-3xl font-black" style={{ color: 'var(--color-accent)' }}>
              {pct}%
            </span>
          </div>

          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            {score} of {questions.length} correct
          </p>

          <div className="flex gap-3 w-full">
            <button
              onClick={() => {
                setCurrent(0); setScore(0); setFinished(false)
                setSelected(null); setFlipped(false); setInput('')
              }}
              className="flex-1 rounded-xl py-3 text-sm font-semibold transition-all hover:brightness-110"
              style={{
                background: 'var(--color-accent-dim)',
                color: 'var(--color-text)',
                border: '1px solid var(--color-border)',
              }}
            >
              Try Again
            </button>
            <button
              onClick={() => router.push(`/sets/${studySet.id}`)}
              className="flex-1 rounded-xl py-3 text-sm font-semibold transition-all hover:brightness-110"
              style={{
                background: 'var(--color-accent)',
                color: 'var(--color-accent-text)',
                boxShadow: '0 4px 20px var(--color-shadow)',
              }}
            >
              Back to Set
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => router.push(`/sets/${studySet.id}`)}
          className="flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-70"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back
        </button>
        <span className="text-sm font-semibold" style={{ color: 'var(--color-text-sub)' }}>
          {current + 1} / {questions.length}
        </span>
      </div>

      {/* Progress bar */}
      <div
        className="w-full h-1.5 rounded-full mb-10 overflow-hidden"
        style={{ background: 'var(--color-accent-dim)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${progress}%`, background: 'var(--color-accent)' }}
        />
      </div>

      {/* ── Flashcard mode ── */}
      {mode === 'flashcards' && (
        <div
          onClick={() => setFlipped(f => !f)}
          className="cursor-pointer w-full h-72 mb-8"
          style={{ perspective: '1000px' }}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
              transformStyle: 'preserve-3d',
              transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            {/* Front */}
            <div
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                background: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                backdropFilter: 'blur(12px)',
              }}
              className="absolute inset-0 rounded-3xl flex flex-col items-center justify-center p-10"
            >
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-4"
                style={{ color: 'var(--color-text-sub)' }}
              >
                Term
              </p>
              <p className="text-2xl font-black text-center tracking-tight" style={{ color: 'var(--color-text)' }}>
                {question.content.front}
              </p>
              <p className="text-xs mt-6" style={{ color: 'var(--color-text-sub)' }}>
                Click to flip
              </p>
            </div>

            {/* Back */}
            <div
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
                background: 'var(--color-accent-dim)',
                border: '1px solid var(--color-border-hover)',
                backdropFilter: 'blur(12px)',
              }}
              className="absolute inset-0 rounded-3xl flex flex-col items-center justify-center p-10"
            >
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-4"
                style={{ color: 'var(--color-accent)' }}
              >
                Definition
              </p>
              <p className="text-xl text-center font-medium" style={{ color: 'var(--color-text)' }}>
                {question.content.back}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Multiple choice mode ── */}
      {mode === 'multiple_choice' && (
        <div className="flex flex-col gap-4">
          <h2
            className="text-xl font-black mb-2 tracking-tight"
            style={{ color: 'var(--color-text)' }}
          >
            {question.content.question}
          </h2>
          {question.content.choices.map((choice: string) => {
            const isSelected = selected === choice
            const isCorrect = choice.startsWith(question.content.answer)

            let cardStyle: React.CSSProperties = {
              background: 'var(--color-card)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
            }
            if (selected) {
              if (isCorrect) {
                cardStyle = {
                  background: 'var(--color-accent-dim)',
                  border: '1px solid var(--color-border-hover)',
                  color: 'var(--color-accent)',
                }
              } else if (isSelected) {
                cardStyle = {
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-muted)',
                  opacity: 0.7,
                }
              } else {
                cardStyle = {
                  background: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-sub)',
                  opacity: 0.5,
                }
              }
            }

            return (
              <button
                key={choice}
                disabled={!!selected}
                onClick={() => { setSelected(choice); setTimeout(() => next(isCorrect), 800) }}
                className="w-full text-left rounded-2xl px-6 py-4 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5"
                style={cardStyle}
              >
                {choice}
              </button>
            )
          })}
        </div>
      )}

      {/* ── Identification mode ── */}
      {mode === 'identification' && (
        <div className="flex flex-col gap-6">
          <h2
            className="text-xl font-black tracking-tight"
            style={{ color: 'var(--color-text)' }}
          >
            {question.content.question}
          </h2>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && input.trim()) {
                const correct = input.trim().toLowerCase() === question.content.answer.toLowerCase()
                next(correct)
              }
            }}
            placeholder="Type your answer..."
            className="rounded-2xl px-6 py-4 text-sm font-medium transition-all duration-200 focus:outline-none"
            style={{
              background: 'var(--color-card)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
            }}
            onFocus={e => (e.target.style.borderColor = 'var(--color-border-hover)')}
            onBlur={e => (e.target.style.borderColor = 'var(--color-border)')}
          />
          <button
            disabled={!input.trim()}
            onClick={() => {
              const correct = input.trim().toLowerCase() === question.content.answer.toLowerCase()
              next(correct)
            }}
            className="rounded-xl py-3 font-bold text-sm transition-all hover:brightness-110 hover:-translate-y-0.5 disabled:opacity-30"
            style={{
              background: 'var(--color-accent)',
              color: 'var(--color-accent-text)',
              boxShadow: '0 4px 20px var(--color-shadow)',
            }}
          >
            Submit
          </button>
        </div>
      )}

      {/* ── Enumeration mode ── */}
      {mode === 'enumeration' && (
        <div className="flex flex-col gap-6">
          <h2
            className="text-xl font-black tracking-tight"
            style={{ color: 'var(--color-text)' }}
          >
            {question.content.question}
          </h2>
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-sub)' }}>
            {question.content.answers.length} items required
          </p>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type each item on a new line..."
            rows={6}
            className="rounded-2xl px-6 py-4 text-sm font-medium transition-all duration-200 focus:outline-none resize-none"
            style={{
              background: 'var(--color-card)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
            }}
            onFocus={e => (e.target.style.borderColor = 'var(--color-border-hover)')}
            onBlur={e => (e.target.style.borderColor = 'var(--color-border)')}
          />
          <button
            disabled={!input.trim()}
            onClick={() => {
              const userAnswers = input.split('\n').map(a => a.trim().toLowerCase()).filter(Boolean)
              const correctAnswers = question.content.answers.map((a: string) => a.toLowerCase())
              const matches = userAnswers.filter(a => correctAnswers.includes(a)).length
              const correct = matches >= Math.ceil(correctAnswers.length * 0.7)
              next(correct)
            }}
            className="rounded-xl py-3 font-bold text-sm transition-all hover:brightness-110 hover:-translate-y-0.5 disabled:opacity-30"
            style={{
              background: 'var(--color-accent)',
              color: 'var(--color-accent-text)',
              boxShadow: '0 4px 20px var(--color-shadow)',
            }}
          >
            Submit
          </button>
        </div>
      )}

      {/* ── Flashcard navigation ── */}
      {mode === 'flashcards' && (
        <div className="flex justify-center gap-3">
          <button
            onClick={() => next(false)}
            className="rounded-xl px-8 py-3 text-sm font-semibold transition-all hover:brightness-110"
            style={{
              background: 'var(--color-accent-dim)',
              color: 'var(--color-text)',
              border: '1px solid var(--color-border)',
            }}
          >
            Skip
          </button>
          <button
            onClick={() => next(true)}
            className="rounded-xl px-8 py-3 text-sm font-bold transition-all hover:brightness-110 hover:-translate-y-0.5"
            style={{
              background: 'var(--color-accent)',
              color: 'var(--color-accent-text)',
              boxShadow: '0 4px 20px var(--color-shadow)',
            }}
          >
            Got it ✓
          </button>
        </div>
      )}

    </div>
  )
}