import { createServerSupabaseClient } from '@/lib/supabase-server'
import AppShell from '@/components/layout/AppShell'
import StudyClient from './StudyClient'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ id: string; mode: string }>
}

export default async function StudyPage({ params }: Props) {
  const { id, mode } = await params
  const supabase = await createServerSupabaseClient()

  const { data: studySet } = await supabase
    .from('study_sets')
    .select('*')
    .eq('id', id)
    .single()

  if (!studySet) notFound()

  const { data: questions } = await supabase
    .from('questions')
    .select('*')
    .eq('set_id', id)
    .eq('mode', mode)
    .order('position', { ascending: true })

  if (!questions || questions.length === 0) notFound()

  return (
    <AppShell>
      <StudyClient
        studySet={studySet}
        questions={questions}
        mode={mode}
      />
    </AppShell>
  )
}