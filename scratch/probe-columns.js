import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rixtatubhziyhkquxxiu.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpeHRhdHViaHppeWhrcXV4eGl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNzM1NjcsImV4cCI6MjA4Nzg0OTU2N30.v9_QvrRQ0_en5wngi8XOtvon-Au8s0uECW5QV-4idRI'
const supabase = createClient(supabaseUrl, supabaseKey)

async function probeAllPossibleColumns() {
  const candidates = [
    'id', 'user_id', 'anime_id', 'title', 'anime_title', 'name', 
    'image_url', 'anime_image', 'image', 'poster', 'cover',
    'status', 'progress', 'episodes_watched', 'episodes', 'watched_episodes', 'total_episodes', 'max_episodes',
    'rating', 'score', 'notes', 'created_at', 'updated_at', 'last_updated'
  ]
  const existing = []
  for (const c of candidates) {
    const { error } = await supabase.from('watchlist').select(c).limit(1)
    if (!error) existing.push(c)
  }
  console.log("EXACT EXISTING COLUMNS IN SUPABASE 'watchlist' TABLE:", existing)
}

probeAllPossibleColumns()
