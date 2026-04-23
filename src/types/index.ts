// Curriculum & Manifest types
export interface CurriculumManifest {
  curriculum: string
  biomes: Biome[]
  spaced_repetition?: {
    concept_intervals?: number[]
  }
}

export interface Biome {
  id: string
  theme: string
  companions_unlocked?: string[]
  landmarks: Landmark[]
}

export interface Landmark {
  id: string
  concept: string
  mechanic: string
  mechanic_config: Record<string, any>
  ncert_reference: string
  mastery_threshold?: number
}

// Database types
export interface Concept {
  id: string
  curriculum_id: string
  language: string
  chapter_id: string
  topic_id?: string
  name: string
  description?: string
  source_reference: string
  prerequisites?: string[]
  mastery_criteria?: Record<string, any>
  common_misconceptions?: Record<string, any>
  created_at?: string
  updated_at?: string
}

export interface Question {
  id: string
  curriculum_id: string
  chapter_id: string
  concept_id?: string
  language: string
  question_text: string
  question_type?: 'mcq' | 'short-answer' | 'long-answer'
  options?: { text: string; isCorrect: boolean }[]
  answer?: string
  answer_explanation?: string
  difficulty?: 'easy' | 'medium' | 'hard'
  source?: 'ncert' | 'pyq' | 'jee' | 'neet'
  year?: number
  created_at?: string
}

export interface LandmarkDB {
  id: string
  curriculum_id: string
  biome_id: string
  concept_id?: string
  mechanic_type: string
  mechanic_config: Record<string, any>
  vibe_notes?: string
  sort_order?: number
  created_at?: string
}

export interface Progress {
  user_id: string
  concept_id: string
  curriculum_id: string
  mastery_level: number
  last_practiced?: string
  next_due?: string
  attempts: number
  correct: number
  created_at?: string
  updated_at?: string
}

export interface Profile {
  id: string
  display_name?: string
  free_chapter_id?: string
  selected_language: string
  created_at?: string
}

export interface Entitlement {
  user_id: string
  curriculum_id: string
  tier: 'horizon' | 'wayfarer' | 'caravan' | 'cartographer'
  free_chapter_id?: string
  expires_at?: string
  created_at?: string
}

// Mechanic props (generic)
export interface MechanicProps {
  conceptId: string
  config: Record<string, any>
  onComplete: (correct: boolean, duration: number) => void
}

// Mission state
export interface MissionState {
  conceptId: string
  attempts: number
  correct: number
  inProgress: boolean
  startTime: number
  masteryLevel: number
}
