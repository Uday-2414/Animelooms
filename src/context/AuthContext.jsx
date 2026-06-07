import { createContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../services/supabaseClient'

const AuthContext = createContext({
  user: null,
  loading: true,
  signOut: async () => {},
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

      setUser(session?.user ?? null)
      setLoading(false)
    }

    getCurrentSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
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
