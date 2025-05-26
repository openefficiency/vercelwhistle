"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestAPIPage() {
  const [results, setResults] = useState<Record<string, any>>({})

  const testEndpoint = async (endpoint: string, method = "GET", body?: any) => {
    try {
      const options: RequestInit = { method }
      if (body) {
        options.headers = { "Content-Type": "application/json" }
        options.body = JSON.stringify(body)
      }

      const response = await fetch(endpoint, options)
      const data = await response.json()

      setResults((prev) => ({
        ...prev,
        [endpoint]: {
          status: response.status,
          ok: response.ok,
          data,
        },
      }))
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        [endpoint]: { error: String(error) },
      }))
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>API Test Page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button onClick={() => testEndpoint("/api/hello")}>Test /api/hello</Button>
            <Button onClick={() => testEndpoint("/api/auth-test")}>Test /api/auth-test</Button>
            <Button onClick={() => testEndpoint("/api/simple-login")}>Test /api/simple-login (GET)</Button>
            <Button
              onClick={() =>
                testEndpoint("/api/simple-login", "POST", { email: "jane.doe@company.com", password: "ethics123" })
              }
            >
              Test Login Jane
            </Button>
            <Button onClick={() => testEndpoint("/api/simple-me")}>Test /api/simple-me</Button>
            <Button onClick={() => testEndpoint("/api/simple-logout", "POST")}>Test Logout</Button>
          </div>

          <div className="space-y-4">
            {Object.entries(results).map(([endpoint, result]) => (
              <div key={endpoint} className="border p-4 rounded">
                <h3 className="font-bold">{endpoint}</h3>
                <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
