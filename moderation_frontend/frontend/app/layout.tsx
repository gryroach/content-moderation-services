import Navbar from "@/components/navbar"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/toaster"
import { AuthProvider } from "@/contexts/auth-context"
import { AlertCircle, PresentationIcon } from 'lucide-react'
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Link from "next/link"
import type React from "react"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Сервис модерации контента",
  description: "Платформа для модерации пользовательского контента",
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <div className="flex items-center px-4 py-2 border-b">
                <div className="flex items-center gap-4 ml-auto">
                  <Link
                    href="/demo"
                    className="flex items-center gap-2 text-foreground hover:text-foreground/80 transition-colors"
                  >
                    <AlertCircle className="h-5 w-5" />
                    <span className="text-sm">Демо</span>
                  </Link>
                  
                  <Link
                    href="/presentation"
                    className="flex items-center gap-2 text-foreground hover:text-foreground/80 transition-colors"
                  >
                    <PresentationIcon className="h-5 w-5" />
                    <span className="text-sm">Презентация</span>
                  </Link>
                </div>
              </div>
              <main className="flex-1 container mx-auto py-6 px-4">{children}</main>
              <footer className="border-t py-4 text-center text-sm text-muted-foreground">
                <div className="container mx-auto">
                  © {new Date().getFullYear()} Сервис модерации контента
                </div>
              </footer>
            </div>
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

import "./globals.css"



import './globals.css'
