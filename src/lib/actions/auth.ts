'use server'

// =============================================================
// AUTH SERVER ACTIONS
// Handles sign-up, sign-in, sign-out using Supabase Auth.
// =============================================================

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { signUpSchema, signInSchema, type ActionResult, type SignUpResult } from '@/lib/validations'

// ─── Sign Up ──────────────────────────────────────────────────

export async function signUp(rawData: unknown): Promise<SignUpResult> {
  const parsed = signUpSchema.safeParse(rawData)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Validation failed',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const { email, password, full_name, business_name } = parsed.data
  const supabase = createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name, business_name },
    },
  })

  if (error) {
    // Don't leak internal error details to client
    console.error('[signUp]', error.message)

    // User-facing message — vague but actionable
    if (error.message.toLowerCase().includes('already registered')) {
      return { success: false, error: 'An account with this email already exists.' }
    }
    return { success: false, error: 'Could not create account. Please try again.' }
  }

  if (data.user && !data.session) {
    // Email confirmation required
    return {
      success: true,
      data: undefined,
      requiresEmailConfirmation: true,
    }
  }

  revalidatePath('/', 'layout')
  return { success: true, data: undefined }
}

// ─── Sign In ──────────────────────────────────────────────────

export async function signIn(rawData: unknown): Promise<ActionResult> {
  const parsed = signInSchema.safeParse(rawData)
  if (!parsed.success) {
    return {
      success: false,
      error: 'Validation failed',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const { email, password } = parsed.data
  const supabase = createClient()

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    console.error('[signIn]', error.message)
    // Generic message — don't reveal whether email or password was wrong
    return { success: false, error: 'Invalid email or password.' }
  }

  revalidatePath('/', 'layout')
  return { success: true, data: undefined }
}

// ─── Sign Out ─────────────────────────────────────────────────

export async function signOut(): Promise<void> {
  const supabase = createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
