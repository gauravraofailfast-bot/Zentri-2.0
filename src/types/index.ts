// ============================================================================
// Curriculum & Manifest types (mirrors manifest.yaml)
// ============================================================================

export interface CurriculumManifest {
  curriculum: string
  language: string
  title: string
  description: string
  biomes: Biome[]
  spaced_repetition?: {
    concept_intervals_days?: number[]
    mastery_threshold?: number
    next_due_calc?: string
  }
  free_chapter?: string
  tiers?: Record<string, unknown>
  audio?: Record<string, unknown>
  references?: Record<string, string>
}

export interface Biome {
  id: string
  title: string
  location: string
  theme: string
  chapter: string
  companion: string
  description: string
  landmarks: Landmark[]
}

export interface Landmark {
  id: string
  name: string
  concept_id: string
  mechanic: string
  mechanic_config: Record<string, unknown>
}

// ============================================================================
// Database row types (Supabase tables)
// ============================================================================

export interface Concept {
  id: string
  curriculum_id: string
  language: string
  chapter_id: string
  topic_id?: string
  name: string
  description?: string
  source_reference?: string
  prerequisites?: string[]
  mastery_criteria?: Record<string, unknown>
  common_misconceptions?: Record<string, unknown>
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
  mechanic_config: Record<string, unknown>
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

// ============================================================================
// Mechanic system
// ============================================================================

export interface MechanicResult {
  passed: boolean
  score?: number
}

/** Props every mechanic component receives */
export interface MechanicProps {
  config: Record<string, unknown>
  onComplete: (result: MechanicResult) => void
}

// ============================================================================
// Mission state
// ============================================================================

export interface MissionState {
  conceptId: string
  attempts: number
  correct: number
  inProgress: boolean
  startTime: number
  masteryLevel: number
}
