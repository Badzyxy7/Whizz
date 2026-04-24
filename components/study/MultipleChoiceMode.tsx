'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import type { Question } from '@/lib/types'

export default function MultipleChoiceMode({ questions, setId, setTitle }: { questions: Question[]; setId: string; setTitle: string }) {
  const supabase = createClient()
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [startTime] = useState(Date.now())

  const q = questions[index]
  const content = q?.content as any
  const progress = ((index + 1) / questions.length) * 100

  function selectAnswer(choice: string) {
    if (selected) return
    const letter = choice.charAt(0)
    setSelected(letter)
  }

  function next() {
    const letter = selected ?? ''
    const newAnswers = [...answers, letter]
    setAnswers(newAnswers)
    setSelected(null)
    if (index < questions.length - 1) setIndex(i => i + 1)
    else finishSession(newAnswers)
  }

  async function finishSession(finalAnswers: string[]) {
    const score = questions.reduce((acc, q, i) => {
      const c = q.content as any
      return acc + (finalAnswers[i] === c.answer ? 1 : 0)
    }, 0)
    const duration = Math.round((Date.now() - startTime) / 1000)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('sessions').insert({
        user_id: user.id, set_id: setId, mode: 'multiple_choice',
        score, total: questions.length, duration_seconds: duration
      })
    }
    setShowResults(true)
  }

  if (showResults) {
    const score = questions.reduce((acc, q, i) => {
      const c = q.content as any
      return acc + (answers[i] === c.answer ? 1 : 0)
    }, 0)
    return <ResultsScreen score={score} total={questions.length} questions={questions} answers={answers} setId={setId} onRetry={() => { setIndex(0); setAnswers([]); setSelected(null); setShowResults(false) }} />
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="px-8 py-5 flex items-center justify-between border-b border-white/8">
        <Link href={`/sets/${setId}`} className="text-zinc-400 hover:text-white transition-colors text-sm flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          {setTitle}
        </Link>
        <span className="text-sm font-medium text-zinc-300">{index + 1} / {questions.length}</span>
        <div className="w-32 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-sky-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-2xl mx-auto w-full">
        <p className="text-xs text-zinc-600 uppercase tracking-widest mb-6">Multiple Choice</p>
        <h2 className="text-2xl font-bold text-center mb-10">{content.question}</h2>

        <div className="w-full flex flex-col gap-3 mb-8">
          {content.choices?.map((choice: string) => {
            const letter = choice.charAt(0)
            const isSelected = selected === letter
            return (
              <button key={choice} onClick={() => selectAnswer(choice)}
                className={`w-full text-left px-5 py-4 rounded-2xl border font-medium text-sm transition-all duration-200 ${
                  isSelected ? 'bg-sky-500/20 border-sky-500/50 text-sky-200' : 'bg-[#141414] border-white/8 text-zinc-300 hover:border-white/20 hover:bg-[#1c1c1c]'
                }`}>
                {choice}
              </button>
            )
          })}
        </div>

        <button onClick={next} disabled={!selected}
          className="bg-violet-500 text-white font-semibold rounded-full px-10 py-3 hover:bg-violet-400 transition-all duration-200 disabled:opacity-30">
          {index === questions.length - 1 ? 'See Results →' : 'Next →'}
        </button>
      </div>
    </div>
  )
}

function ResultsScreen({ score, total, questions, answers, setId, onRetry }: {
  score: number; total: number; questions: Question[]; answers: string[]; setId: string; onRetry: () => void
}) {
  const pct = Math.round((score / total) * 100)
  const color = pct >= 70 ? 'text-green-400' : pct >= 50 ? 'text-yellow-400' : 'text-red-400'

  return (
    <div className="min-h-screen px-8 py-10 max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <p className="text-zinc-400 text-sm mb-2">Your Score</p>
        <p className={`text-7xl font-black ${color}`}>{pct}%</p>
        <p className="text-zinc-400 mt-2">{score} out of {total} correct</p>
      </div>

      <div className="flex flex-col gap-3 mb-10">
        {questions.map((q, i) => {
          const c = q.content as any
          const isCorrect = answers[i] === c.answer
          return (
            <div key={q.id} className={`bg-[#141414] border rounded-xl p-4 ${isCorrect ? 'border-green-500/20' : 'border-red-500/20'}`}>
              <p className="text-sm font-medium mb-2">{i + 1}. {c.question}</p>
              <div className="flex gap-4 text-xs">
                <span className={isCorrect ? 'text-green-400' : 'text-red-400'}>Your answer: {answers[i] || '—'}</span>
                {!isCorrect && <span className="text-green-400">Correct: {c.answer}</span>}
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex gap-3 justify-center">
        <button onClick={onRetry} className="border border-white/20 text-white rounded-full px-6 py-3 font-semibold hover:bg-white/10 transition-all duration-200">Study Again</button>
        <Link href={`/sets/${setId}`} className="bg-white/10 text-white rounded-full px-6 py-3 font-semibold hover:bg-white/20 transition-all duration-200">Back to Set</Link>
        <Link href="/progress" className="bg-violet-500 text-white rounded-full px-6 py-3 font-semibold hover:bg-violet-400 transition-all duration-200">Go to Progress</Link>
      </div>
    </div>
  )
}