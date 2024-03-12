import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/header";
import "antd/dist/reset.css";
import { AntdRegistry } from "@ant-design/nextjs-registry";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Social Sentiment AI Comparison",
  description: "Compare social sentiment analysis tools",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <head>
        <link
          rel="icon"
          type="image/<generated>"
          href="/favicon.svg"
          sizes="<generated>"
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col">
        <AntdRegistry>
          <Providers>
            <Toaster />

            <Header />

            {children}
          </Providers>
        </AntdRegistry>
      </body>
    </html>
  );
}
