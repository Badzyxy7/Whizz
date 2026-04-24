import type { Metadata } from 'next'
import { Syne, DM_Sans } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/lib/theme-context'

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  weight: ['400', '600', '700', '800'],
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['300', '400', '500'],
})

export const metadata: Metadata = {
  title: 'Whizz — AI Study App',
  description: 'Upload a file. Generate study questions. Ace everything.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              const t = localStorage.getItem('whizz-theme') || 'dark';
              const themes = {
                dark: {
                  '--color-bg': '#121A0D',
                  '--color-sidebar': '#161E0B',
                  '--color-card': '#0e1508',
                  '--color-surface': '#1C2610',
                  '--color-border': 'rgba(206,241,123,0.1)',
                  '--color-border-hover': 'rgba(206,241,123,0.25)',
                  '--color-accent': '#CEF17B',
                  '--color-accent-dim': 'rgba(206,241,123,0.12)',
                  '--color-accent-text': '#121A0D',
                  '--color-text': '#ffffff',
                  '--color-text-muted': '#4a6a28',
                  '--color-text-sub': '#6b8a3a',
                  '--color-danger': '#f87171',
                  '--color-shadow': 'rgba(0,0,0,0.4)',
                },
                light: {
                  '--color-bg': '#f4f6f0',
                  '--color-sidebar': '#e8ede0',
                  '--color-card': '#ffffff',
                  '--color-surface': '#eef2e8',
                  '--color-border': 'rgba(80,100,40,0.15)',
                  '--color-border-hover': 'rgba(80,100,40,0.35)',
                  '--color-accent': '#5a7a10',
                  '--color-accent-dim': 'rgba(90,122,16,0.1)',
                  '--color-accent-text': '#ffffff',
                  '--color-text': '#1a2400',
                  '--color-text-muted': '#5a6b3a',
                  '--color-text-sub': '#7a8f50',
                  '--color-danger': '#dc2626',
                  '--color-shadow': 'rgba(0,0,0,0.08)',
                },
                pink: {
                  '--color-bg': '#FCF8F8',
                  '--color-sidebar': '#FBEFEF',
                  '--color-card': '#ffffff',
                  '--color-surface': '#F9DFDF',
                  '--color-border': 'rgba(245,175,175,0.3)',
                  '--color-border-hover': 'rgba(245,175,175,0.6)',
                  '--color-accent': '#F5AFAF',
                  '--color-accent-dim': 'rgba(245,175,175,0.15)',
                  '--color-accent-text': '#ffffff',
                  '--color-text': '#7a3a3a',
                  '--color-text-muted': '#c47a7a',
                  '--color-text-sub': '#d4a0a0',
                  '--color-danger': '#e05555',
                  '--color-shadow': 'rgba(245,175,175,0.15)',
                },
              };
              const vars = themes[t] || themes.dark;
              Object.entries(vars).forEach(([k, v]) => {
                document.documentElement.style.setProperty(k, v);
              });
            })();
          `
        }} />
      </head>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}