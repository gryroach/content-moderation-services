"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { getToken, saveToken, removeToken } from "@/lib/token-storage"

interface AuthContextType {
  token: string | null
  isAuthenticated: boolean
  login: (token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Загружаем токен при инициализации
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = getToken(false) // false = user token
      if (storedToken) {
        setToken(storedToken)
        setIsAuthenticated(true)
      }
    }
  }, [])

  const login = (newToken: string) => {
    if (typeof window !== "undefined") {
      saveToken(newToken, false) // false = user token
    }
    setToken(newToken)
    setIsAuthenticated(true)
  }

  const logout = () => {
    if (typeof window !== "undefined") {
      removeToken(false) // false = user token
    }
    setToken(null)
    setIsAuthenticated(false)
  }

  return <AuthContext.Provider value={{ token, isAuthenticated, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
