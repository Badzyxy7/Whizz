'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  X,
  Upload,
  FileText,
  Zap,
  Check,
  Trash2,
  Pencil,
  RotateCcw,
  Save,
} from 'lucide-react'

const MODES = [
  { id: 'flashcards',      label: 'Flashcards',      bg: 'rgba(206,241,123,0.12)', color: '#CEF17B',  border: 'rgba(206,241,123,0.25)' },
  { id: 'multiple_choice', label: 'Multiple Choice',  bg: 'rgba(205,237,179,0.12)', color: '#CDEDB3',  border: 'rgba(205,237,179,0.25)' },
  { id: 'identification',  label: 'Identification',   bg: 'rgba(8,71,52,0.4)',      color: '#5db88a',  border: 'rgba(93,184,138,0.3)'   },
  { id: 'enumeration',     label: 'Enumeration',      bg: 'rgba(206,241,123,0.08)', color: '#a8d96a',  border: 'rgba(168,217,106,0.25)' },
]

export default function CreateSetModal({ onClose }: { onClose: () => void }) {
  const router   = useRouter()
  const fileRef  = useRef<HTMLInputElement>(null)

  const [title,         setTitle]         = useState('')
  const [selectedModes, setSelectedModes] = useState<string[]>(['flashcards'])
  const [file,          setFile]          = useState<File | null>(null)
  const [loading,       setLoading]       = useState(false)
  const [error,         setError]         = useState('')
  const [step,          setStep]          = useState<'form' | 'generating' | 'review'>('form')
  const [generated,     setGenerated]     = useState<Record<string, any[]>>({})
  const [setId,         setSetId]         = useState<string | null>(null)
  const [dragOver,      setDragOver]      = useState(false)

  function toggleMode(id: string) {
    setSelectedModes(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    )
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped && (dropped.name.endsWith('.pdf') || dropped.name.endsWith('.docx'))) {
      setFile(dropped)
    }
  }

  async function handleGenerate() {
    if (!title.trim())           return setError('Please enter a title.')
    if (selectedModes.length === 0) return setError('Select at least one mode.')
    if (!file)                   return setError('Please upload a file.')
    if (file.size > 10 * 1024 * 1024) return setError('File must be under 10MB.')

    setError('')
    setLoading(true)
    setStep('generating')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('title', title)
      formData.append('modes', JSON.stringify(selectedModes))

      const res  = await fetch('/api/generate', { method: 'POST', body: formData })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Generation failed')

      setGenerated(data.questions)
      setSetId(data.setId)
      setStep('review')
    } catch (err: any) {
      setError(err.message)
      setStep('form')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!setId) return
    setLoading(true)
    try {
      const res = await fetch('/api/save-set', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ setId, questions: generated }),
      })
      if (!res.ok) throw new Error('Failed to save')
      router.push(`/sets/${setId}`)
      onClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function updateQuestion(mode: string, index: number, updated: any) {
    setGenerated(prev => ({
      ...prev,
      [mode]: prev[mode].map((q, i) => i === index ? updated : q),
    }))
  }

  function deleteQuestion(mode: string, index: number) {
    setGenerated(prev => ({
      ...prev,
      [mode]: prev[mode].filter((_, i) => i !== index),
    }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 backdrop-blur-sm"
        style={{ background: 'rgba(0,0,0,0.75)' }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl"
        style={{
          background: '#111111',
          border: '1px solid rgba(206,241,123,0.12)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(206,241,123,0.05)',
        }}
      >
        {/* Ambient glow top-right */}
        <div
          className="absolute top-0 right-0 w-72 h-72 pointer-events-none rounded-3xl overflow-hidden"
          style={{
            background: 'radial-gradient(circle at top right, rgba(8,71,52,0.35), transparent 70%)',
          }}
        />

        <div className="relative p-8">

          {/* ── Header ── */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: '#CEF17B' }}
              >
                {step === 'review'
                  ? <Check size={16} color="#084734" strokeWidth={2.5} />
                  : <Zap  size={16} color="#084734" strokeWidth={2.5} />
                }
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight" style={{ color: '#ffffff' }}>
                  {step === 'review' ? 'Review Questions' : 'Create Study Set'}
                </h2>
                <p className="text-xs" style={{ color: '#3a5a40' }}>
                  {step === 'review' ? 'Edit or delete before saving' : 'Upload a file and choose your modes'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-white/10"
              style={{ color: '#3a5a40' }}
            >
              <X size={16} strokeWidth={2} />
            </button>
          </div>

          {/* ── Generating state ── */}
          {step === 'generating' && (
            <div className="flex flex-col items-center gap-6 py-16">
              <div
                className="w-16 h-16 rounded-full border-4 animate-spin"
                style={{ borderColor: 'rgba(206,241,123,0.2)', borderTopColor: '#CEF17B' }}
              />
              <div className="text-center">
                <p className="font-bold text-base mb-1" style={{ color: '#ffffff' }}>
                  Generating your study set...
                </p>
                <p className="text-sm" style={{ color: '#3a5a40' }}>
                  Whizz is reading your file and crafting questions
                </p>
              </div>
            </div>
          )}

          {/* ── Form ── */}
          {step === 'form' && (
            <div className="flex flex-col gap-6">

              {/* Title */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#3a5a40' }}>
                  Study Set Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Anatomy Chapter 4"
                  className="rounded-xl px-4 py-3 text-sm focus:outline-none transition-all duration-200"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(206,241,123,0.12)',
                    color: '#ffffff',
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = 'rgba(206,241,123,0.35)'}
                  onBlur={e  => e.currentTarget.style.borderColor = 'rgba(206,241,123,0.12)'}
                />
              </div>

              {/* Modes */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#3a5a40' }}>
                  Study Modes
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {MODES.map(mode => {
                    const active = selectedModes.includes(mode.id)
                    return (
                      <button
                        key={mode.id}
                        onClick={() => toggleMode(mode.id)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200"
                        style={{
                          background: active ? mode.bg : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${active ? mode.border : 'rgba(206,241,123,0.08)'}`,
                          color: active ? mode.color : '#3a5a40',
                        }}
                      >
                        {/* Checkbox */}
                        <div
                          className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all"
                          style={{
                            background: active ? mode.color : 'transparent',
                            border: `1.5px solid ${active ? mode.color : '#3a5a40'}`,
                          }}
                        >
                          {active && <Check size={10} color="#084734" strokeWidth={3} />}
                        </div>
                        {mode.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* File upload */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#3a5a40' }}>
                  Upload File
                </label>
                <div
                  onClick={() => fileRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  className="rounded-2xl p-8 flex flex-col items-center gap-3 cursor-pointer transition-all duration-200"
                  style={{
                    border: `2px dashed ${file ? 'rgba(206,241,123,0.4)' : dragOver ? 'rgba(206,241,123,0.35)' : 'rgba(206,241,123,0.12)'}`,
                    background: file ? 'rgba(206,241,123,0.05)' : dragOver ? 'rgba(206,241,123,0.04)' : 'rgba(255,255,255,0.02)',
                  }}
                >
                  {file ? (
                    <>
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ background: 'rgba(206,241,123,0.12)' }}
                      >
                        <FileText size={22} color="#CEF17B" strokeWidth={1.8} />
                      </div>
                      <p className="text-sm font-semibold" style={{ color: '#CEF17B' }}>{file.name}</p>
                      <p className="text-xs" style={{ color: '#3a5a40' }}>
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <button
                        onClick={e => { e.stopPropagation(); setFile(null) }}
                        className="text-xs px-3 py-1 rounded-lg transition-all hover:bg-white/10"
                        style={{ color: '#3a5a40' }}
                      >
                        Remove file
                      </button>
                    </>
                  ) : (
                    <>
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ background: 'rgba(206,241,123,0.06)' }}
                      >
                        <Upload size={22} color="#3a5a40" strokeWidth={1.8} />
                      </div>
                      <div className="text-center">
                        <p className="text-sm" style={{ color: '#6a8a70' }}>
                          Drag & drop or{' '}
                          <span style={{ color: '#CEF17B', fontWeight: 600 }}>browse</span>
                        </p>
                        <p className="text-xs mt-1" style={{ color: '#3a5a40' }}>PDF or DOCX · Max 10MB</p>
                      </div>
                    </>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".pdf,.docx"
                    className="hidden"
                    onChange={e => setFile(e.target.files?.[0] ?? null)}
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <div
                  className="px-4 py-3 rounded-xl text-sm"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}
                >
                  {error}
                </div>
              )}

              {/* Generate CTA */}
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 font-bold rounded-xl py-3.5 text-sm transition-all hover:brightness-110 disabled:opacity-50"
                style={{ background: '#CEF17B', color: '#084734', boxShadow: '0 4px 20px rgba(206,241,123,0.2)' }}
              >
                <Zap size={15} strokeWidth={2.5} />
                Generate Study Set
              </button>
            </div>
          )}

          {/* ── Review ── */}
          {step === 'review' && (
            <div className="flex flex-col gap-6">
              {Object.entries(generated).map(([mode, questions]) => (
                <div key={mode}>
                  {/* Section header */}
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className="text-[0.65rem] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md"
                      style={{ background: 'rgba(206,241,123,0.1)', color: '#CEF17B' }}
                    >
                      {mode.replace('_', ' ')}
                    </span>
                    <span className="text-xs" style={{ color: '#3a5a40' }}>
                      {questions.length} question{questions.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2">
                    {questions.map((q, i) => (
                      <ReviewQuestion
                        key={i}
                        mode={mode}
                        question={q}
                        index={i}
                        onUpdate={updated => updateQuestion(mode, i, updated)}
                        onDelete={() => deleteQuestion(mode, i)}
                      />
                    ))}
                  </div>
                </div>
              ))}

              {/* Error */}
              {error && (
                <div
                  className="px-4 py-3 rounded-xl text-sm"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}
                >
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setStep('form')}
                  className="flex-1 flex items-center justify-center gap-2 font-semibold rounded-xl py-3 text-sm transition-all hover:bg-white/5"
                  style={{ border: '1px solid rgba(206,241,123,0.15)', color: '#CDEDB3' }}
                >
                  <RotateCcw size={14} strokeWidth={2} />
                  Regenerate
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 font-bold rounded-xl py-3 text-sm transition-all hover:brightness-110 disabled:opacity-50"
                  style={{ background: '#CEF17B', color: '#084734', boxShadow: '0 4px 20px rgba(206,241,123,0.2)' }}
                >
                  <Save size={14} strokeWidth={2.5} />
                  {loading ? 'Saving...' : 'Save Study Set'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

function ReviewQuestion({ mode, question, index, onUpdate, onDelete }: {
  mode: string
  question: any
  index: number
  onUpdate: (q: any) => void
  onDelete: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft,   setDraft]   = useState(question)

  function save() { onUpdate(draft); setEditing(false) }

  const label = mode === 'flashcards' ? question.front : question.question

  const inputStyle = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(206,241,123,0.12)',
    color: '#ffffff',
    borderRadius: '10px',
    padding: '8px 12px',
    fontSize: '0.8rem',
    outline: 'none',
    width: '100%',
  }

  return (
    <div
      className="rounded-xl p-4 transition-all"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(206,241,123,0.08)',
      }}
    >
      {!editing ? (
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm flex-1 leading-relaxed" style={{ color: '#CDEDB3' }}>
            <span style={{ color: '#3a5a40', marginRight: '6px', fontSize: '0.7rem', fontWeight: 700 }}>
              {String(index + 1).padStart(2, '0')}
            </span>
            {label}
          </p>
          <div className="flex gap-1 shrink-0">
            <button
              onClick={() => setEditing(true)}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:bg-white/10"
              style={{ color: '#3a5a40' }}
            >
              <Pencil size={12} strokeWidth={2} />
            </button>
            <button
              onClick={onDelete}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:bg-red-500/10"
              style={{ color: '#3a5a40' }}
            >
              <Trash2 size={12} strokeWidth={2} />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {mode === 'flashcards' && (
            <>
              <input
                value={draft.front}
                onChange={e => setDraft({ ...draft, front: e.target.value })}
                style={inputStyle}
                placeholder="Front"
              />
              <input
                value={draft.back}
                onChange={e => setDraft({ ...draft, back: e.target.value })}
                style={inputStyle}
                placeholder="Back"
              />
            </>
          )}
          {(mode === 'multiple_choice' || mode === 'identification' || mode === 'enumeration') && (
            <input
              value={draft.question}
              onChange={e => setDraft({ ...draft, question: e.target.value })}
              style={inputStyle}
              placeholder="Question"
            />
          )}
          <div className="flex gap-2 justify-end mt-1">
            <button
              onClick={() => setEditing(false)}
              className="text-xs px-3 py-1.5 rounded-lg transition-all hover:bg-white/10"
              style={{ color: '#3a5a40' }}
            >
              Cancel
            </button>
            <button
              onClick={save}
              className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-all hover:brightness-110"
              style={{ background: '#CEF17B', color: '#084734' }}
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  )
}