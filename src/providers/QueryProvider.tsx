'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // One QueryClient per session — stable across re-renders
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data is considered fresh for 30s — avoids redundant refetches
            staleTime:           30 * 1000,
            // Keep unused data in cache for 5 minutes
            gcTime:              5 * 60 * 1000,
            retry:               1,
            // Don't refetch on window focus in a seller tool context
            refetchOnWindowFocus: false,
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

    {process.env.NODE_ENV === 'development' && (
  <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
)}

    </QueryClientProvider>
)
}
