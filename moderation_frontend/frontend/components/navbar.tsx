"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Film, Shield, LogOut, LogIn } from "lucide-react"

export default function Navbar() {
  const pathname = usePathname()
  const { isAuthenticated, logout } = useAuth()

  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Film className="h-5 w-5" />
            <span>Movie Moderation</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === "/" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Home
            </Link>
            <Link
              href="/movies"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname.startsWith("/movies") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Movies
            </Link>
            {isAuthenticated && (
              <Link
                href="/moderation"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname.startsWith("/moderation") ? "text-primary" : "text-muted-foreground"
                }`}
              >
                Moderation
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Button variant="ghost" size="sm" onClick={logout} className="gap-2">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          ) : (
            <Link href="/login">
              <Button variant="ghost" size="sm" className="gap-2">
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Login</span>
              </Button>
            </Link>
          )}
          {isAuthenticated && (
            <Link href="/moderation">
              <Button variant="outline" size="sm" className="gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Moderation Panel</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

