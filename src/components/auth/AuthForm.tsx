'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Zap, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'
import { signIn, signUp } from '@/lib/actions/auth'

type Mode = 'login' | 'register'

interface AuthFormProps {
  mode: Mode
}

export function AuthForm({ mode }: AuthFormProps) {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const redirectTo   = searchParams.get('redirectTo') ?? '/dashboard'

  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState<string | null>(null)
  const [success,   setSuccess]   = useState<string | null>(null)
  const [showPass,  setShowPass]  = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  const [form, setForm] = useState({
    email:         '',
    password:      '',
    full_name:     '',
    business_name: '',
  })

  const set = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }))
    // Clear field error on change
    if (fieldErrors[key]) {
      setFieldErrors(prev => { const n = { ...prev }; delete n[key]; return n })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)
    setFieldErrors({})

    const result = mode === 'login'
      ? await signIn({ email: form.email, password: form.password })
      : await signUp(form)

    setLoading(false)

    if (!result.success) {
      setError(result.error)
      if (result.fieldErrors) setFieldErrors(result.fieldErrors)
      return
    }

    setSuccess('Account created successfully. You can sign in now.')
return

    router.push(redirectTo)
    router.refresh()
  }

  const fieldError = (key: string) => fieldErrors[key]?.[0]

  return (
    <div className="min-h-screen bg-surface-base flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-brand-500 flex items-center justify-center shadow-glow-orange mb-3">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-100">CollectorVault</h1>
          <p className="text-sm text-zinc-500 mt-1">
            {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="flex items-start gap-3 p-3 mb-4 bg-red-500/10 border border-red-500/30 rounded-2xl animate-fade-in">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {/* Success banner */}
        {success && success.includes('Account created') && (
          <div className="flex items-start gap-3 p-3 mb-4 bg-green-500/10 border border-green-500/30 rounded-2xl animate-fade-in">
            <CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
            <p className="text-sm text-green-300">{success}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-surface-1 border border-zinc-800 rounded-3xl p-6 space-y-4">
          {mode === 'register' && (
            <>
              <Input
                label="Full Name"
                type="text"
                placeholder="Jane Smith"
                value={form.full_name}
                onChange={e => set('full_name', e.target.value)}
                error={fieldError('full_name')}
                autoComplete="name"
                required
              />
              <Input
                label="Business Name (optional)"
                type="text"
                placeholder="Charizard Cards LLC"
                value={form.business_name}
                onChange={e => set('business_name', e.target.value)}
                error={fieldError('business_name')}
                hint="Your store or business name"
              />
            </>
          )}

          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={e => set('email', e.target.value)}
            error={fieldError('email')}
            autoComplete={mode === 'login' ? 'email' : 'email'}
            required
          />

          <div className="relative">
            <Input
              label="Password"
              type={showPass ? 'text' : 'password'}
              placeholder={mode === 'register' ? 'At least 8 characters' : '••••••••'}
              value={form.password}
              onChange={e => set('password', e.target.value)}
              error={fieldError('password')}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="pointer-events-auto p-0.5 text-zinc-500 hover:text-zinc-300"
                  tabIndex={-1}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />
          </div>

          <Button type="submit" fullWidth size="lg" loading={loading} className="mt-2">
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </Button>
        </form>

        {/* Toggle mode */}
        <p className="text-center text-sm text-zinc-500 mt-4">
          {mode === 'login' ? (
            <>
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-brand-400 hover:text-brand-300 font-medium">
                Sign up free
              </Link>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <Link href="/login" className="text-brand-400 hover:text-brand-300 font-medium">
                Sign in
              </Link>
            </>
          )}
        </p>

        {/* Footer note */}
        <p className="text-center text-xs text-zinc-700 mt-6">
          By continuing, you agree to our terms of service and privacy policy.
        </p>
      </div>
    </div>
  )
}
