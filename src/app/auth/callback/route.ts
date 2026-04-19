// =============================================================
// AUTH CALLBACK ROUTE
// Handles Supabase email confirmation links and OAuth redirects.
// Exchanges the code for a session and redirects to the app.
// =============================================================

import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/supabase/database.types'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code        = requestUrl.searchParams.get('code')
  const origin      = requestUrl.origin

  // Validate `next` is a safe relative path — prevents open redirect attacks.
  // Reject anything that doesn't start with '/' or starts with '//' (protocol-relative).
  const rawNext = requestUrl.searchParams.get('next') ?? ''
  const next    = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/dashboard'

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll()     { return cookieStore.getAll() },
          setAll(cs)   { cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Redirect to the intended destination after successful auth
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Auth failure — redirect to login with error param
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
