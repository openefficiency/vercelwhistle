"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, Loader2, RefreshCw } from "lucide-react"

export function VapiDebug() {
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<any>(null)

  const testVapi = async () => {
    setTesting(true)
    setResult(null)

    try {
      const response = await fetch("/api/test-vapi")
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        error: "Failed to test VAPI connection",
        details: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setTesting(false)
    }
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-orange-600" />
          <span>VAPI Connection Test</span>
        </CardTitle>
        <CardDescription>Test your VAPI credentials and agent configuration</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={testVapi} disabled={testing} className="w-full">
          {testing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Testing Connection...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Test VAPI Connection
            </>
          )}
        </Button>

        {result && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              {result.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              <span className={`font-medium ${result.success ? "text-green-900" : "text-red-900"}`}>
                {result.success ? "Connection Successful" : "Connection Failed"}
              </span>
            </div>

            {result.tests && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Test Results:</h4>
                {Object.entries(result.tests).map(([test, status]) => (
                  <div key={test} className="flex justify-between items-center text-sm">
                    <span className="capitalize">{test.replace(/([A-Z])/g, " $1")}</span>
                    <Badge variant={status === "✅ Passed" ? "default" : "destructive"}>{status}</Badge>
                  </div>
                ))}
              </div>
            )}

            {result.data && (
              <div className="bg-gray-50 p-3 rounded text-sm">
                <p>
                  <strong>Assistants found:</strong> {result.data.assistantCount}
                </p>
                <p>
                  <strong>Your agent found:</strong> {result.data.ourAgentFound ? "Yes" : "No"}
                </p>
                {result.data.agentDetails && (
                  <p>
                    <strong>Agent name:</strong> {result.data.agentDetails.name}
                  </p>
                )}
              </div>
            )}

            {result.troubleshooting && (
              <div className="bg-orange-50 p-3 rounded border border-orange-200">
                <h4 className="font-medium text-orange-900 mb-2">Troubleshooting:</h4>
                <ul className="text-sm text-orange-800 space-y-1">
                  {result.troubleshooting.suggestions.map((suggestion: string, index: number) => (
                    <li key={index}>• {suggestion}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.error && (
              <div className="bg-red-50 p-3 rounded border border-red-200">
                <p className="text-red-900 font-medium">{result.error}</p>
                {result.details && <p className="text-red-700 text-sm mt-1">{result.details}</p>}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
