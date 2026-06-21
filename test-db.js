import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rixtatubhziyhkquxxiu.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpeHRhdHViaHppeWhrcXV4eGl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNzM1NjcsImV4cCI6MjA4Nzg0OTU2N30.v9_QvrRQ0_en5wngi8XOtvon-Au8s0uECW5QV-4idRI'
const supabase = createClient(supabaseUrl, supabaseKey)

async function testDB() {
  console.log("Testing Supabase connection and query...")
  const email = `test_${Date.now()}@example.com`
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password: 'password123'
  })
  
  if (authError) {
    console.log("Auth error:", authError)
    return
  }
  
  const userId = authData.user.id
  console.log("Logged in as:", userId)

  const { data, error } = await supabase
      .from('watchlist')
      .insert({
        user_id: userId,
        anime_id: 1,
        anime_title: 'Test',
        anime_image: 'Test',
        status: 'watching',
        episodes_watched: 0,
        total_episodes: 12
      })
      .select()

  console.log("Data for watchlist insert:", data, error)
  
  const { data: data2, error: error2 } = await supabase
      .from('watchlist')
      .select('*')
      .eq('user_id', userId)
      
  console.log("Data for watchlist select:", data2, error2)
}

testDB()
