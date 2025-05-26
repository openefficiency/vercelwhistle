"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Phone, PhoneOff, Mic, MicOff, AlertCircle, Loader2 } from "lucide-react"

const VAPI_PUBLIC_KEY = "4669de51-f9ba-4e99-a9dd-e39279a6f510"
const VAPI_AGENT_ID = "bb8029bb-dde6-485a-9c32-d41b684568ff"

interface VapiWebClientProps {
  onTranscript?: (transcript: string) => void
  onCallStart?: () => void
  onCallEnd?: () => void
}

declare global {
  interface Window {
    Vapi: any
  }
}

export function VapiWebClient({ onTranscript, onCallStart, onCallEnd }: VapiWebClientProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState("")
  const [isMuted, setIsMuted] = useState(false)
  const [vapiReady, setVapiReady] = useState(false)
  const [transcript, setTranscript] = useState("")

  const vapiRef = useRef<any>(null)
  const retryCountRef = useRef(0)
  const maxRetries = 3

  // Load VAPI SDK
  useEffect(() => {
    const loadVapi = async () => {
      try {
        if (!window.Vapi) {
          console.log("🔄 Loading VAPI SDK...")

          const script = document.createElement("script")
          script.src = "https://cdn.jsdelivr.net/npm/@vapi-ai/web@latest/dist/index.js"
          script.crossOrigin = "anonymous"

          await new Promise((resolve, reject) => {
            script.onload = resolve
            script.onerror = reject
            document.head.appendChild(script)
          })

          // Wait for VAPI to be available
          let attempts = 0
          while (!window.Vapi && attempts < 50) {
            await new Promise((resolve) => setTimeout(resolve, 100))
            attempts++
          }
        }

        if (window.Vapi) {
          console.log("✅ VAPI SDK loaded successfully")
          initializeVapi()
        } else {
          throw new Error("VAPI not available after loading")
        }
      } catch (error) {
        console.error("❌ Failed to load VAPI SDK:", error)
        setError("Failed to load voice assistant. Please refresh the page and try again.")
      }
    }

    const initializeVapi = () => {
      try {
        console.log("🔧 Initializing VAPI client...")

        const vapi = new window.Vapi(VAPI_PUBLIC_KEY)

        vapi.on("call-start", () => {
          console.log("✅ Call started")
          setIsConnected(true)
          setIsConnecting(false)
          setError("")
          onCallStart?.()
        })

        vapi.on("call-end", () => {
          console.log("📞 Call ended")
          setIsConnected(false)
          setIsConnecting(false)
          onCallEnd?.()
        })

        vapi.on("speech-start", () => {
          console.log("🎤 Speech started")
        })

        vapi.on("speech-end", () => {
          console.log("🔇 Speech ended")
        })

        vapi.on("message", (message: any) => {
          console.log("💬 Message received:", message)

          if (message.type === "transcript" && message.transcript) {
            const newTranscript = message.transcript
            setTranscript((prev) => {
              const updated = prev + (prev ? " " : "") + newTranscript
              onTranscript?.(updated)
              return updated
            })
          }
        })

        vapi.on("error", (error: any) => {
          console.error("❌ VAPI error:", error)
          setError(`Call failed: ${error.message || "Unknown error"}`)
          setIsConnected(false)
          setIsConnecting(false)
        })

        vapiRef.current = vapi
        setVapiReady(true)
        console.log("✅ VAPI client ready")
      } catch (error) {
        console.error("❌ Failed to initialize VAPI:", error)
        setError("Failed to initialize voice assistant")
      }
    }

    loadVapi()
  }, [onTranscript, onCallStart, onCallEnd])

  const startCall = async () => {
    if (!vapiRef.current || !vapiReady) {
      setError("Voice assistant not ready. Please refresh the page.")
      return
    }

    try {
      setIsConnecting(true)
      setError("")
      setTranscript("")

      console.log("🚀 Starting call with agent:", VAPI_AGENT_ID)

      await vapiRef.current.start({
        assistantId: VAPI_AGENT_ID,
        assistantOverrides: {
          variableValues: {
            platform: "aegis",
            reportType: "whistleblower",
          },
        },
      })

      console.log("✅ Call start request sent")
    } catch (error: any) {
      console.error("❌ Failed to start call:", error)
      setError(`Failed to start call: ${error.message || "Unknown error"}`)
      setIsConnecting(false)

      if (retryCountRef.current < maxRetries) {
        retryCountRef.current++
        console.log(`🔄 Retrying call (attempt ${retryCountRef.current}/${maxRetries})...`)
        setTimeout(() => startCall(), 2000)
      }
    }
  }

  const endCall = () => {
    if (vapiRef.current && isConnected) {
      try {
        console.log("🛑 Ending call")
        vapiRef.current.stop()
      } catch (error) {
        console.error("❌ Error ending call:", error)
      }
    }
    setIsConnected(false)
    setIsConnecting(false)
    retryCountRef.current = 0
  }

  const toggleMute = () => {
    if (vapiRef.current && isConnected) {
      try {
        if (isMuted) {
          vapiRef.current.unmute()
        } else {
          vapiRef.current.mute()
        }
        setIsMuted(!isMuted)
      } catch (error) {
        console.error("❌ Error toggling mute:", error)
      }
    }
  }

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center space-x-2">
          <Phone className="h-6 w-6 text-blue-600" />
          <span>AI Voice Assistant</span>
          {!vapiReady && <Loader2 className="h-4 w-4 animate-spin" />}
        </CardTitle>
        <CardDescription>
          {vapiReady ? "Ready to start your voice report" : "Loading voice assistant..."}
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
                    : vapiReady
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
                  : vapiReady
                    ? "⚪ Ready"
                    : "⏳ Loading..."}
          </Badge>
        </div>

        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-center space-x-4">
          {!isConnected ? (
            <Button onClick={startCall} disabled={isConnecting || !vapiReady} size="lg" className="px-8 py-4 text-lg">
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
            <div className="flex gap-3">
              <Button onClick={toggleMute} variant="outline" size="lg">
                {isMuted ? <MicOff className="h-5 w-5 mr-2" /> : <Mic className="h-5 w-5 mr-2" />}
                {isMuted ? "Unmute" : "Mute"}
              </Button>
              <Button onClick={endCall} variant="destructive" size="lg">
                <PhoneOff className="h-5 w-5 mr-2" />
                End Call
              </Button>
            </div>
          )}
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">How to use:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Click "Start Voice Call" to begin</li>
            <li>• Speak clearly about your concern</li>
            <li>• The AI will guide you through questions</li>
            <li>• Everything is transcribed automatically</li>
            <li>• Your conversation is secure and encrypted</li>
          </ul>
        </div>

        {transcript && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Live Transcript:</h4>
            <p className="text-sm text-gray-700">{transcript}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
