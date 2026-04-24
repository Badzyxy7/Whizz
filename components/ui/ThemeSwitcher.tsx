'use client'

import { useTheme, type Theme } from '@/lib/theme-context'

const OPTIONS: { value: Theme; label: string; dots: string[] }[] = [
  { value: 'dark',  label: 'Dark',  dots: ['#121A0D', '#D9EA5B', '#0e1508'] },
  { value: 'light', label: 'Light', dots: ['#f4f6f0', '#5a7a10', '#ffffff'] },
  { value: 'pink',  label: 'Pink',  dots: ['#FCF8F8', '#F5AFAF', '#FBEFEF'] },
]

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-bold uppercase tracking-widest px-3 mb-1"
        style={{ color: 'var(--color-text-muted)' }}>
        Theme
      </p>
      {OPTIONS.map((opt) => {
        const active = theme === opt.value
        return (
          <button
            key={opt.value}
            onClick={() => setTheme(opt.value)}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium w-full text-left transition-all duration-200"
            style={{
              background: active ? 'var(--color-accent-dim)' : 'transparent',
              color: active ? 'var(--color-accent)' : 'var(--color-text-muted)',
              border: active ? '1px solid var(--color-border-hover)' : '1px solid transparent',
            }}
          >
            <div className="flex gap-1 flex-shrink-0">
              {opt.dots.map((c, i) => (
                <div key={i} className="w-3 h-3 rounded-full border"
                  style={{ background: c, borderColor: 'rgba(128,128,128,0.2)' }} />
              ))}
            </div>
            <span>{opt.label}</span>
            {active && (
              <svg className="ml-auto" width="13" height="13" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            )}
          </button>
        )
      })}
    </div>
  )
}