"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useModerationAuth } from "@/contexts/moderation-auth-context"
import { Button } from "@/components/ui/button"
import { Shield, LogOut, LogIn } from "lucide-react"

export default function ModerationNavbar() {
  const pathname = usePathname()
  const { isAuthenticated, logout } = useModerationAuth()

  // Only show navbar on moderation pages
  if (!pathname.startsWith("/moderation")) {
    return null
  }

  return (
    <header className="border-b bg-muted/40">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/moderation/reviews" className="flex items-center gap-2 font-semibold">
            <Shield className="h-5 w-5" />
            <span>Content Moderation</span>
          </Link>
          {isAuthenticated && (
            <nav className="hidden md:flex gap-6">
              <Link
                href="/moderation/reviews"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname.includes("/moderation/reviews") ? "text-primary" : "text-muted-foreground"
                }`}
              >
                Reviews
              </Link>
            </nav>
          )}
        </div>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Button variant="ghost" size="sm" onClick={logout} className="gap-2">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          ) : (
            <Link href="/moderation/login">
              <Button variant="ghost" size="sm" className="gap-2">
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Login</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
