import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rixtatubhziyhkquxxiu.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpeHRhdHViaHppeWhrcXV4eGl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNzM1NjcsImV4cCI6MjA4Nzg0OTU2N30.v9_QvrRQ0_en5wngi8XOtvon-Au8s0uECW5QV-4idRI'
const supabase = createClient(supabaseUrl, supabaseKey)

async function testInsert() {
  console.log("--- Testing Anon Insert to Watchlist ---")
  const dummyUserId = '00000000-0000-0000-0000-000000000000'
  const { data, error } = await supabase
    .from('watchlist')
    .insert({
      user_id: dummyUserId,
      anime_id: 999999,
      anime_title: 'Test Anime',
      anime_image: 'https://example.com/image.jpg',
      status: 'watching',
      episodes_watched: 1,
      total_episodes: 12
    })
    .select()

  console.log("Insert result:", { data, error })
}

testInsert()
