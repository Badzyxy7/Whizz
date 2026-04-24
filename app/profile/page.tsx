import { createServerSupabaseClient } from '@/lib/supabase-server'
import AppShell from '@/components/layout/AppShell'
import ProfileClient from './ProfileClient'

export default async function ProfilePage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  return (
    <AppShell>
      <ProfileClient profile={profile} />
    </AppShell>
  )
}