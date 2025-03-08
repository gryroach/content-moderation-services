"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { getToken, saveToken, removeToken } from "@/lib/token-storage"

interface ModerationAuthContextType {
  token: string | null
  isAuthenticated: boolean
  login: (token: string) => void
  logout: () => void
}

const ModerationAuthContext = createContext<ModerationAuthContextType | undefined>(undefined)

export function ModerationAuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Загружаем токен при инициализации
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = getToken(true) // true = moderator token
      if (storedToken) {
        setToken(storedToken)
        setIsAuthenticated(true)
      }
    }
  }, [])

  const login = (newToken: string) => {
    if (typeof window !== "undefined") {
      saveToken(newToken, true) // true = moderator token
    }
    setToken(newToken)
    setIsAuthenticated(true)
  }

  const logout = () => {
    if (typeof window !== "undefined") {
      removeToken(true) // true = moderator token
    }
    setToken(null)
    setIsAuthenticated(false)
  }

  return (
    <ModerationAuthContext.Provider value={{ token, isAuthenticated, login, logout }}>
      {children}
    </ModerationAuthContext.Provider>
  )
}

export function useModerationAuth() {
  const context = useContext(ModerationAuthContext)
  if (context === undefined) {
    throw new Error("useModerationAuth must be used within a ModerationAuthProvider")
  }
  return context
}
