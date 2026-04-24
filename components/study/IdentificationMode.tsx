'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import type { Question } from '@/lib/types'

export default function IdentificationMode({ questions, setId, setTitle }: { questions: Question[]; setId: string; setTitle: string }) {
  const supabase = createClient()
  const [index, setIndex] = useState(0)
  const [input, setInput] = useState('')
  const [answers, setAnswers] = useState<string[]>([])
  const [showResults, setShowResults] = useState(false)
  const [startTime] = useState(Date.now())

  const q = questions[index]
  const content = q?.content as any
  const progress = ((index + 1) / questions.length) * 100

  function next() {
    const newAnswers = [...answers, input.trim()]
    setAnswers(newAnswers)
    setInput('')
    if (index < questions.length - 1) setIndex(i => i + 1)
    else finishSession(newAnswers)
  }

  async function finishSession(finalAnswers: string[]) {
    const score = questions.reduce((acc, q, i) => {
      const c = q.content as any
      return acc + (finalAnswers[i]?.toLowerCase() === c.answer?.toLowerCase() ? 1 : 0)
    }, 0)
    const duration = Math.round((Date.now() - startTime) / 1000)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('sessions').insert({
        user_id: user.id, set_id: setId, mode: 'identification',
        score, total: questions.length, duration_seconds: duration
      })
    }
    setShowResults(true)
  }

  if (showResults) {
    const score = questions.reduce((acc, q, i) => {
      const c = q.content as any
      return acc + (answers[i]?.toLowerCase() === c.answer?.toLowerCase() ? 1 : 0)
    }, 0)
    return (
      <div className="min-h-screen px-8 py-10 max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-zinc-400 text-sm mb-2">Your Score</p>
          <p className={`text-7xl font-black ${score / questions.length >= 0.7 ? 'text-green-400' : score / questions.length >= 0.5 ? 'text-yellow-400' : 'text-red-400'}`}>
            {Math.round((score / questions.length) * 100)}%
          </p>
          <p className="text-zinc-400 mt-2">{score} out of {questions.length} correct</p>
        </div>
        <div className="flex flex-col gap-3 mb-10">
          {questions.map((q, i) => {
            const c = q.content as any
            const isCorrect = answers[i]?.toLowerCase() === c.answer?.toLowerCase()
            return (
              <div key={q.id} className={`bg-[#141414] border rounded-xl p-4 ${isCorrect ? 'border-green-500/20' : 'border-red-500/20'}`}>
                <p className="text-sm font-medium mb-2">{i + 1}. {c.question}</p>
                <div className="flex gap-4 text-xs flex-wrap">
                  <span className={isCorrect ? 'text-green-400' : 'text-red-400'}>Your answer: {answers[i] || '—'}</span>
                  {!isCorrect && <span className="text-green-400">Correct: {c.answer}</span>}
                </div>
              </div>
            )
          })}
        </div>
        <div className="flex gap-3 justify-center">
          <button onClick={() => { setIndex(0); setAnswers([]); setInput(''); setShowResults(false) }} className="border border-white/20 text-white rounded-full px-6 py-3 font-semibold hover:bg-white/10 transition-all duration-200">Study Again</button>
          <Link href={`/sets/${setId}`} className="bg-white/10 text-white rounded-full px-6 py-3 font-semibold hover:bg-white/20 transition-all duration-200">Back to Set</Link>
          <Link href="/progress" className="bg-violet-500 text-white rounded-full px-6 py-3 font-semibold hover:bg-violet-400 transition-all duration-200">Go to Progress</Link>
        </div>
      </div>
    )
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
          <div className="h-full bg-pink-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-2xl mx-auto w-full">
        <p className="text-xs text-zinc-600 uppercase tracking-widest mb-6">Identification</p>
        <h2 className="text-2xl font-bold text-center mb-10">{content.question}</h2>

        <div className="w-full flex flex-col gap-4">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && input.trim() && next()}
            placeholder="Type your answer..."
            autoFocus
            className="w-full bg-[#141414] border border-white/10 rounded-2xl px-6 py-4 text-white text-lg placeholder:text-zinc-600 focus:outline-none focus:border-pink-500/50 transition-all duration-200"
          />
          <button onClick={next} disabled={!input.trim()}
            className="bg-violet-500 text-white font-semibold rounded-full px-10 py-3 hover:bg-violet-400 transition-all duration-200 disabled:opacity-30">
            {index === questions.length - 1 ? 'See Results →' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  )
}