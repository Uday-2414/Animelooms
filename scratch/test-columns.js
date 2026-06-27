import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rixtatubhziyhkquxxiu.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpeHRhdHViaHppeWhrcXV4eGl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNzM1NjcsImV4cCI6MjA4Nzg0OTU2N30.v9_QvrRQ0_en5wngi8XOtvon-Au8s0uECW5QV-4idRI'
const supabase = createClient(supabaseUrl, supabaseKey)

async function testColumns() {
  const fields = ['id', 'user_id', 'anime_id', 'title', 'anime_title', 'image', 'image_url', 'anime_image', 'status', 'episodes', 'episodes_watched', 'total_episodes', 'created_at', 'updated_at']
  for (const f of fields) {
    const { data, error } = await supabase.from('watchlist').select(f).limit(1)
    console.log(`Column '${f}':`, error ? error.message : 'EXISTS')
  }
}

testColumns()
