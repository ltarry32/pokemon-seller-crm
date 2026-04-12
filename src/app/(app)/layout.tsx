'use client';

import { Toaster } from 'react-hot-toast';
import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';
import { Header } from '@/components/layout/Header';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-base">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Mobile header */}
      <Header />

      {/* Main content */}
      <main className="lg:ml-60 min-h-screen">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <BottomNav />

      {/* Toast notifications */}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#27272a',
            color: '#f4f4f5',
            border: '1px solid #3f3f46',
            borderRadius: '12px',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          duration: 3000,
        }}
      />
    </div>
  );
}
