import { createServerSupabaseClient } from '@/lib/supabase-server'
import { parsePDF, parseDOCX } from '@/lib/parsers'
import { getVertexClient, buildGeminiPrompt } from '@/lib/gemini'
import { NextResponse } from 'next/server'

export const maxDuration = 60

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await request.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const modes = JSON.parse(formData.get('modes') as string) as string[]

    if (!file || !title || !modes.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    console.log('📄 Parsing file:', file.name, file.type)

    const buffer = Buffer.from(await file.arrayBuffer())
    let text = ''

    if (file.name.endsWith('.pdf') || file.type === 'application/pdf') {
      text = await parsePDF(buffer)
    } else if (file.name.endsWith('.docx') || file.type.includes('wordprocessingml')) {
      text = await parseDOCX(buffer)
    } else {
      return NextResponse.json({ error: 'Only PDF and DOCX files are supported.' }, { status: 400 })
    }

    console.log('✅ Parsed text length:', text.length)

    if (!text.trim()) {
      return NextResponse.json({ error: 'Could not extract text from the file. Try a different file.' }, { status: 400 })
    }

    const trimmedText = text.slice(0, 10000)

    console.log('🤖 Calling Gemini via Vertex AI...')

    const model = getVertexClient()
    const prompt = buildGeminiPrompt(trimmedText, modes)
    const result = await model.generateContent(prompt)
    const raw = result.response.candidates![0].content.parts[0].text!

    console.log('✅ Gemini response received, length:', raw.length)

    const cleaned = raw
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    let questions: Record<string, any[]>
    try {
      questions = JSON.parse(cleaned)
    } catch (parseErr) {
      console.error('❌ JSON parse failed:', cleaned.slice(0, 500))
      return NextResponse.json({ error: 'AI returned invalid format. Please try again.' }, { status: 500 })
    }

    console.log('✅ Questions parsed:', Object.keys(questions))

    const { data: newSet, error: setError } = await supabase
      .from('study_sets')
      .insert({ user_id: user.id, title, modes })
      .select()
      .single()

    if (setError || !newSet) {
      console.error('❌ Supabase error:', setError)
      return NextResponse.json({ error: 'Failed to create study set' }, { status: 500 })
    }

    return NextResponse.json({ questions, setId: newSet.id })

  } catch (err: any) {
    console.error('❌ Generate error:', err)
    return NextResponse.json({
      error: err.message || 'Something went wrong. Please try again.'
    }, { status: 500 })
  }
}