import { useState } from 'react'
import Button from '../components/ui/Button'
import SEO from '../components/seo/SEO'
import { supabase } from '../services/supabaseClient'
import LogoName from './../assets/Logo-name.png'

export default function Login() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError(null)

    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    })

    if (signInError) {
      setLoading(false)
      setError(signInError.message || 'Google sign-in failed. Please try again.')
      console.error('Google sign-in failed:', signInError.message)
    }
  }

  return (
    <>
      <SEO
        title="Login"
        description="Sign in to AnimeLoom with Google and continue tracking your favorite anime."
        pathname="/login"
        shouldIndex={false}
        noFollow={true}
      />
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

            {error && (
              <div className="mt-6 w-full p-3 bg-brand/10 border border-brand/20 rounded-xl text-red-200 text-xs font-ui text-center" role="alert">
                {error}
              </div>
            )}

            <Button
              type="button"
              size="lg"
              fullWidth
              className={error ? "mt-4" : "mt-8"}
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              Continue with Google
            </Button>
          </div>
        </section>
      </main>
    </>
  )
}
