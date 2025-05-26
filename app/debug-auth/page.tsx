"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DebugAuthPage() {
  const [results, setResults] = useState<any>({})

  const testEndpoint = async (endpoint: string) => {
    try {
      const response = await fetch(endpoint)
      const data = await response.text()

      setResults((prev) => ({
        ...prev,
        [endpoint]: {
          status: response.status,
          headers: Object.fromEntries(response.headers.entries()),
          body: data.substring(0, 500) + (data.length > 500 ? "..." : ""),
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
          <CardTitle>NextAuth Debug</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-x-2">
            <Button onClick={() => testEndpoint("/api/auth/health")}>Test Health</Button>
            <Button onClick={() => testEndpoint("/api/auth/providers")}>Test Providers</Button>
            <Button onClick={() => testEndpoint("/api/auth/session")}>Test Session</Button>
          </div>

          <div className="space-y-4">
            {Object.entries(results).map(([endpoint, result]: [string, any]) => (
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
