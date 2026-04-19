import type { Metadata, Viewport } from 'next'
import './globals.css'
import { QueryProvider } from '@/providers/QueryProvider'

export const metadata: Metadata = {
  title: 'CollectorVault — Pokémon Seller CRM',
  description: 'Professional tool for Pokémon card sellers. Track inventory, monitor pricing, calculate fees, and analyze profit.',
  manifest: '/manifest.json',
  icons: {
    icon:  '/icons/icon-192.png',
    apple: '/icons/icon-192.png',
  },
  appleWebApp: {
    capable:         true,
    title:           'CollectorVault',
    statusBarStyle:  'black-translucent',
  },
}

export const viewport: Viewport = {
  themeColor:    '#0f0f11',
  width:         'device-width',
  initialScale:  1,
  maximumScale:  1,
  userScalable:  false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        {/* QueryProvider wraps everything so React Query is available app-wide */}
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  )
}
