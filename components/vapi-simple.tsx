"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Phone, PhoneOff, AlertCircle, Loader2 } from "lucide-react"

const VAPI_PUBLIC_KEY = "4669de51-f9ba-4e99-a9dd-e39279a6f510"
const VAPI_AGENT_ID = "bb8029bb-dde6-485a-9c32-d41b684568ff"

interface VapiSimpleProps {
  onTranscript?: (transcript: string) => void
  onCallEnd?: () => void
}

export function VapiSimple({ onTranscript, onCallEnd }: VapiSimpleProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [vapiClient, setVapiClient] = useState<any>(null)

  useEffect(() => {
    const initVapi = async () => {
      try {
        // Load VAPI via script tag with better error handling
        if (!window.Vapi) {
          await new Promise((resolve, reject) => {
            const script = document.createElement("script")
            script.src = "https://cdn.jsdelivr.net/npm/@vapi-ai/web@latest/dist/index.js"
            script.onload = resolve
            script.onerror = reject
            document.head.appendChild(script)
          })
        }

        if (window.Vapi) {
          const client = new window.Vapi(VAPI_PUBLIC_KEY)

          client.on("call-start", () => {
            setIsConnected(true)
            setIsLoading(false)
            setError("")
          })

          client.on("call-end", () => {
            setIsConnected(false)
            setIsLoading(false)
            onCallEnd?.()
          })

          client.on("message", (message: any) => {
            if (message.type === "transcript" && message.transcript) {
              onTranscript?.(message.transcript)
            }
          })

          client.on("error", (err: any) => {
            setError(err.message || "Call failed")
            setIsConnected(false)
            setIsLoading(false)
          })

          setVapiClient(client)
        }
      } catch (err) {
        setError("Failed to initialize VAPI")
        console.error("VAPI init error:", err)
      }
    }

    initVapi()
  }, [onTranscript, onCallEnd])

  const startCall = async () => {
    if (!vapiClient) {
      setError("VAPI not ready")
      return
    }

    try {
      setIsLoading(true)
      setError("")

      await vapiClient.start({
        assistantId: VAPI_AGENT_ID,
      })
    } catch (err: any) {
      setError(err.message || "Failed to start call")
      setIsLoading(false)
    }
  }

  const endCall = () => {
    if (vapiClient && isConnected) {
      vapiClient.stop()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Simple Voice Assistant</CardTitle>
        <CardDescription>Simplified VAPI integration</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <Badge variant={isConnected ? "default" : "secondary"}>
            {isConnected ? "🟢 Connected" : isLoading ? "🟡 Connecting..." : "⚪ Ready"}
          </Badge>
        </div>

        {error && (
          <div className="text-red-600 text-sm text-center">
            <AlertCircle className="h-4 w-4 inline mr-1" />
            {error}
          </div>
        )}

        <div className="flex justify-center">
          {!isConnected ? (
            <Button onClick={startCall} disabled={isLoading || !vapiClient} size="lg">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Phone className="h-4 w-4 mr-2" />
                  Start Call
                </>
              )}
            </Button>
          ) : (
            <Button onClick={endCall} variant="destructive" size="lg">
              <PhoneOff className="h-4 w-4 mr-2" />
              End Call
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
