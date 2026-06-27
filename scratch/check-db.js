import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rixtatubhziyhkquxxiu.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpeHRhdHViaHppeWhrcXV4eGl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNzM1NjcsImV4cCI6MjA4Nzg0OTU2N30.v9_QvrRQ0_en5wngi8XOtvon-Au8s0uECW5QV-4idRI'
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSchema() {
  console.log("--- Checking Supabase Tables ---")
  
  const { data: watchlistData, error: watchlistError } = await supabase
    .from('watchlist')
    .select('*')
    .limit(1)

  console.log("watchlist table check:", { watchlistData, watchlistError })

  const { data: userAnimeProgressData, error: userAnimeProgressError } = await supabase
    .from('user_anime_progress')
    .select('*')
    .limit(1)

  console.log("user_anime_progress table check:", { userAnimeProgressData, userAnimeProgressError })
}

checkSchema()
