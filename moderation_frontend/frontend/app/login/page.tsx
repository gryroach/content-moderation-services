"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { LogIn } from "lucide-react"
import { getToken } from "@/lib/token-storage"

export default function LoginPage() {
  const [token, setToken] = useState("")
  const { login, isAuthenticated } = useAuth()
  const router = useRouter()

  // Если токен уже есть, заполняем поле автоматически
  useEffect(() => {
    const savedToken = getToken(false)
    if (savedToken) {
      setToken(savedToken)
    }
  }, [])

  // Если пользователь уже аутентифицирован, перенаправляем на главную
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, router])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (token.trim()) {
      login(token.trim())
      router.push("/moderation")
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>Enter your JWT token to access the moderation panel</CardDescription>
        </CardHeader>
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
              For development purposes, you can enter any string as a token.
            </p>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full flex items-center justify-center gap-2">
              <LogIn className="h-4 w-4" />
              <span>Login</span>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

