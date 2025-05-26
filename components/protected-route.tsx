"use client"

import type React from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Loader2, Shield, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
  redirectTo?: string
}

export function ProtectedRoute({ children, allowedRoles, redirectTo = "/login" }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [showError, setShowError] = useState(false)

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.push(redirectTo)
      return
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      setShowError(true)
      return
    }
  }, [user, loading, router, allowedRoles, redirectTo])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 mb-4">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  if (showError || (allowedRoles && !allowedRoles.includes(user.role))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-600" />
            <CardTitle className="text-red-900">Access Denied</CardTitle>
            <CardDescription>You don't have permission to access this portal</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-700">This portal is restricted to authorized personnel only.</p>
            <div className="flex flex-col gap-3">
              <Button asChild>
                <Link href="/login">Try Different Account</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/">Return to Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
