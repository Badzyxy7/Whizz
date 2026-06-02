import { VertexAI } from '@google-cloud/vertexai'

export function getVertexClient() {
  const credentials = JSON.parse(
    Buffer.from(process.env.GOOGLE_CREDENTIALS_BASE64!, 'base64').toString('utf-8')
  )

  const vertex = new VertexAI({
    project: process.env.GOOGLE_CLOUD_PROJECT!,
    location: process.env.GOOGLE_CLOUD_LOCATION!,
    googleAuthOptions: {
      credentials,
    },
  })

  return vertex.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 4096,
    }
  })
}

export function buildGeminiPrompt(documentText: string, selectedModes: string[], mcQuestionCount = 10) {
  const modeDescriptions = selectedModes.map(mode => {
    const count = mode === 'multiplechoice' ? mcQuestionCount : 10
    return `${mode}: ${count} questions`
  }).join(', ')

  return `You are a study assistant. Based on the following document content, generate study questions in the requested modes.

Document content:
"""
${documentText}
"""

Generate the following: ${modeDescriptions}

Return a valid JSON object in this exact format:
{
  "flashcards": [
    { "front": "term or question", "back": "definition or answer", "type": "term-definition" }
  ],
  "multiplechoice": [
    { "question": "...", "choices": ["A. ...", "B. ...", "C. ...", "D. ..."], "answer": "A" }
  ],
  "identification": [
    { "question": "...", "answer": "exact answer string" }
  ],
  "enumeration": [
    { "question": "List the ... ", "answers": ["item1", "item2", "item3"] }
  ]
}

Only include keys for the modes that were requested. Do not include any explanation, markdown, or extra text. Return only the JSON.`
}