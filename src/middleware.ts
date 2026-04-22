// =============================================================
// NEXT.JS MIDDLEWARE — Auth session refresh + route protection
//
// SECURITY NOTES:
// - getUser() makes a network call to Supabase to validate the JWT.
//   This is intentional — it prevents JWT forgery attacks.
//   Do NOT replace with getSession() which only reads the cookie.
// - Session cookies are refreshed here on every request so they
//   don't expire while the user is active.
// - Protected routes redirect to /login if user is not authenticated.
// =============================================================

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/register', '/auth/callback', '/privacy', '/terms', '/contact']

// Routes that authenticated users should NOT see (redirect to dashboard)
const AUTH_ROUTES = ['/login', '/register']

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(
  cookiesToSet: Array<{
    name: string
    value: string
    options?: unknown
  }>
) {
          // Must set on both request and response to refresh the session
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options as any)
          )
        },
      },
    }
  )

  // IMPORTANT: getUser() validates the JWT with Supabase Auth server.
  // Do NOT use getSession() — it only reads the (unverified) cookie.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // If authenticated and trying to access auth pages → redirect to dashboard
  if (user && AUTH_ROUTES.some(r => pathname.startsWith(r))) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // If not authenticated and trying to access a protected page → redirect to login
  const isPublic = PUBLIC_ROUTES.some(r => pathname.startsWith(r)) ||
    pathname.startsWith('/api/') ||    // API routes handle their own auth
    pathname === '/'

  if (!user && !isPublic) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    // Preserve the originally requested path so we can redirect back after login
    url.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    // Match all routes except static files and Next.js internals
    '/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
