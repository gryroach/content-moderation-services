"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useModerationAuth } from "@/contexts/moderation-auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { LogIn, Shield } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getToken } from "@/lib/token-storage"

export default function ModeratorLoginPage() {
  const [token, setToken] = useState("")
  const [error, setError] = useState<string | null>(null)
  const { login, isAuthenticated } = useModerationAuth()
  const router = useRouter()

  // Если токен уже есть, заполняем поле автоматически
  useEffect(() => {
    const savedToken = getToken(true) // true = moderator token
    if (savedToken) {
      setToken(savedToken)
    }
  }, [])

  // Если модератор уже аутентифицирован, перенаправляем на страницу модерации
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/moderation/reviews")
    }
  }, [isAuthenticated, router])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!token.trim()) {
      setError("Please enter a valid JWT token")
      return
    }

    try {
      login(token.trim())
      router.push("/moderation/reviews")
    } catch (err) {
      setError("Failed to authenticate. Please check your token and try again.")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <Shield className="h-10 w-10 text-primary mr-2" />
          <h1 className="text-2xl font-bold">Content Moderation System</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Moderator Login</CardTitle>
            <CardDescription>Enter your JWT token to access the moderation panel</CardDescription>
          </CardHeader>

          {error && (
            <CardContent className="pt-0">
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </CardContent>
          )}

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="token">JWT Token</Label>
                <Input
                  id="token"
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Enter your JWT token"
                  required
                />
              </div>
              <p className="text-sm text-muted-foreground">
                This token is provided by your administrator and grants access to the moderation system.
              </p>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full flex items-center justify-center gap-2">
                <LogIn className="h-4 w-4" />
                <span>Login as Moderator</span>
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
