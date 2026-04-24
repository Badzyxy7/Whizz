'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Step =
  | 'name'
  | 'grade'
  | 'strand'
  | 'course'
  | 'referral'
  | 'avatar'
  | 'done'

const GRADE_OPTIONS = ['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12', 'College', 'Other']

const STRANDS = [
  'STEM', 'ABM', 'HUMSS', 'GAS',
  'TVL - ICT', 'TVL - HE', 'TVL - IA', 'TVL - AFA',
  'Arts & Design', 'Sports',
]

const COURSES = [
  'Nursing', 'Medicine', 'Engineering', 'Education',
  'Business', 'IT / Computer Science', 'Architecture',
  'Law', 'Psychology', 'Other',
]

const REFERRALS = [
  'TikTok', 'Facebook', 'Instagram', 'Twitter / X',
  'Friend / Classmate', 'Teacher', 'Google Search', 'Other',
]

const AVATARS = [
  { id: 'avatar1', src: '/avatars/avatar1.jpg', label: 'Avatar 1' },
  { id: 'avatar2', src: '/avatars/avatar2.jpg', label: 'Avatar 2' },
  { id: 'avatar3', src: '/avatars/avatar3.jpg', label: 'Avatar 3' },
  { id: 'avatar4', src: '/avatars/avatar4.jpg', label: 'Avatar 4' },
  { id: 'avatar5', src: '/avatars/avatar5.jpg', label: 'Avatar 5' },
  { id: 'avatar6', src: '/avatars/avatar6.jpg', label: 'Avatar 6' },
]

// Steps that actually show as cards (excluding 'done')
function getSteps(gradeLevel: string): Step[] {
  const base: Step[] = ['name', 'grade']
  if (gradeLevel === 'Grade 12') base.push('strand')
  if (gradeLevel === 'College') base.push('course')
  base.push('referral', 'avatar')
  return base
}

export default function OnboardingClient() {
  const supabase = createClient()
  const router = useRouter()

  const [step, setStep] = useState<Step>('name')
  const [finishing, setFinishing] = useState(false)
  const [dots, setDots] = useState(1)

  const [firstName, setFirstName]       = useState('')
  const [lastName, setLastName]         = useState('')
  const [gradeLevel, setGradeLevel]     = useState('')
  const [strand, setStrand]             = useState('')
  const [course, setCourse]             = useState('')
  const [referral, setReferral]         = useState('')
  const [avatarChoice, setAvatarChoice] = useState('')

  // Animate dots in loading screen
  useEffect(() => {
    if (!finishing) return
    const interval = setInterval(() => {
      setDots(d => d === 3 ? 1 : d + 1)
    }, 400)
    return () => clearInterval(interval)
  }, [finishing])

  const steps = getSteps(gradeLevel)
  const currentIndex = steps.indexOf(step)
  const totalSteps = steps.length
  const progress = currentIndex === -1 ? 100 : Math.round(((currentIndex) / totalSteps) * 100)

  function next(nextStep: Step) {
    setStep(nextStep)
  }

  function getNextStep(current: Step): Step {
    const idx = steps.indexOf(current)
    return steps[idx + 1] ?? 'done'
  }

  function getPrevStep(current: Step): Step {
    const idx = steps.indexOf(current)
    return steps[idx - 1] ?? 'name'
  }

  async function finish() {
    setFinishing(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('profiles').update({
      first_name:           firstName.trim(),
      last_name:            lastName.trim(),
      full_name:            `${firstName.trim()} ${lastName.trim()}`,
      grade_level:          gradeLevel,
      strand:               strand || null,
      course:               course || null,
      referral_source:      referral,
      avatar_choice:        avatarChoice,
      onboarding_completed: true,
    }).eq('id', user.id)

    // Show loading screen for 2.5s then redirect
    setTimeout(() => router.push('/dashboard'), 2500)
  }

  // ── Loading / Done Screen ──
  if (finishing) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-8"
        style={{ background: 'var(--color-bg, #121A0D)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: 'var(--color-accent, #CEF17B)' }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke="var(--color-accent-text, #121A0D)" strokeWidth="3" strokeLinecap="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
          </div>
          <span className="text-4xl font-black" style={{ color: 'var(--color-text, #fff)' }}>
            Whizz
          </span>
        </div>

        {/* Status text */}
        <div className="text-center">
          <p className="text-base font-semibold" style={{ color: 'var(--color-text-muted, #4a6a28)' }}>
            Completing setup{'.'?.repeat(dots)}
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-sub, #6b8a3a)' }}>
            Redirecting you to your dashboard
          </p>
        </div>

        {/* Wave loader */}
        <div className="flex items-end gap-1.5" style={{ height: '40px' }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-2 rounded-full"
              style={{
                background: 'var(--color-accent, #CEF17B)',
                animation: `wave 1.2s ease-in-out infinite`,
                animationDelay: `${i * 0.15}s`,
                height: '12px',
              }}
            />
          ))}
        </div>

        <style>{`
          @keyframes wave {
            0%, 100% { height: 12px; opacity: 0.4; }
            50% { height: 36px; opacity: 1; }
          }
        `}</style>
      </div>
    )
  }

  // ── Shared card wrapper ──
  const Card = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--color-bg, #121A0D)' }}>
      <div className="w-full max-w-md flex flex-col gap-6">

        {/* Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                style={{ background: 'var(--color-accent, #CEF17B)' }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                  stroke="var(--color-accent-text, #121A0D)" strokeWidth="3" strokeLinecap="round">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
              </div>
              <span className="font-black text-sm" style={{ color: 'var(--color-text, #fff)' }}>Whizz</span>
            </div>
            <span className="text-xs font-bold"
              style={{ color: 'var(--color-accent, #CEF17B)' }}>
              {progress}%
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full overflow-hidden"
            style={{ background: 'var(--color-surface, #1C2610)' }}>
            <div
              className="h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: 'var(--color-accent, #CEF17B)' }}
            />
          </div>
          <p className="text-xs mt-1.5" style={{ color: 'var(--color-text-sub, #6b8a3a)' }}>
            Step {currentIndex + 1} of {totalSteps}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl p-7 border"
          style={{
            background: 'var(--color-card, #0e1508)',
            borderColor: 'var(--color-border, rgba(206,241,123,0.1))',
          }}>
          {children}
        </div>

      </div>
    </div>
  )

  // ── STEP: name ──
  if (step === 'name') return (
    <Card>
      <div className="flex flex-col gap-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-1"
            style={{ color: 'var(--color-accent, #CEF17B)' }}>Welcome</p>
          <h2 className="text-2xl font-black" style={{ color: 'var(--color-text, #fff)' }}>
            What's your name? 👋
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted, #4a6a28)' }}>
            Let's get to know you first.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {[
            { label: 'First Name', value: firstName, set: setFirstName, placeholder: 'e.g. Shane' },
            { label: 'Last Name',  value: lastName,  set: setLastName,  placeholder: 'e.g. Retes' },
          ].map(f => (
            <div key={f.label} className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: 'var(--color-text-muted, #4a6a28)' }}>{f.label}</label>
              <input
                value={f.value}
                onChange={e => f.set(e.target.value)}
                placeholder={f.placeholder}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: 'var(--color-surface, #1C2610)',
                  color: 'var(--color-text, #fff)',
                  border: '1px solid var(--color-border, rgba(206,241,123,0.1))',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--color-accent, #CEF17B)'}
                onBlur={e => e.target.style.borderColor = 'var(--color-border, rgba(206,241,123,0.1))'}
              />
            </div>
          ))}
        </div>

        <button
          onClick={() => next('grade')}
          disabled={!firstName.trim() || !lastName.trim()}
          className="w-full py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-40"
          style={{ background: 'var(--color-accent, #CEF17B)', color: 'var(--color-accent-text, #121A0D)' }}
        >
          Continue →
        </button>
      </div>
    </Card>
  )

  // ── STEP: grade ──
  if (step === 'grade') return (
    <Card>
      <div className="flex flex-col gap-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-1"
            style={{ color: 'var(--color-accent, #CEF17B)' }}>About You</p>
          <h2 className="text-2xl font-black" style={{ color: 'var(--color-text, #fff)' }}>
            What's your grade level? 📚
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted, #4a6a28)' }}>
            We'll personalize your experience.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {GRADE_OPTIONS.map(g => (
            <button key={g} onClick={() => { setGradeLevel(g); setStrand(''); setCourse('') }}
              className="py-3 px-4 rounded-xl text-sm font-semibold border transition-all text-left"
              style={{
                background: gradeLevel === g ? 'var(--color-accent-dim, rgba(206,241,123,0.12))' : 'var(--color-surface, #1C2610)',
                borderColor: gradeLevel === g ? 'var(--color-accent, #CEF17B)' : 'var(--color-border, rgba(206,241,123,0.1))',
                color: gradeLevel === g ? 'var(--color-accent, #CEF17B)' : 'var(--color-text, #fff)',
              }}
            >
              {g}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <button onClick={() => next('name')}
            className="px-5 py-3 rounded-xl text-sm font-semibold border transition-all"
            style={{ borderColor: 'var(--color-border, rgba(206,241,123,0.1))', color: 'var(--color-text-muted, #4a6a28)' }}>
            ← Back
          </button>
          <button
            onClick={() => {
              if (gradeLevel === 'Grade 12') next('strand')
              else if (gradeLevel === 'College') next('course')
              else next('referral')
            }}
            disabled={!gradeLevel}
            className="flex-1 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-40"
            style={{ background: 'var(--color-accent, #CEF17B)', color: 'var(--color-accent-text, #121A0D)' }}
          >
            Continue →
          </button>
        </div>
      </div>
    </Card>
  )

  // ── STEP: strand ──
  if (step === 'strand') return (
    <Card>
      <div className="flex flex-col gap-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-1"
            style={{ color: 'var(--color-accent, #CEF17B)' }}>Grade 12</p>
          <h2 className="text-2xl font-black" style={{ color: 'var(--color-text, #fff)' }}>
            What's your strand? 🎓
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted, #4a6a28)' }}>
            Select your senior high school strand.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {STRANDS.map(s => (
            <button key={s} onClick={() => setStrand(s)}
              className="py-3 px-4 rounded-xl text-sm font-semibold border transition-all text-left"
              style={{
                background: strand === s ? 'var(--color-accent-dim, rgba(206,241,123,0.12))' : 'var(--color-surface, #1C2610)',
                borderColor: strand === s ? 'var(--color-accent, #CEF17B)' : 'var(--color-border, rgba(206,241,123,0.1))',
                color: strand === s ? 'var(--color-accent, #CEF17B)' : 'var(--color-text, #fff)',
              }}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <button onClick={() => next('grade')}
            className="px-5 py-3 rounded-xl text-sm font-semibold border transition-all"
            style={{ borderColor: 'var(--color-border, rgba(206,241,123,0.1))', color: 'var(--color-text-muted, #4a6a28)' }}>
            ← Back
          </button>
          <button
            onClick={() => next('referral')}
            disabled={!strand}
            className="flex-1 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-40"
            style={{ background: 'var(--color-accent, #CEF17B)', color: 'var(--color-accent-text, #121A0D)' }}
          >
            Continue →
          </button>
        </div>
      </div>
    </Card>
  )

  // ── STEP: course ──
  if (step === 'course') return (
    <Card>
      <div className="flex flex-col gap-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-1"
            style={{ color: 'var(--color-accent, #CEF17B)' }}>College</p>
          <h2 className="text-2xl font-black" style={{ color: 'var(--color-text, #fff)' }}>
            What's your course? 🎓
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted, #4a6a28)' }}>
            Select your college program.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {COURSES.map(c => (
            <button key={c} onClick={() => setCourse(c)}
              className="py-3 px-4 rounded-xl text-sm font-semibold border transition-all text-left"
              style={{
                background: course === c ? 'var(--color-accent-dim, rgba(206,241,123,0.12))' : 'var(--color-surface, #1C2610)',
                borderColor: course === c ? 'var(--color-accent, #CEF17B)' : 'var(--color-border, rgba(206,241,123,0.1))',
                color: course === c ? 'var(--color-accent, #CEF17B)' : 'var(--color-text, #fff)',
              }}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <button onClick={() => next('grade')}
            className="px-5 py-3 rounded-xl text-sm font-semibold border transition-all"
            style={{ borderColor: 'var(--color-border, rgba(206,241,123,0.1))', color: 'var(--color-text-muted, #4a6a28)' }}>
            ← Back
          </button>
          <button
            onClick={() => next('referral')}
            disabled={!course}
            className="flex-1 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-40"
            style={{ background: 'var(--color-accent, #CEF17B)', color: 'var(--color-accent-text, #121A0D)' }}
          >
            Continue →
          </button>
        </div>
      </div>
    </Card>
  )

  // ── STEP: referral ──
  if (step === 'referral') return (
    <Card>
      <div className="flex flex-col gap-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-1"
            style={{ color: 'var(--color-accent, #CEF17B)' }}>Almost there</p>
          <h2 className="text-2xl font-black" style={{ color: 'var(--color-text, #fff)' }}>
            Where did you find Whizz? 🔍
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted, #4a6a28)' }}>
            Help us know how you got here.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {REFERRALS.map(r => (
            <button key={r} onClick={() => setReferral(r)}
              className="py-3 px-4 rounded-xl text-sm font-semibold border transition-all text-left"
              style={{
                background: referral === r ? 'var(--color-accent-dim, rgba(206,241,123,0.12))' : 'var(--color-surface, #1C2610)',
                borderColor: referral === r ? 'var(--color-accent, #CEF17B)' : 'var(--color-border, rgba(206,241,123,0.1))',
                color: referral === r ? 'var(--color-accent, #CEF17B)' : 'var(--color-text, #fff)',
              }}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <button onClick={() => {
            if (gradeLevel === 'Grade 12') next('strand')
            else if (gradeLevel === 'College') next('course')
            else next('grade')
          }}
            className="px-5 py-3 rounded-xl text-sm font-semibold border transition-all"
            style={{ borderColor: 'var(--color-border, rgba(206,241,123,0.1))', color: 'var(--color-text-muted, #4a6a28)' }}>
            ← Back
          </button>
          <button
            onClick={() => next('avatar')}
            disabled={!referral}
            className="flex-1 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-40"
            style={{ background: 'var(--color-accent, #CEF17B)', color: 'var(--color-accent-text, #121A0D)' }}
          >
            Continue →
          </button>
        </div>
      </div>
    </Card>
  )

 // ── STEP: avatar ──
if (step === 'avatar') return (
  <Card>
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest mb-1"
          style={{ color: 'var(--color-accent, #CEF17B)' }}>Last step!</p>
        <h2 className="text-2xl font-black" style={{ color: 'var(--color-text, #fff)' }}>
          Pick your avatar 🎨
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted, #4a6a28)' }}>
          Choose one that represents you.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {AVATARS.map(a => (
          <button
            key={a.id}
            onClick={() => setAvatarChoice(a.id)}
            className="relative flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all duration-200"
            style={{
              background: avatarChoice === a.id ? 'var(--color-accent-dim, rgba(206,241,123,0.12))' : 'var(--color-surface, #1C2610)',
              borderColor: avatarChoice === a.id ? 'var(--color-accent, #CEF17B)' : 'var(--color-border, rgba(206,241,123,0.1))',
            }}
          >
            {/* Checkmark badge */}
            {avatarChoice === a.id && (
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: 'var(--color-accent, #CEF17B)' }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                  stroke="var(--color-accent-text, #121A0D)" strokeWidth="3.5" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
            )}
            <img
              src={a.src}
              alt={a.label}
              className="w-16 h-16 rounded-full object-cover"
              style={{
                border: avatarChoice === a.id
                  ? '2px solid var(--color-accent, #CEF17B)'
                  : '2px solid transparent',
              }}
            />
            <span className="text-xs font-semibold"
              style={{ color: avatarChoice === a.id ? 'var(--color-accent, #CEF17B)' : 'var(--color-text-muted, #4a6a28)' }}>
              {a.label}
            </span>
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <button onClick={() => next('referral')}
          className="px-5 py-3 rounded-xl text-sm font-semibold border transition-all"
          style={{ borderColor: 'var(--color-border, rgba(206,241,123,0.1))', color: 'var(--color-text-muted, #4a6a28)' }}>
          ← Back
        </button>
        <button
          onClick={finish}
          disabled={!avatarChoice}
          className="flex-1 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-40"
          style={{ background: 'var(--color-accent, #CEF17B)', color: 'var(--color-accent-text, #121A0D)' }}
        >
          Let's go! 🚀
        </button>
      </div>
    </div>
  </Card>
)

  return null
}