'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // One QueryClient per session — stable across re-renders
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 2 minutes: in a seller-tool context data doesn't change that
            // frequently. 30s was causing unnecessary refetches on tab switches
            // and between page navigations, doubling network traffic.
            staleTime:            2 * 60 * 1000,
            // Keep unused data in cache for 10 minutes — reduces cold fetches
            // when navigating back to a previously visited page.
            gcTime:               10 * 60 * 1000,
            retry:                1,
            // Don't refetch on window focus — user may flip between tabs
            // regularly while looking up card prices.
            refetchOnWindowFocus: false,
            // Don't refetch on reconnect — stale data is fine until user
            // explicitly triggers an action or the staleTime expires.
            refetchOnReconnect:   false,
          },
          mutations: {
            retry: 0,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
