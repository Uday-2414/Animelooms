import { createContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../services/supabaseClient'
import { trackLogin, trackLogout } from '../services/analyticsService'
import { profileService } from '../services/profileService'

const AuthContext = createContext({
  user: null,
  loading: true,
  signOut: async () => { },
})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const getCurrentSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!isMounted) return

      const currentUser = session?.user ?? null
      setUser(currentUser)
      setLoading(false)

      if (currentUser) {
        profileService.checkAndAwardDailyLoginXP(currentUser.id)
      }
    }

    getCurrentSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      setLoading(false)

      if (event === 'SIGNED_IN') {
        trackLogin(session?.provider || 'google')
        if (currentUser) {
          profileService.checkAndAwardDailyLoginXP(currentUser.id)
        }
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    setLoading(true)

    const { error } = await supabase.auth.signOut()

    if (error) {
      setLoading(false)
      throw error
    }

    trackLogout('google')
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      signOut,
    }),
    [user, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContext
