import { useState } from 'react'
import Button from '../components/ui/Button'
import { supabase } from '../services/supabaseClient'

export default function Login() {
  const [loading, setLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    setLoading(true)

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    })

    if (error) {
      setLoading(false)
      console.error('Google sign-in failed:', error.message)
    }
  }

  return (
    <main className="min-h-screen bg-background-base flex items-center justify-center px-10 py-8 font-ui">
      <section className="w-full max-w-md rounded-2xl bg-surface-card border border-white/10 shadow-glow px-8 py-10">
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-brand flex items-center justify-center text-white font-logo font-black text-2xl shadow-[0_0_15px_rgba(192,57,43,0.4)]">
              A
            </div>
            <span className="font-logo font-bold text-xl tracking-wider text-white">
              AnimeLoom
            </span>
          </div>

          <h1 className="text-3xl font-ui font-bold text-white">
            Welcome to AnimeLoom
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-400">
            Discover, track, and save your favorite anime.
          </p>

          <Button
            type="button"
            size="lg"
            fullWidth
            className="mt-8"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            Continue with Google
          </Button>
        </div>
      </section>
    </main>
  )
}
