// =============================================================
// APP LAYOUT — server component with auth gate
// If the user is not authenticated, middleware already redirects
// them to /login. This is a belt-and-suspenders check.
// =============================================================

import { redirect } from 'next/navigation'
import { Toaster } from 'react-hot-toast'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/Sidebar'
import { BottomNav } from '@/components/layout/BottomNav'
import { Header } from '@/components/layout/Header'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()

  // Server-side auth check — getUser() validates with Supabase servers
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-surface-base">
      <Sidebar />
      <Header />

      <main className="lg:ml-60 min-h-screen">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>

      <BottomNav />

      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#27272a',
            color:      '#f4f4f5',
            border:     '1px solid #3f3f46',
            borderRadius: '12px',
            fontSize:   '14px',
          },
          success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          duration: 3000,
        }}
      />
    </div>
  )
}
