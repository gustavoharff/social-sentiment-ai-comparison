"use client";

import { ConfigProvider } from "@/components/config-provider";
import { App } from "antd";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";

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
            style={{
              color: "inherit",
            }}
          >
            {children}
          </App>
        </ConfigProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
