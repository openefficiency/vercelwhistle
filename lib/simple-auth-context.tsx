"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

interface User {
  id: string
  email: string
  name: string
  role: string
  department: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function SimpleAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      console.log("🔍 Checking authentication...")
      const response = await fetch("/api/simple-me")

      if (!response.ok) {
        console.log("❌ Auth check failed:", response.status)
        setUser(null)
        return
      }

      const data = await response.json()
      console.log("📋 Auth check response:", data)
      setUser(data.user)
    } catch (error) {
      console.error("💥 Auth check error:", error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log("🔐 Attempting login for:", email)

      const response = await fetch("/api/simple-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()
      console.log("📋 Login response:", response.status, data)

      if (response.ok && data.success) {
        setUser(data.user)
        return { success: true }
      } else {
        return { success: false, error: data.error || "Login failed" }
      }
    } catch (error) {
      console.error("💥 Login error:", error)
      return { success: false, error: "Network error" }
    }
  }

  const logout = async () => {
    try {
      console.log("🚪 Logging out...")
      await fetch("/api/simple-logout", { method: "POST" })
      setUser(null)
      console.log("✅ Logout successful")
    } catch (error) {
      console.error("💥 Logout error:", error)
      setUser(null) // Clear user anyway
    }
  }

  return <AuthContext.Provider value={{ user, login, logout, loading }}>{children}</AuthContext.Provider>
}

export function useSimpleAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useSimpleAuth must be used within a SimpleAuthProvider")
  }
  return context
}
