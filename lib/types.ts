export type StudyMode = 'flashcards' | 'multiple_choice' | 'identification' | 'enumeration'

export type Profile = {
  id: string
  full_name: string | null
  first_name: string | null   // ← add
  last_name: string | null    // ← add
  avatar_url: string | null
  avatar_choice: string | null  // ← add if missing
  email: string | null
  gemini_api_key: string | null
  grade_level: string | null    // ← add if missing
  strand: string | null         // ← add if missing
  course: string | null         // ← add if missing
  referral_source: string | null // ← add if missing
  onboarding_completed: boolean | null // ← add if missing
  created_at: string
}

export interface StudySet {
  id: string
  user_id: string
  title: string
  modes: StudyMode[]
  created_at: string
}

export interface Question {
  id: string
  set_id: string
  mode: StudyMode
  content: FlashcardContent | MultipleChoiceContent | IdentificationContent | EnumerationContent
  position: number
  created_at: string
}

export interface FlashcardContent {
  front: string
  back: string
  type: 'term-definition' | 'question-answer'
}

export interface MultipleChoiceContent {
  question: string
  choices: string[]
  answer: string
}

export interface IdentificationContent {
  question: string
  answer: string
}

export interface EnumerationContent {
  question: string
  answers: string[]
}

export interface Session {
  id: string
  user_id: string
  set_id: string
  mode: StudyMode
  score: number
  total: number
  duration_seconds: number | null
  completed_at: string
  study_sets?: { title: string }
}