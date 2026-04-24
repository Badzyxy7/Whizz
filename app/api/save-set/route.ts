import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { setId, questions } = await request.json()

    // Build question rows
    const rows: any[] = []
    for (const [mode, items] of Object.entries(questions) as [string, any[]][]) {
      items.forEach((content, index) => {
        rows.push({ set_id: setId, mode, content, position: index })
      })
    }

    const { error } = await supabase.from('questions').insert(rows)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Save set error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}