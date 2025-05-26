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
import { Shield, ArrowLeft, AlertCircle, Loader2, CheckCircle, RefreshCw, User } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [apiTest, setApiTest] = useState<any>(null)
  const [debugInfo, setDebugInfo] = useState<string[]>([])
  const { user, login } = useAuth()
  const router = useRouter()

  const addDebugInfo = (message: string) => {
    console.log(message)
    setDebugInfo((prev) => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${message}`])
  }

  // Test API endpoints
  const testAPI = async () => {
    try {
      addDebugInfo("🧪 Testing API endpoints...")

      // Test basic API
      const helloResponse = await fetch("/api/hello")
      const helloData = await helloResponse.json()

      // Test auth API
      const authResponse = await fetch("/api/auth-test")
      const authData = await authResponse.json()

      setApiTest({
        success: true,
        hello: { status: helloResponse.status, data: helloData },
        auth: { status: authResponse.status, data: authData },
      })
      addDebugInfo("✅ API tests completed successfully")
    } catch (error) {
      addDebugInfo(`💥 API test failed: ${error}`)
      setApiTest({ success: false, error: String(error) })
    }
  }

  useEffect(() => {
    testAPI()
  }, [])

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      addDebugInfo(`✅ User authenticated: ${user.name} (${user.role})`)
      switch (user.role) {
        case "ethics_officer":
          addDebugInfo("🔄 Redirecting to Ethics Officer portal...")
          router.push("/ethics-officer")
          break
        case "investigator":
          addDebugInfo("🔄 Redirecting to Investigator portal...")
          router.push("/investigator")
          break
        case "admin":
          addDebugInfo("🔄 Redirecting to Admin dashboard...")
          router.push("/dashboard")
          break
        default:
          addDebugInfo("🔄 Redirecting to default dashboard...")
          router.push("/dashboard")
      }
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    addDebugInfo(`📝 Manual login attempt for: ${email}`)
    const result = await login(email, password)

    if (!result.success) {
      setError(result.error || "Login failed")
      addDebugInfo(`❌ Login failed: ${result.error}`)
    } else {
      addDebugInfo("✅ Manual login successful")
    }

    setLoading(false)
  }

  const quickLogin = async (userEmail: string, userPassword: string, roleName: string) => {
    addDebugInfo(`🚀 Quick login clicked: ${roleName}`)
    setEmail(userEmail)
    setPassword(userPassword)
    setError("")
    setLoading(true)

    addDebugInfo(`📧 Setting credentials: ${userEmail}`)

    // Auto-submit after setting credentials
    setTimeout(async () => {
      addDebugInfo("🔐 Starting quick login authentication...")
      const result = await login(userEmail, userPassword)

      if (!result.success) {
        setError(result.error || "Login failed")
        addDebugInfo(`❌ Quick login failed: ${result.error}`)
      } else {
        addDebugInfo(`✅ Quick login successful for ${roleName}`)
      }

      setLoading(false)
    }, 100)
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

          {/* Debug Info */}
          {debugInfo.length > 0 && (
            <Card className="mb-6 border-0 shadow-lg bg-gray-50">
              <CardHeader>
                <CardTitle className="text-sm">Debug Log</CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-1">
                {debugInfo.map((info, index) => (
                  <div key={index} className="text-gray-700">
                    {info}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* API Test Status */}
          <Card className="mb-6 border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-sm">
                {apiTest?.success ? (
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
            <CardContent className="text-sm space-y-1">
              {apiTest ? (
                apiTest.success ? (
                  <>
                    <div className="text-green-600">✅ Hello API: {apiTest.hello?.status}</div>
                    <div className="text-green-600">✅ Auth API: {apiTest.auth?.status}</div>
                    <div className="text-xs text-gray-500">
                      <Link href="/test-api" className="underline">
                        View detailed API tests
                      </Link>
                    </div>
                  </>
                ) : (
                  <div className="text-red-600">❌ API Error: {apiTest.error}</div>
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
              <CardDescription className="text-blue-700">Click to auto-login with test credentials</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start hover:bg-green-50 hover:border-green-300"
                onClick={() => quickLogin("jane.doe@company.com", "ethics123", "Ethics Officer")}
                disabled={loading}
              >
                <User className="h-4 w-4 mr-3 text-green-600" />
                <div className="text-left">
                  <div className="font-semibold text-green-900">Ethics Officer</div>
                  <div className="text-sm text-green-700">jane.doe@company.com</div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start hover:bg-purple-50 hover:border-purple-300"
                onClick={() => quickLogin("john.smith@company.com", "investigate123", "Investigator")}
                disabled={loading}
              >
                <User className="h-4 w-4 mr-3 text-purple-600" />
                <div className="text-left">
                  <div className="font-semibold text-purple-900">Investigator</div>
                  <div className="text-sm text-purple-700">john.smith@company.com</div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start hover:bg-blue-50 hover:border-blue-300"
                onClick={() => quickLogin("admin@company.com", "admin123", "Admin")}
                disabled={loading}
              >
                <User className="h-4 w-4 mr-3 text-blue-600" />
                <div className="text-left">
                  <div className="font-semibold text-blue-900">Admin</div>
                  <div className="text-sm text-blue-700">admin@company.com</div>
                </div>
              </Button>
            </CardContent>
          </Card>

          {/* Instructions */}
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
