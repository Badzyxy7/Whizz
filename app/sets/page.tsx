import { createServerSupabaseClient } from '@/lib/supabase-server'
import AppShell from '@/components/layout/AppShell'
import SetsClient from './SetsClient'
import type { StudySet } from '@/lib/types'

export default async function SetsPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: sets } = await supabase
    .from('study_sets')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <AppShell>
      <SetsClient initialSets={(sets ?? []) as StudySet[]} />
    </AppShell>
  )
}