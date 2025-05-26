"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Phone, PhoneOff, AlertCircle, Loader2, ExternalLink } from "lucide-react"

const VAPI_PUBLIC_KEY = "4669de51-f9ba-4e99-a9dd-e39279a6f510"
const VAPI_AGENT_ID = "bb8029bb-dde6-485a-9c32-d41b684568ff"

interface VapiDirectProps {
  onTranscript?: (transcript: string) => void
  onCallEnd?: () => void
}

declare global {
  interface Window {
    Vapi: any
  }
}

export function VapiDirect({ onTranscript, onCallEnd }: VapiDirectProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState("")
  const [vapiClient, setVapiClient] = useState<any>(null)
  const [transcript, setTranscript] = useState("")

  useEffect(() => {
    let mounted = true

    const loadVapi = async () => {
      try {
        // Check if already loaded
        if (window.Vapi) {
          if (mounted) initVapi()
          return
        }

        console.log("🔄 Loading VAPI SDK...")

        // Create script element
        const script = document.createElement("script")
        script.src = "https://cdn.jsdelivr.net/npm/@vapi-ai/web@latest/dist/index.js"
        script.async = true
        script.crossOrigin = "anonymous"

        // Promise-based loading
        await new Promise<void>((resolve, reject) => {
          script.onload = () => {
            console.log("✅ VAPI SDK loaded")
            // Give it a moment to initialize
            setTimeout(() => {
              if (window.Vapi && mounted) {
                initVapi()
                resolve()
              } else {
                reject(new Error("VAPI not available after load"))
              }
            }, 500)
          }

          script.onerror = () => {
            console.error("❌ Failed to load VAPI SDK")
            reject(new Error("Failed to load VAPI SDK"))
          }

          document.head.appendChild(script)
        })
      } catch (error) {
        console.error("❌ VAPI loading error:", error)
        if (mounted) {
          setError("Failed to load voice assistant. Please refresh and try again.")
        }
      }
    }

    const initVapi = () => {
      try {
        console.log("🔧 Initializing VAPI client...")

        const client = new window.Vapi(VAPI_PUBLIC_KEY)

        // Set up event listeners
        client.on("call-start", () => {
          console.log("📞 Call started")
          if (mounted) {
            setIsConnected(true)
            setIsConnecting(false)
            setError("")
          }
        })

        client.on("call-end", () => {
          console.log("📞 Call ended")
          if (mounted) {
            setIsConnected(false)
            setIsConnecting(false)
            onCallEnd?.()
          }
        })

        client.on("message", (message: any) => {
          console.log("💬 VAPI message:", message.type, message)

          if (message.type === "transcript" && message.transcript) {
            const newText = message.transcript
            if (mounted) {
              setTranscript((prev) => {
                const updated = prev + (prev ? " " : "") + newText
                onTranscript?.(updated)
                return updated
              })
            }
          }
        })

        client.on("error", (error: any) => {
          console.error("❌ VAPI error:", error)
          if (mounted) {
            setError(`Call error: ${error.message || "Connection failed"}`)
            setIsConnected(false)
            setIsConnecting(false)
          }
        })

        if (mounted) {
          setVapiClient(client)
          console.log("✅ VAPI client ready")
        }
      } catch (error) {
        console.error("❌ VAPI init error:", error)
        if (mounted) {
          setError("Failed to initialize voice assistant")
        }
      }
    }

    loadVapi()

    return () => {
      mounted = false
    }
  }, [onTranscript, onCallEnd])

  const startCall = async () => {
    if (!vapiClient) {
      setError("Voice assistant not ready. Please refresh the page.")
      return
    }

    try {
      setIsConnecting(true)
      setError("")
      setTranscript("")

      console.log("🚀 Starting VAPI call...")

      // Start the call with minimal config
      await vapiClient.start({
        assistantId: VAPI_AGENT_ID,
      })

      console.log("✅ Call start request sent")
    } catch (error: any) {
      console.error("❌ Call start error:", error)
      setError(`Failed to start call: ${error.message || "Unknown error"}`)
      setIsConnecting(false)
    }
  }

  const endCall = () => {
    if (vapiClient && isConnected) {
      try {
        console.log("🛑 Ending call")
        vapiClient.stop()
      } catch (error) {
        console.error("❌ Error ending call:", error)
      }
    }
  }

  const openVapiDashboard = () => {
    window.open(`https://dashboard.vapi.ai/assistant/${VAPI_AGENT_ID}`, "_blank")
  }

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center space-x-2">
          <Phone className="h-6 w-6 text-blue-600" />
          <span>Voice Assistant</span>
        </CardTitle>
        <CardDescription>
          {vapiClient ? "Ready to start your voice report" : "Loading voice assistant..."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <Badge
            variant={
              isConnected
                ? "default"
                : isConnecting
                  ? "secondary"
                  : error
                    ? "destructive"
                    : vapiClient
                      ? "outline"
                      : "secondary"
            }
            className="text-lg px-4 py-2"
          >
            {isConnected
              ? "🟢 Connected - Speak Now"
              : isConnecting
                ? "🟡 Connecting..."
                : error
                  ? "❌ Error"
                  : vapiClient
                    ? "⚪ Ready"
                    : "⏳ Loading..."}
          </Badge>
        </div>

        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
              <div className="mt-2">
                <Button variant="outline" size="sm" onClick={openVapiDashboard} className="mr-2">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Test in VAPI Dashboard
                </Button>
                <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                  Refresh Page
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-center space-x-4">
          {!isConnected ? (
            <Button onClick={startCall} disabled={isConnecting || !vapiClient} size="lg" className="px-8 py-4 text-lg">
              {isConnecting ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Phone className="h-5 w-5 mr-2" />
                  Start Voice Call
                </>
              )}
            </Button>
          ) : (
            <Button onClick={endCall} variant="destructive" size="lg">
              <PhoneOff className="h-5 w-5 mr-2" />
              End Call
            </Button>
          )}
        </div>

        {transcript && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Live Transcript:</h4>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{transcript}</p>
          </div>
        )}

        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Instructions:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Click "Start Voice Call" to begin</li>
            <li>• Allow microphone access when prompted</li>
            <li>• Speak clearly about your concern</li>
            <li>• The AI will guide you through questions</li>
            <li>• Your conversation is secure and encrypted</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
