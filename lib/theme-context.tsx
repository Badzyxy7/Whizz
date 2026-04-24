'use client'

import { createContext, useContext, useEffect, useState } from 'react'

export type Theme = 'dark' | 'light' | 'pink'

export const THEMES: Record<Theme, Record<string, string>> = {
  dark: {
    '--color-bg':           '#121A0D',
    '--color-sidebar':      '#161E0B',
    '--color-card':         '#0e1508',
    '--color-surface':      '#1C2610',
    '--color-border':       'rgba(206,241,123,0.1)',
    '--color-border-hover': 'rgba(206,241,123,0.25)',
    '--color-accent':       '#CEF17B',
    '--color-accent-dim':   'rgba(206,241,123,0.12)',
    '--color-accent-text':  '#121A0D',
    '--color-text':         '#ffffff',
    '--color-text-muted':   '#4a6a28',
    '--color-text-sub':     '#6b8a3a',
    '--color-danger':       '#f87171',
    '--color-shadow':       'rgba(0,0,0,0.4)',
  },
  light: {
    '--color-bg':           '#f4f6f0',
    '--color-sidebar':      '#e8ede0',
    '--color-card':         '#ffffff',
    '--color-surface':      '#eef2e8',
    '--color-border':       'rgba(80,100,40,0.15)',
    '--color-border-hover': 'rgba(80,100,40,0.35)',
    '--color-accent':       '#5a7a10',
    '--color-accent-dim':   'rgba(90,122,16,0.1)',
    '--color-accent-text':  '#ffffff',
    '--color-text':         '#1a2400',
    '--color-text-muted':   '#5a6b3a',
    '--color-text-sub':     '#7a8f50',
    '--color-danger':       '#dc2626',
    '--color-shadow':       'rgba(0,0,0,0.08)',
  },
  pink: {
    '--color-bg':           '#FCF8F8',
    '--color-sidebar':      '#FBEFEF',
    '--color-card':         '#ffffff',
    '--color-surface':      '#F9DFDF',
    '--color-border':       'rgba(245,175,175,0.3)',
    '--color-border-hover': 'rgba(245,175,175,0.6)',
    '--color-accent':       '#F5AFAF',
    '--color-accent-dim':   'rgba(245,175,175,0.15)',
    '--color-accent-text':  '#ffffff',
    '--color-text':         '#7a3a3a',
    '--color-text-muted':   '#c47a7a',
    '--color-text-sub':     '#d4a0a0',
    '--color-danger':       '#e05555',
    '--color-shadow':       'rgba(245,175,175,0.15)',
  },
}

const ThemeContext = createContext<{
  theme: Theme
  setTheme: (t: Theme) => void
}>({ theme: 'dark', setTheme: () => {} })

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark')

  useEffect(() => {
    // The inline script in layout.tsx already applied the CSS vars before hydration.
    // Here we only sync React state to match — no DOM writes to avoid hydration mismatch.
    const saved = localStorage.getItem('whizz-theme') as Theme
    setThemeState(saved && THEMES[saved] ? saved : 'dark')
  }, [])

  function apply(t: Theme) {
    const root = document.documentElement
    Object.entries(THEMES[t]).forEach(([k, v]) => root.style.setProperty(k, v))
    setThemeState(t)
    localStorage.setItem('whizz-theme', t)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme: apply }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)