import { createServerSupabaseClient } from '@/lib/supabase-server'
import AppShell from '@/components/layout/AppShell'
import SetDetailClient from './SetDetailClient'
import { notFound } from 'next/navigation'

export default async function SetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: set }, { data: questions }] = await Promise.all([
    supabase.from('study_sets').select('*').eq('id', id).eq('user_id', user!.id).single(),
    supabase.from('questions').select('*').eq('set_id', id).order('position'),
  ])

  if (!set) notFound()

  return (
    <AppShell>
      <SetDetailClient set={set} questions={questions ?? []} />
    </AppShell>
  )
}