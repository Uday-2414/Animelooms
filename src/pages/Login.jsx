import { useState } from 'react'
import Button from '../components/ui/Button'
import { supabase } from '../services/supabaseClient'
import LogoName from './../assets/Logo-name.png'

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
          <div className="mb-4 flex items-center gap-2">
           <img
                       src={LogoName}
                       alt="AnimeLoom Logo"
                       className="w-auto h-25 object-contain"
                     />
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
