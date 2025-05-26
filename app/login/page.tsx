"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, ArrowLeft, AlertCircle, Loader2, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [healthCheck, setHealthCheck] = useState<any>(null)
  const { data: session, status } = useSession()
  const router = useRouter()

  // Health check on mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch("/api/auth/health")
        const data = await response.json()
        setHealthCheck(data)
      } catch (error) {
        setHealthCheck({ status: "error", error: "Cannot reach auth API" })
      }
    }
    checkHealth()
  }, [])

  // Redirect if authenticated
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const role = (session.user as any).role
      switch (role) {
        case "ethics_officer":
          router.push("/ethics-officer")
          break
        case "investigator":
          router.push("/investigator")
          break
        case "admin":
          router.push("/dashboard")
          break
        default:
          router.push("/dashboard")
      }
    }
  }, [session, status, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password")
      } else if (result?.ok) {
        // Success - useEffect will handle redirect
      }
    } catch (error) {
      setError("Login failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Home</span>
          </Link>
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">Aegis Login</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Staff Portal Login</h1>
            <p className="text-gray-600">Access your secure portal</p>
          </div>

          {/* Health Check Status */}
          {healthCheck && (
            <Card className="mb-6 border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-sm">
                  {healthCheck.status === "ok" ? (
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600 mr-2" />
                  )}
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <div className={healthCheck.status === "ok" ? "text-green-600" : "text-red-600"}>
                  API: {healthCheck.status}
                </div>
                {healthCheck.nextauth && (
                  <>
                    <div className={healthCheck.nextauth.secret === "configured" ? "text-green-600" : "text-red-600"}>
                      Secret: {healthCheck.nextauth.secret}
                    </div>
                    <div className="text-gray-600">URL: {healthCheck.nextauth.url}</div>
                  </>
                )}
                {healthCheck.error && <div className="text-red-600">Error: {healthCheck.error}</div>}
              </CardContent>
            </Card>
          )}

          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle>Sign In</CardTitle>
              <CardDescription>Enter your credentials</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                {error && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Demo Credentials */}
          <Card className="mt-6 border-0 shadow-lg bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-900">Demo Credentials</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <strong>Ethics Officer:</strong> jane.doe@company.com / ethics123
              </div>
              <div>
                <strong>Investigator:</strong> john.smith@company.com / investigate123
              </div>
              <div>
                <strong>Admin:</strong> admin@company.com / admin123
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
