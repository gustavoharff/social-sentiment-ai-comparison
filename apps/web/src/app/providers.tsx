'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { App } from 'antd'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from 'next-themes'

import { ConfigProvider } from '@/components/config-provider'

const client = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={client}>
        <SessionProvider>
          <ConfigProvider>
            <App
              className="flex flex-grow flex-col"
              style={{
                color: 'inherit',
              }}
            >
              {children}
            </App>
          </ConfigProvider>
        </SessionProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
