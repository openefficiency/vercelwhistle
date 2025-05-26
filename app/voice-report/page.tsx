"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Phone,
  PhoneOff,
  Shield,
  ArrowLeft,
  AlertCircle,
  Save,
  Edit3,
  Loader2,
  Volume2,
  VolumeX,
  Settings,
} from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { VapiDebug } from "@/components/vapi-debug"
import { VapiSimple } from "@/components/vapi-simple"

// VAPI Configuration
const VAPI_PUBLIC_KEY = "4669de51-f9ba-4e99-a9dd-e39279a6f510"
const VAPI_AGENT_ID = "bb8029bb-dde6-485a-9c32-d41b684568ff"

declare global {
  interface Window {
    Vapi: any
  }
}

export default function VoiceReportPage() {
  const [isConnected, setIsConnected] = useState(false)
  const [callStatus, setCallStatus] = useState<"idle" | "connecting" | "connected" | "ended" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [vapiClient, setVapiClient] = useState<any>(null)
  const [vapiLoaded, setVapiLoaded] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [callId, setCallId] = useState<string | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [volumeLevel, setVolumeLevel] = useState(0)
  const [conversationStarted, setConversationStarted] = useState(false)
  const [isEditingTranscript, setIsEditingTranscript] = useState(false)
  const [showDebug, setShowDebug] = useState(false)

  const transcriptRef = useRef<HTMLDivElement>(null)

  const retrySDKLoad = () => {
    setVapiLoaded(false)
    setErrorMessage("")
    setCallStatus("idle")

    // Remove any existing VAPI scripts
    const existingScripts = document.querySelectorAll('script[src*="vapi"]')
    existingScripts.forEach((script) => script.remove())

    // Clear window.Vapi if it exists
    if (window.Vapi) {
      delete window.Vapi
    }

    // Trigger reload
    window.location.reload()
  }

  const loadSDKManually = async () => {
    try {
      setErrorMessage("")
      console.log("🔄 Attempting manual VAPI SDK load...")

      // Try to load via dynamic import as fallback
      const vapiModule = await import("https://cdn.jsdelivr.net/npm/@vapi-ai/web@latest/dist/index.js")

      if (vapiModule && vapiModule.default) {
        window.Vapi = vapiModule.default
        setVapiLoaded(true)
        console.log("✅ VAPI SDK loaded manually")
      } else {
        throw new Error("VAPI module not found in import")
      }
    } catch (error) {
      console.error("❌ Manual VAPI SDK load failed:", error)
      setErrorMessage("Manual SDK loading failed. Please try refreshing the page or use the text form instead.")
    }
  }

  // Load VAPI SDK
  useEffect(() => {
    const loadVapiSDK = () => {
      // Check if VAPI is already loaded
      if (window.Vapi) {
        console.log("✅ VAPI already loaded")
        setVapiLoaded(true)
        return
      }

      console.log("🔄 Loading VAPI SDK...")

      // Try multiple CDN sources for better reliability
      const sdkSources = [
        "https://cdn.jsdelivr.net/npm/@vapi-ai/web@latest/dist/index.js",
        "https://unpkg.com/@vapi-ai/web@latest/dist/index.js",
        "https://cdn.skypack.dev/@vapi-ai/web@latest",
      ]

      const currentSourceIndex = 0

      const tryLoadSource = (sourceIndex: number) => {
        if (sourceIndex >= sdkSources.length) {
          console.error("❌ All VAPI SDK sources failed")
          setErrorMessage(
            "Failed to load VAPI SDK from all sources. Please check your internet connection and try again.",
          )
          setCallStatus("error")
          return
        }

        const script = document.createElement("script")
        script.src = sdkSources[sourceIndex]
        script.async = true
        script.crossOrigin = "anonymous"

        console.log(`🔄 Trying VAPI SDK source ${sourceIndex + 1}:`, script.src)

        script.onload = () => {
          console.log("✅ VAPI SDK loaded successfully from:", script.src)

          // Give it a moment to initialize
          setTimeout(() => {
            if (window.Vapi) {
              setVapiLoaded(true)
            } else {
              console.warn("⚠️ VAPI SDK loaded but window.Vapi not available, trying next source...")
              tryLoadSource(sourceIndex + 1)
            }
          }, 500)
        }

        script.onerror = (error) => {
          console.error(`❌ Failed to load VAPI SDK from source ${sourceIndex + 1}:`, error)
          document.head.removeChild(script)
          tryLoadSource(sourceIndex + 1)
        }

        document.head.appendChild(script)
      }

      tryLoadSource(0)
    }

    loadVapiSDK()
  }, [])

  // Initialize VAPI client when SDK is loaded
  useEffect(() => {
    if (!vapiLoaded || !window.Vapi) {
      console.log("VAPI not ready yet...")
      return
    }

    const initVAPI = async () => {
      try {
        console.log("Initializing VAPI client with public key:", VAPI_PUBLIC_KEY)

        // Create VAPI instance
        const vapi = new window.Vapi(VAPI_PUBLIC_KEY)

        // Set up event listeners
        vapi.on("call-start", () => {
          console.log("✅ VAPI call started")
          setCallStatus("connected")
          setIsConnected(true)
          setConversationStarted(true)
          setErrorMessage("")
        })

        vapi.on("call-end", () => {
          console.log("📞 VAPI call ended")
          setCallStatus("ended")
          setIsConnected(false)
          setConversationStarted(false)
          setCallId(null)
          setVolumeLevel(0)
        })

        vapi.on("speech-start", () => {
          console.log("🎤 User started speaking")
        })

        vapi.on("speech-end", () => {
          console.log("🔇 User stopped speaking")
        })

        vapi.on("message", (message: any) => {
          console.log("💬 VAPI message:", message)

          // Handle different message types
          if (message.type === "transcript" && message.transcript) {
            console.log("📝 Transcript received:", message.transcript)
            setTranscript((prev) => {
              const newTranscript = prev + (prev ? " " : "") + message.transcript
              // Auto-scroll to bottom
              setTimeout(() => {
                if (transcriptRef.current) {
                  transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight
                }
              }, 100)
              return newTranscript
            })
          }

          if (message.type === "function-call") {
            console.log("🔧 Function call:", message)
          }
        })

        vapi.on("error", (error: any) => {
          console.error("❌ VAPI error:", error)
          setErrorMessage(`VAPI error: ${error.message || error.toString()}`)
          setCallStatus("error")
          setIsConnected(false)
        })

        vapi.on("volume-level", (volume: number) => {
          setVolumeLevel(volume)
        })

        console.log("✅ VAPI client initialized successfully")
        setVapiClient(vapi)
      } catch (error) {
        console.error("❌ Failed to initialize VAPI:", error)
        setErrorMessage(`Failed to initialize VAPI: ${error instanceof Error ? error.message : "Unknown error"}`)
        setCallStatus("error")
      }
    }

    initVAPI()
  }, [vapiLoaded])

  const startVAPICall = async () => {
    if (!vapiClient) {
      setErrorMessage("VAPI client not ready. Please refresh the page and try again.")
      setCallStatus("error")
      return
    }

    try {
      console.log("🚀 Starting VAPI call with agent:", VAPI_AGENT_ID)
      setErrorMessage("")
      setCallStatus("connecting")
      setTranscript("") // Clear previous transcript

      // Start the call with your agent
      await vapiClient.start({
        assistantId: VAPI_AGENT_ID,
        // Optional: Add custom configuration
        assistantOverrides: {
          variableValues: {
            reportType: "whistleblower",
            platform: "aegis",
            userRole: "reporter",
          },
        },
      })

      console.log("✅ VAPI call start request sent")
    } catch (error) {
      console.error("❌ Failed to start VAPI call:", error)
      setErrorMessage(`Failed to start call: ${error instanceof Error ? error.message : "Unknown error"}`)
      setCallStatus("error")
    }
  }

  const endCall = () => {
    if (vapiClient && isConnected) {
      try {
        console.log("🛑 Ending VAPI call")
        vapiClient.stop()
      } catch (error) {
        console.error("❌ Error stopping VAPI call:", error)
      }
    }
    setCallStatus("ended")
    setIsConnected(false)
    setConversationStarted(false)
    setCallId(null)
    setVolumeLevel(0)
  }

  const toggleMute = () => {
    if (vapiClient && isConnected) {
      try {
        if (isMuted) {
          vapiClient.unmute()
        } else {
          vapiClient.mute()
        }
        setIsMuted(!isMuted)
      } catch (error) {
        console.error("Error toggling mute:", error)
      }
    }
  }

  const saveTranscript = () => {
    if (!transcript.trim()) {
      setErrorMessage("No transcript to save.")
      return
    }
    console.log("💾 Saving transcript:", transcript)
    // Here you would save to your backend
    alert("Transcript saved successfully!")
  }

  const submitReport = () => {
    if (!transcript.trim()) {
      setErrorMessage("No transcript to submit.")
      return
    }
    window.location.href = `/report?transcript=${encodeURIComponent(transcript)}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Home</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => setShowDebug(!showDebug)}>
              <Settings className="h-4 w-4 mr-2" />
              Debug
            </Button>
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">Aegis Voice Assistant</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">AI Voice Assistant</h1>
            <p className="text-lg text-gray-600">
              Speak directly with our AI assistant to submit your report. The conversation is secure, encrypted, and can
              be anonymous.
            </p>
          </div>

          {/* Debug Panel */}
          {showDebug && (
            <div className="mb-8">
              <VapiDebug />
            </div>
          )}

          {/* Error Alert */}
          {errorMessage && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{errorMessage}</AlertDescription>
            </Alert>
          )}

          {/* VAPI Status Alert */}
          {!vapiLoaded && callStatus !== "error" && (
            <Alert className="mb-6 border-blue-200 bg-blue-50">
              <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
              <AlertDescription className="text-blue-800">Loading voice assistant...</AlertDescription>
            </Alert>
          )}

          {/* SDK Loading Error with Retry Options */}
          {callStatus === "error" && !vapiLoaded && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <div className="space-y-3">
                  <p>{errorMessage}</p>
                  <div className="flex gap-2">
                    <Button onClick={retrySDKLoad} size="sm" variant="outline">
                      <Loader2 className="h-4 w-4 mr-2" />
                      Retry Loading
                    </Button>
                    <Button onClick={loadSDKManually} size="sm" variant="outline">
                      Try Manual Load
                    </Button>
                    <Button asChild size="sm">
                      <Link href="/report">Use Text Form</Link>
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Main Voice Assistant Card */}
          <Card className="border-0 shadow-xl mb-8">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center space-x-2">
                <Phone className="h-6 w-6 text-blue-600" />
                <span>Voice Assistant</span>
                {!vapiLoaded && <Loader2 className="h-4 w-4 animate-spin" />}
              </CardTitle>
              <CardDescription>
                {vapiLoaded ? "Click to start speaking with our AI assistant" : "Loading voice assistant..."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Call Status */}
              <div className="text-center">
                <div
                  className={`inline-flex items-center px-6 py-3 rounded-full text-lg font-medium ${
                    callStatus === "idle"
                      ? "bg-gray-100 text-gray-700"
                      : callStatus === "connecting"
                        ? "bg-yellow-100 text-yellow-700"
                        : callStatus === "connected"
                          ? "bg-green-100 text-green-700"
                          : callStatus === "error"
                            ? "bg-red-100 text-red-700"
                            : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {callStatus === "idle" && "Ready to connect"}
                  {callStatus === "connecting" && "Connecting to AI assistant..."}
                  {callStatus === "connected" && "🟢 Connected - Speak freely"}
                  {callStatus === "ended" && "Call ended"}
                  {callStatus === "error" && "❌ Connection failed"}
                </div>
              </div>

              {/* Voice Visualization */}
              <div className="flex justify-center">
                <div
                  className={`w-40 h-40 rounded-full border-4 flex items-center justify-center transition-all duration-300 ${
                    isConnected
                      ? volumeLevel > 0.1
                        ? "border-green-500 bg-green-50 scale-110"
                        : "border-blue-500 bg-blue-50"
                      : callStatus === "connecting"
                        ? "border-yellow-500 bg-yellow-50"
                        : callStatus === "error"
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300 bg-gray-50"
                  }`}
                  style={{
                    transform: isConnected && volumeLevel > 0.1 ? `scale(${1 + volumeLevel * 0.2})` : undefined,
                  }}
                >
                  {callStatus === "error" ? (
                    <AlertCircle className="h-16 w-16 text-red-500" />
                  ) : callStatus === "connecting" ? (
                    <Loader2 className="h-16 w-16 text-yellow-500 animate-spin" />
                  ) : isConnected ? (
                    <Phone className="h-16 w-16 text-blue-500" />
                  ) : (
                    <PhoneOff className="h-16 w-16 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Volume Level Indicator */}
              {isConnected && (
                <div className="text-center">
                  <div className="w-full max-w-xs mx-auto bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-150"
                      style={{ width: `${volumeLevel * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Voice level</p>
                </div>
              )}

              {/* Call Controls */}
              <div className="flex justify-center space-x-4">
                {!isConnected && callStatus !== "error" ? (
                  <Button
                    onClick={startVAPICall}
                    size="lg"
                    className="px-12 py-6 text-xl"
                    disabled={callStatus === "connecting" || !vapiLoaded}
                  >
                    <Phone className="h-6 w-6 mr-3" />
                    {callStatus === "connecting" ? "Connecting..." : "Start Voice Call"}
                  </Button>
                ) : callStatus === "error" ? (
                  <div className="flex gap-3">
                    <Button
                      onClick={() => {
                        setCallStatus("idle")
                        setErrorMessage("")
                      }}
                      variant="outline"
                      size="lg"
                      className="px-8 py-4"
                    >
                      Try Again
                    </Button>
                    <Button asChild size="lg" className="px-8 py-4">
                      <Link href="/report">Use Text Form</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <Button onClick={toggleMute} variant="outline" size="lg" className="px-6 py-4">
                      {isMuted ? <VolumeX className="h-5 w-5 mr-2" /> : <Volume2 className="h-5 w-5 mr-2" />}
                      {isMuted ? "Unmute" : "Mute"}
                    </Button>
                    <Button onClick={endCall} variant="destructive" size="lg" className="px-8 py-4">
                      <PhoneOff className="h-5 w-5 mr-2" />
                      End Call
                    </Button>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-3">How to use the Voice Assistant:</h3>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li>
                    • <strong>Click "Start Voice Call"</strong> to connect with the AI assistant
                  </li>
                  <li>
                    • <strong>Speak naturally</strong> - describe your concern in your own words
                  </li>
                  <li>
                    • <strong>The AI will guide you</strong> through the reporting process
                  </li>
                  <li>
                    • <strong>Everything is transcribed</strong> automatically for your review
                  </li>
                  <li>
                    • <strong>Your conversation is secure</strong> and can be anonymous
                  </li>
                </ul>
              </div>

              {/* VAPI Configuration Display */}
              {vapiLoaded && (
                <div className="text-center text-xs text-gray-500 space-y-1">
                  <p>🔒 Using VAPI Agent: {VAPI_AGENT_ID.slice(0, 8)}...</p>
                  <p>🛡️ Secure connection established</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Fallback Simple VAPI Integration */}
          {callStatus === "error" && !vapiLoaded && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-center mb-4">Try Alternative Voice Assistant</h2>
              <VapiSimple
                onTranscript={(newTranscript) => {
                  setTranscript((prev) => prev + (prev ? " " : "") + newTranscript)
                  setConversationStarted(true)
                }}
                onCallEnd={() => {
                  setConversationStarted(true)
                }}
              />
            </div>
          )}

          {/* Live Transcription */}
          {conversationStarted && (
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Edit3 className="h-5 w-5 text-green-600" />
                    <span>Live Conversation Transcript</span>
                  </CardTitle>
                  <Badge variant={isConnected ? "default" : "secondary"}>
                    {isConnected ? "🔴 Recording" : "⏹️ Stopped"}
                  </Badge>
                </div>
                <CardDescription>Real-time transcript of your conversation with the AI assistant</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Transcript Display */}
                <div className="space-y-2">
                  <Label htmlFor="transcript">Conversation Transcript</Label>
                  <div
                    ref={transcriptRef}
                    className="min-h-[200px] max-h-[400px] p-4 border rounded-lg bg-white overflow-y-auto"
                  >
                    {transcript ? (
                      <span className="text-gray-900 whitespace-pre-wrap">{transcript}</span>
                    ) : (
                      <span className="text-gray-400">Your conversation with the AI assistant will appear here...</span>
                    )}
                    {isConnected && <span className="inline-block w-2 h-4 bg-green-500 animate-pulse ml-1"></span>}
                  </div>
                </div>

                {/* Edit Transcript */}
                {transcript && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="edit-transcript">Edit Transcript</Label>
                      <Button variant="ghost" size="sm" onClick={() => setIsEditingTranscript(!isEditingTranscript)}>
                        <Edit3 className="h-4 w-4 mr-1" />
                        {isEditingTranscript ? "View" : "Edit"}
                      </Button>
                    </div>

                    {isEditingTranscript ? (
                      <Textarea
                        id="edit-transcript"
                        value={transcript}
                        onChange={(e) => setTranscript(e.target.value)}
                        className="min-h-[150px]"
                        placeholder="Edit your transcript here..."
                      />
                    ) : (
                      <div className="p-4 bg-gray-50 rounded-lg min-h-[150px] whitespace-pre-wrap">
                        {transcript || "No transcript to edit yet."}
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                {transcript && (
                  <div className="flex gap-3">
                    <Button onClick={saveTranscript} className="flex-1">
                      <Save className="h-4 w-4 mr-2" />
                      Save Transcript
                    </Button>
                    <Button onClick={submitReport} variant="outline">
                      Continue to Report Form
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Alternative Options */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">Prefer to type your report instead?</p>
            <Button asChild variant="outline" size="lg">
              <Link href="/report">Use Text Form</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
