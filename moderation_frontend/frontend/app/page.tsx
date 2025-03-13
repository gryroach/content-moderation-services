import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Shield } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <Shield className="h-16 w-16 text-primary mb-6" />
      <h1 className="text-4xl font-bold mb-4">Content Moderation System</h1>
      <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
        A dedicated platform for moderating user-generated content, ensuring community guidelines are followed.
      </p>
      <div className="flex gap-4">
        <Link href="/movies">
          <Button size="lg">Browse Movies</Button>
        </Link>
        <Link href="/moderation/login">
          <Button size="lg" variant="outline">
            Access Moderation Panel
          </Button>
        </Link>
      </div>
    </div>
  )
}

