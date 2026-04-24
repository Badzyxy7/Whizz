import { createServerSupabaseClient } from '@/lib/supabase-server'
import Sidebar from './Sidebar'
import type { Profile } from '@/lib/types'

const NOISE_URL = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n' x='0' y='0'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`

export default async function AppShell({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile: Profile | null = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    profile = data
  }

  return (
    <div
      className="flex min-h-screen relative"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      {/* Subtle ambient glow */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: [
            'radial-gradient(ellipse at 20% 50%, var(--color-accent-dim) 0%, transparent 55%)',
            'radial-gradient(ellipse at 85% 10%, var(--color-accent-dim) 0%, transparent 40%)',
            'radial-gradient(ellipse at 80% 90%, var(--color-accent-dim) 0%, transparent 45%)',
          ].join(', '),
        }}
      />

      {/* Grain noise overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage: NOISE_URL,
          backgroundRepeat: 'repeat',
          backgroundSize: '300px 300px',
          opacity: 0.035,
          mixBlendMode: 'soft-light',
        }}
      />

      <Sidebar profile={profile} />

      <main className="flex-1 md:ml-[240px] min-h-screen relative z-10">
        {children}
      </main>
    </div>
  )
}