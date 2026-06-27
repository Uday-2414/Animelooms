import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rixtatubhziyhkquxxiu.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpeHRhdHViaHppeWhrcXV4eGl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNzM1NjcsImV4cCI6MjA4Nzg0OTU2N30.v9_QvrRQ0_en5wngi8XOtvon-Au8s0uECW5QV-4idRI'
const supabase = createClient(supabaseUrl, supabaseKey)

async function probeTables() {
  const tableCandidates = [
    'watchlist', 'user_watchlist', 'anime_watchlist', 'progress', 'user_progress', 
    'user_anime_progress', 'anime_progress', 'user_profiles', 'user_activity', 
    'anime_reviews', 'review_likes', 'review_reports', 'user_xp', 'user_achievements',
    'user_badges', 'user_challenge_progress', 'notifications'
  ]
  for (const t of tableCandidates) {
    const { error } = await supabase.from(t).select('*').limit(1)
    if (!error) {
      console.log(`Table '${t}': EXISTS`)
    } else {
      console.log(`Table '${t}': NOT EXISTS (${error.message})`)
    }
  }
}

probeTables()
