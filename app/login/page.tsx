"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, ArrowLeft, AlertCircle, Loader2, CheckCircle, RefreshCw } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)
  const { user, login } = useAuth()
  const router = useRouter()

  // Test API connection
  const testAPI = async () => {
    try {
      const response = await fetch("/api/test-auth")
      const data = await response.json()
      setTestResult({ success: true, data })
    } catch (error) {
      setTestResult({ success: false, error: String(error) })
    }
  }

  useEffect(() => {
    testAPI()
  }, [])

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      console.log("User authenticated, redirecting:", user.role)
      switch (user.role) {
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
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    console.log("Submitting login form...")
    const result = await login(email, password)

    if (!result.success) {
      setError(result.error || "Login failed")
    }

    setLoading(false)
  }

  const quickLogin = (userEmail: string, userPassword: string) => {
    setEmail(userEmail)
    setPassword(userPassword)
  }

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <CheckCircle className="h-8 w-8 mx-auto mb-4 text-green-600" />
          <p className="text-gray-600">Already logged in as {user.name}. Redirecting...</p>
        </div>
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

          {/* API Test Status */}
          <Card className="mb-6 border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-sm">
                {testResult?.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                )}
                API Status
                <Button variant="ghost" size="sm" onClick={testAPI} className="ml-auto">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              {testResult ? (
                testResult.success ? (
                  <div className="text-green-600">✅ API Working - {testResult.data.users.length} users available</div>
                ) : (
                  <div className="text-red-600">❌ API Error: {testResult.error}</div>
                )
              ) : (
                <div className="text-gray-600">Testing API...</div>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle>Sign In</CardTitle>
              <CardDescription>Enter your credentials to access your portal</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@company.com"
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
                    placeholder="Enter your password"
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

          {/* Quick Login Buttons */}
          <Card className="mt-6 border-0 shadow-lg bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-900">Quick Login (Demo)</CardTitle>
              <CardDescription className="text-blue-700">Click to auto-fill credentials</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => quickLogin("jane.doe@company.com", "ethics123")}
              >
                <div className="text-left">
                  <div className="font-semibold">Ethics Officer</div>
                  <div className="text-sm text-gray-600">jane.doe@company.com</div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => quickLogin("john.smith@company.com", "investigate123")}
              >
                <div className="text-left">
                  <div className="font-semibold">Investigator</div>
                  <div className="text-sm text-gray-600">john.smith@company.com</div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => quickLogin("admin@company.com", "admin123")}
              >
                <div className="text-left">
                  <div className="font-semibold">Admin</div>
                  <div className="text-sm text-gray-600">admin@company.com</div>
                </div>
              </Button>
            </CardContent>
          </Card>

          {/* Whistleblower Notice */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 mb-4">Are you a whistleblower looking to submit or track a report?</p>
            <div className="flex gap-3 justify-center">
              <Button asChild variant="outline">
                <Link href="/report">Submit Report</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/track-report">Track Report</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
