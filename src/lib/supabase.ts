import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase env vars missing. App will work offline only.')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder_key'
)

// Typed queries
export async function fetchConcepts(curriculumId: string) {
  const { data, error } = await supabase
    .from('concepts')
    .select('*')
    .eq('curriculum_id', curriculumId)
    .eq('language', 'en')

  if (error) throw error
  return data
}

export async function fetchLandmarks(curriculumId: string) {
  const { data, error } = await supabase
    .from('landmarks')
    .select('*')
    .eq('curriculum_id', curriculumId)
    .order('sort_order')

  if (error) throw error
  return data
}

export async function fetchQuestions(curriculumId: string) {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('curriculum_id', curriculumId)
    .eq('language', 'en')

  if (error) throw error
  return data
}

export async function upsertProgress(
  userId: string,
  conceptId: string,
  curriculumId: string,
  masteryLevel: number,
  correct: number,
  attempts: number
) {
  const { data, error } = await supabase
    .from('progress')
    .upsert(
      {
        user_id: userId,
        concept_id: conceptId,
        curriculum_id: curriculumId,
        mastery_level: masteryLevel,
        correct,
        attempts,
        last_practiced: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,concept_id' }
    )

  if (error) throw error
  return data
}

export async function canAccess(userId: string, curriculumId: string, chapterId?: string) {
  // Check if user has entitlement or if it's the free chapter
  const { data: profile } = await supabase
    .from('profiles')
    .select('free_chapter_id')
    .eq('id', userId)
    .single()

  if (profile?.free_chapter_id === chapterId) {
    return true
  }

  const { data: entitlement } = await supabase
    .from('entitlements')
    .select('*')
    .eq('user_id', userId)
    .eq('curriculum_id', curriculumId)
    .single()

  return !!entitlement
}
