'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Question } from '@/lib/types'

export default function FlashcardMode({ questions, setId, setTitle }: { questions: Question[]; setId: string; setTitle: string }) {
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [finished, setFinished] = useState(false)

  const card = questions[index]
  const content = card?.content as any
  const progress = ((index + 1) / questions.length) * 100

  function next() {
    if (index < questions.length - 1) { setIndex(i => i + 1); setFlipped(false) }
    else setFinished(true)
  }
  function prev() { if (index > 0) { setIndex(i => i - 1); setFlipped(false) } }

  if (finished) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-8 px-6">
        <div className="text-6xl">🎉</div>
        <div className="text-center">
          <h2 className="text-3xl font-black mb-2">All done!</h2>
          <p className="text-zinc-400">You reviewed all {questions.length} flashcards.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { setIndex(0); setFlipped(false); setFinished(false) }}
            className="border border-white/20 text-white rounded-full px-6 py-3 font-semibold hover:bg-white/10 transition-all duration-200">
            Study Again
          </button>
          <Link href={`/sets/${setId}`}
            className="bg-violet-500 text-white rounded-full px-6 py-3 font-semibold hover:bg-violet-400 transition-all duration-200">
            Back to Set
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <div className="px-8 py-5 flex items-center justify-between border-b border-white/8">
        <Link href={`/sets/${setId}`} className="text-zinc-400 hover:text-white transition-colors text-sm flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          {setTitle}
        </Link>
        <span className="text-zinc-400 text-sm">Card {index + 1} of {questions.length}</span>
        <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-violet-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Card */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8">
        <p className="text-zinc-500 text-sm">Click the card to flip it</p>

        <div className="card-flip w-full max-w-2xl h-72 cursor-pointer" onClick={() => setFlipped(f => !f)}>
          <div className={`card-inner ${flipped ? 'flipped' : ''}`}>
            <div className="card-front bg-[#141414] border border-white/8 rounded-3xl flex flex-col items-center justify-center p-10 hover:border-violet-500/30 transition-all duration-200">
              <p className="text-xs text-zinc-600 uppercase tracking-widest mb-4">Front</p>
              <p className="text-2xl font-bold text-center">{content.front}</p>
            </div>
            <div className="card-back bg-[#1c1c1c] border border-violet-500/30 rounded-3xl flex flex-col items-center justify-center p-10">
              <p className="text-xs text-violet-400 uppercase tracking-widest mb-4">Back</p>
              <p className="text-2xl font-bold text-center text-violet-200">{content.back}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-4">
          <button onClick={prev} disabled={index === 0}
            className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all duration-200 disabled:opacity-30">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button onClick={next}
            className="bg-violet-500 text-white font-semibold rounded-full px-8 py-3 hover:bg-violet-400 transition-all duration-200">
            {index === questions.length - 1 ? 'Finish ✓' : 'Next →'}
          </button>
          <button onClick={prev} disabled={index === 0} className="w-12 h-12 opacity-0 pointer-events-none" />
        </div>
      </div>
    </div>
  )
}