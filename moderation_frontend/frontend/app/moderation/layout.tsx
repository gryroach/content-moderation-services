import type { ReactNode } from "react"
import { ModerationAuthProvider } from "@/contexts/moderation-auth-context"
import ModerationNavbar from "@/components/moderation/moderation-navbar"

export default function ModerationLayout({ children }: { children: ReactNode }) {
  return (
    <ModerationAuthProvider>
      <div className="flex min-h-screen flex-col">
        <ModerationNavbar />
        <main className="flex-1 container mx-auto py-6 px-4">{children}</main>
        <footer className="border-t py-4 text-center text-sm text-muted-foreground">
          <div className="container mx-auto">Content Moderation System &copy; {new Date().getFullYear()}</div>
        </footer>
      </div>
    </ModerationAuthProvider>
  )
}

