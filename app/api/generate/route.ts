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
    const fileEntries = formData.getAll('files') as File[]
    const title = formData.get('title') as string
    const modes = JSON.parse(formData.get('modes') as string) as string[]
    const mcQuestionCount = parseInt(formData.get('mcQuestionCount') as string || '10', 10)

    if (!fileEntries.length || !title || !modes.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (fileEntries.length > 3) {
      return NextResponse.json({ error: 'Maximum 3 files allowed.' }, { status: 400 })
    }

    console.log('📄 Parsing', fileEntries.length, 'file(s)...')

    let text = ''
    for (const file of fileEntries) {
      const buffer = Buffer.from(await file.arrayBuffer())
      let fileText = ''

      if (file.name.endsWith('.pdf') || file.type === 'application/pdf') {
        fileText = await parsePDF(buffer)
      } else if (file.name.endsWith('.docx') || file.type.includes('wordprocessingml')) {
        fileText = await parseDOCX(buffer)
      } else {
        return NextResponse.json({ error: 'Only PDF and DOCX files are supported.' }, { status: 400 })
      }

      console.log(`✅ Parsed "${file.name}": ${fileText.length} chars`)
      text += '\n\n' + fileText
    }

    if (!text.trim()) {
      return NextResponse.json({ error: 'Could not extract text from the files. Try different files.' }, { status: 400 })
    }

    const trimmedText = text.slice(0, 20000)

    console.log('🤖 Calling Gemini via Vertex AI...')
    console.log('   Modes:', modes, '| MC count:', mcQuestionCount)

    const model = getVertexClient()
    const prompt = buildGeminiPrompt(trimmedText, modes, mcQuestionCount)
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