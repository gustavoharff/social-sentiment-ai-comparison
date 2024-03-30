import { App } from 'antd'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from 'next-themes'

import { ConfigProvider } from '@/components/config-provider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
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
    </ThemeProvider>
  )
}
