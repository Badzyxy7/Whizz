'use client'

import { useState, useRef, useCallback } from 'react'
import { X, Upload, Trash2, Plus, ChevronLeft, ChevronRight, Save, Loader2, FileText } from 'lucide-react'

interface Props {
  onClose: () => void
  onSuccess: (setId: string) => void
}

const MODES = [
  { key: 'flashcards', label: 'Flashcards' },
  { key: 'multiplechoice', label: 'Multiple Choice' },
  { key: 'identification', label: 'Identification' },
  { key: 'enumeration', label: 'Enumeration' },
]

const MAX_FILES = 3

export default function CreateSetModal({ onClose, onSuccess }: Props) {
  const [step, setStep] = useState<'upload' | 'generating' | 'review'>('upload')
  const [title, setTitle] = useState('')
  const [modes, setModes] = useState<string[]>([])
  const [files, setFiles] = useState<File[]>([])
  const [mcQuestionCount, setMcQuestionCount] = useState<number>(10)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState('')
  const [questions, setQuestions] = useState<Record<string, any[]>>({})
  const [setId, setSetId] = useState('')
  const [reviewMode, setReviewMode] = useState('')
  const [reviewIndex, setReviewIndex] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = (incoming: FileList | null) => {
  if (!incoming) return
  const valid = Array.from(incoming).filter(
    f => f.name.endsWith('.pdf') || f.name.endsWith('.docx')
  )
  setFiles(prev => [...prev, ...valid].slice(0, MAX_FILES))
  setError('')
}

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const toggleMode = (key: string) => {
    setModes(prev =>
      prev.includes(key) ? prev.filter(m => m !== key) : [...prev, key]
    )
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => setIsDragging(false), [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }, [])

  const handleGenerate = async () => {
    if (!files.length || !title.trim() || !modes.length) return
    setError('')
    setStep('generating')

    try {
      const formData = new FormData()
      files.forEach(f => formData.append('files', f))
      formData.append('title', title.trim())
      formData.append('modes', JSON.stringify(modes))
      formData.append('mcQuestionCount', String(mcQuestionCount))

      const res = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong.')
        setStep('upload')
        return
      }

      setQuestions(data.questions)
      setSetId(data.setId)
      setReviewMode(modes[0])
      setReviewIndex(0)
      setStep('review')
    } catch (err: any) {
      setError(err.message || 'Something went wrong.')
      setStep('upload')
    }
  }

  const handleDeleteQuestion = (mode: string, index: number) => {
    setQuestions(prev => ({
      ...prev,
      [mode]: prev[mode].filter((_, i) => i !== index),
    }))
  }

  const handleEditQuestion = (mode: string, index: number, field: string, value: string) => {
    setQuestions(prev => {
      const updated = [...prev[mode]]
      updated[index] = { ...updated[index], [field]: value }
      return { ...prev, [mode]: updated }
    })
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/save-set', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ setId, questions }),
      })
      if (!res.ok) throw new Error('Failed to save')
      onSuccess(setId)
    } catch (err: any) {
      setError(err.message || 'Failed to save.')
    } finally {
      setIsSaving(false)
    }
  }

  const reviewModes = Object.keys(questions)
  const currentQuestions = questions[reviewMode] || []
  const currentQ = currentQuestions[reviewIndex]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl flex flex-col"
        style={{
          background: '#0e1a12',
          border: '1px solid rgba(206,241,123,0.18)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
          maxHeight: '90vh',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4" style={{ borderBottom: '1px solid rgba(206,241,123,0.08)' }}>
          <div>
            <h2 className="font-black text-lg" style={{ color: '#CEF17B', letterSpacing: '-0.02em' }}>
              {step === 'review' ? 'Review Questions' : 'Create Study Set'}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: '#3a5a40' }}>
              {step === 'review' ? 'Edit or delete before saving' : 'Upload files and choose your modes'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
            style={{ background: 'rgba(206,241,123,0.07)', color: '#CEF17B' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">

          {/* GENERATING STATE */}
          {step === 'generating' && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(206,241,123,0.1)' }}>
                <Loader2 size={28} color="#CEF17B" className="animate-spin" />
              </div>
              <p className="font-black text-lg" style={{ color: '#CEF17B' }}>Generating your study set...</p>
              <p className="text-sm text-center" style={{ color: '#3a5a40' }}>Whizz is reading your files and crafting questions</p>
            </div>
          )}

          {/* UPLOAD STATE */}
          {step === 'upload' && (
            <div className="flex flex-col gap-5">

              {/* Title */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest block mb-2" style={{ color: '#3a5a40' }}>
                  Study Set Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chapter 3 — Cell Biology"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all"
                  style={{
                    background: 'rgba(206,241,123,0.05)',
                    border: '1px solid rgba(206,241,123,0.15)',
                    color: '#ffffff',
                  }}
                />
              </div>

              {/* Modes */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest block mb-2" style={{ color: '#3a5a40' }}>
                  Study Modes
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {MODES.map(({ key, label }) => (
                    <div key={key}>
                      <button
                        onClick={() => toggleMode(key)}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                        style={{
                          background: modes.includes(key) ? 'rgba(206,241,123,0.12)' : 'rgba(206,241,123,0.04)',
                          border: modes.includes(key) ? '1px solid rgba(206,241,123,0.4)' : '1px solid rgba(206,241,123,0.1)',
                          color: modes.includes(key) ? '#CEF17B' : '#3a5a40',
                        }}
                      >
                        <div
                          className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                          style={{
                            background: modes.includes(key) ? '#CEF17B' : 'transparent',
                            border: modes.includes(key) ? 'none' : '1.5px solid rgba(206,241,123,0.3)',
                          }}
                        >
                          {modes.includes(key) && (
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                              <path d="M2 5l2.5 2.5L8 3" stroke="#084734" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                        {label}
                      </button>

                      {/* MC Question Count input */}
                      {key === 'multiplechoice' && modes.includes('multiplechoice') && (
                        <div className="flex items-center gap-2 mt-2 ml-1">
                          <span className="text-xs font-semibold" style={{ color: '#CEF17B' }}>How many questions?</span>
                         <input
                            type="number"
                            min={1}
                            max={50}
                            value={mcQuestionCount}
                            onChange={e => setMcQuestionCount(Number(e.target.value))}
                            onBlur={e => {
                              const val = Number(e.target.value)
                              if (!val || val < 1) setMcQuestionCount(1)
                              else if (val > 50) setMcQuestionCount(50)
                              else setMcQuestionCount(val)
                            }}
                            className="w-14 rounded-lg px-2 py-1 text-sm font-bold text-center outline-none"
                            style={{
                              background: 'rgba(206,241,123,0.08)',
                              border: '1px solid rgba(206,241,123,0.3)',
                              color: '#CEF17B',
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest block mb-2" style={{ color: '#3a5a40' }}>
                  Upload Files <span style={{ color: 'rgba(206,241,123,0.4)' }}>({files.length}/{MAX_FILES})</span>
                </label>

                {files.length < MAX_FILES && (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className="w-full rounded-xl flex flex-col items-center justify-center gap-2 py-8 cursor-pointer transition-all"
                    style={{
                      background: isDragging ? 'rgba(206,241,123,0.1)' : 'rgba(206,241,123,0.04)',
                      border: isDragging ? '1.5px dashed rgba(206,241,123,0.6)' : '1.5px dashed rgba(206,241,123,0.2)',
                    }}
                  >
                    <Upload size={22} color={isDragging ? '#CEF17B' : '#3a5a40'} />
                    <p className="text-sm font-semibold" style={{ color: isDragging ? '#CEF17B' : '#ffffff' }}>
                      Drag & drop or{' '}
                      <span style={{ color: '#CEF17B', textDecoration: 'underline' }}>browse</span>
                    </p>
                    <p className="text-xs" style={{ color: '#3a5a40' }}>
                      PDF or DOCX · Max {MAX_FILES} files · 10MB each
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.docx"
                      multiple
                      className="hidden"
                      onChange={e => handleFiles(e.target.files)}
                    />
                  </div>
                )}

                {files.length > 0 && (
                  <div className="flex flex-col gap-2 mt-3">
                    {files.map((f, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl"
                        style={{ background: 'rgba(206,241,123,0.07)', border: '1px solid rgba(206,241,123,0.15)' }}
                      >
                        <FileText size={15} color="#CEF17B" className="flex-shrink-0" />
                        <span className="flex-1 text-xs font-medium truncate" style={{ color: '#ffffff' }}>{f.name}</span>
                        <span className="text-xs flex-shrink-0" style={{ color: '#3a5a40' }}>
                          {(f.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                        <button
                          onClick={() => removeFile(i)}
                          className="w-5 h-5 flex items-center justify-center rounded-md flex-shrink-0 hover:opacity-70 transition-all"
                          style={{ color: '#CEF17B' }}
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ))}

                    {files.length < MAX_FILES && (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg transition-all hover:opacity-80"
                        style={{ color: '#CEF17B', background: 'rgba(206,241,123,0.05)', border: '1px dashed rgba(206,241,123,0.2)' }}
                      >
                        <Plus size={13} />
                        Add another file ({MAX_FILES - files.length} remaining)
                      </button>
                    )}
                  </div>
                )}
              </div>

              {error && (
                <p className="text-xs font-semibold px-3 py-2 rounded-lg" style={{ background: 'rgba(241,123,123,0.08)', color: '#f17b7b', border: '1px solid rgba(241,123,123,0.2)' }}>
                  {error}
                </p>
              )}
            </div>
          )}

          {/* REVIEW STATE */}
          {step === 'review' && (
            <div className="flex flex-col gap-4">
              <div className="flex gap-2 flex-wrap">
                {reviewModes.map(m => (
                  <button
                    key={m}
                    onClick={() => { setReviewMode(m); setReviewIndex(0) }}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      background: reviewMode === m ? 'rgba(206,241,123,0.15)' : 'rgba(206,241,123,0.04)',
                      border: reviewMode === m ? '1px solid rgba(206,241,123,0.4)' : '1px solid rgba(206,241,123,0.1)',
                      color: reviewMode === m ? '#CEF17B' : '#3a5a40',
                    }}
                  >
                    {MODES.find(mo => mo.key === m)?.label ?? m}
                    <span className="ml-1.5 opacity-60">({(questions[m] || []).length})</span>
                  </button>
                ))}
              </div>

              {currentQ && (
                <div className="rounded-xl p-4 flex flex-col gap-3" style={{ background: 'rgba(206,241,123,0.05)', border: '1px solid rgba(206,241,123,0.12)' }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold" style={{ color: '#3a5a40' }}>
                      {String(reviewIndex + 1).padStart(2, '0')} / {String(currentQuestions.length).padStart(2, '0')}
                    </span>
                    <button
                      onClick={() => handleDeleteQuestion(reviewMode, reviewIndex)}
                      className="flex items-center gap-1 text-xs font-semibold hover:opacity-70 transition-all"
                      style={{ color: '#f17b7b' }}
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>

                  {Object.entries(currentQ).map(([field, value]) => (
                    <div key={field}>
                      <label className="text-xs font-semibold uppercase tracking-widest block mb-1" style={{ color: '#3a5a40' }}>{field}</label>
                      {Array.isArray(value) ? (
                        <div className="text-xs" style={{ color: '#CEF17B' }}>{(value as string[]).join(', ')}</div>
                      ) : (
                        <textarea
                          value={String(value)}
                          onChange={e => handleEditQuestion(reviewMode, reviewIndex, field, e.target.value)}
                          rows={field === 'question' ? 3 : 2}
                          className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none transition-all"
                          style={{
                            background: 'rgba(206,241,123,0.05)',
                            border: '1px solid rgba(206,241,123,0.15)',
                            color: '#ffffff',
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between">
                <button
                  onClick={() => setReviewIndex(i => Math.max(0, i - 1))}
                  disabled={reviewIndex === 0}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-30"
                  style={{ color: '#CEF17B', background: 'rgba(206,241,123,0.07)' }}
                >
                  <ChevronLeft size={15} /> Prev
                </button>
                <button
                  onClick={() => setReviewIndex(i => Math.min(currentQuestions.length - 1, i + 1))}
                  disabled={reviewIndex === currentQuestions.length - 1}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-30"
                  style={{ color: '#CEF17B', background: 'rgba(206,241,123,0.07)' }}
                >
                  Next <ChevronRight size={15} />
                </button>
              </div>

              {error && (
                <p className="text-xs font-semibold px-3 py-2 rounded-lg" style={{ background: 'rgba(241,123,123,0.08)', color: '#f17b7b', border: '1px solid rgba(241,123,123,0.2)' }}>
                  {error}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-4" style={{ borderTop: '1px solid rgba(206,241,123,0.08)' }}>
          {step === 'upload' && (
            <button
              onClick={handleGenerate}
              disabled={files.length === 0 || !title.trim() || modes.length === 0}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110"
              style={{ background: '#CEF17B', color: '#084734' }}
            >
              <Upload size={15} strokeWidth={2.5} />
              Generate Study Set
            </button>
          )}
          {step === 'review' && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-60 hover:brightness-110"
              style={{ background: '#CEF17B', color: '#084734' }}
            >
              {isSaving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} strokeWidth={2.5} />}
              {isSaving ? 'Saving...' : 'Save Study Set'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}