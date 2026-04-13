'use client'

// =============================================================
// AUTH HOOK — current user + session state
// Uses the browser Supabase client + onAuthStateChange listener.
// =============================================================

import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

interface AuthState {
  user:    User | null
  loading: boolean
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({ user: null, loading: true })
  const supabase = createClient()

  useEffect(() => {
    // Get current session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setState({ user, loading: false })
    })

    // Listen for auth state changes (sign-in, sign-out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setState({ user: session?.user ?? null, loading: false })
      }
    )

    return () => subscription.unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return state
}
