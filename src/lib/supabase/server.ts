// =============================================================
// SUPABASE SERVER CLIENT
// Used in Server Components, Server Actions, and Route Handlers ONLY.
// This file must NEVER be imported in 'use client' code.
//
// SECURITY: Uses httpOnly cookies for session — no token in JS.
// The anon key + RLS policies enforce per-user data isolation.
// The service role key is NOT used here — it bypasses RLS.
// =============================================================

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './database.types'

/**
 * Creates a Supabase client for server-side use.
 * Reads and writes session cookies so auth state is preserved
 * across server/client boundary.
 *
 * Usage:
 *   const supabase = createClient()
 *   const { data: { user } } = await supabase.auth.getUser()
 */
export function createClient() {
  const cookieStore = cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // setAll called from a Server Component — safe to ignore.
            // Middleware handles cookie refresh for those routes.
          }
        },
      },
    }
  )
}

// =============================================================
// SERVICE ROLE CLIENT — Admin operations only
// WARNING: Bypasses RLS. Never expose to client code.
// Only use for background jobs, webhooks, or admin-only routes.
// Only call from Route Handlers with explicit admin checks.
// =============================================================

/**
 * Creates a Supabase client with the service role key.
 * BYPASSES ROW LEVEL SECURITY — use only when absolutely necessary.
 * Must only be called from server-side code (Route Handlers).
 *
 * @throws if SUPABASE_SERVICE_ROLE_KEY is not set
 */
export function createServiceRoleClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not configured. ' +
      'This client must only be used for admin operations.'
    )
  }

  const { createClient: createSupabaseClient } = require('@supabase/supabase-js')
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
