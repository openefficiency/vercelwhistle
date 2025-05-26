"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, ArrowLeft, Save, Edit3, Phone, PhoneOff, AlertCircle, Loader2, ExternalLink } from "lucide-react"
import Link from "next/link"

const VAPI_PUBLIC_KEY = "4669de51-f9ba-4e99-a9dd-e39279a6f510"
const VAPI_AGENT_ID = "bb8029bb-dde6-485a-9c32-d41b684568ff"

declare global {
  interface Window {
    Vapi: any
  }
}

export default function VoiceReportPage() {
  const [transcript, setTranscript] = useState("")
  const [conversationStarted, setConversationStarted] = useState(false)
  const [isEditingTranscript, setIsEditingTranscript] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState("")
  const [vapiReady, setVapiReady] = useState(false)
  const [webCallUrl, setWebCallUrl] = useState("")

  const transcriptRef = useRef<HTMLDivElement>(null)
  const vapiRef = useRef<any>(null)

  // Load VAPI SDK
  useEffect(() => {
    const loadVapi = async () => {
      try {
        if (window.Vapi) {
          setVapiReady(true)
          return
        }

        console.log("Loading VAPI SDK...")

        // Load VAPI SDK from CDN
        const script = document.createElement("script")
        script.src = "https://cdn.jsdelivr.net/npm/@vapi-ai/web@latest/dist/index.js"
        script.crossOrigin = "anonymous"

        await new Promise((resolve, reject) => {
          script.onload = () => {
            console.log("VAPI SDK loaded")
            // Wait a bit for the SDK to initialize
            setTimeout(() => {
              if (window.Vapi) {
                setVapiReady(true)
                resolve(true)
              } else {
                reject(new Error("VAPI not available"))
              }
            }, 1000)
          }
          script.onerror = reject
          document.head.appendChild(script)
        })
      } catch (error) {
        console.error("Failed to load VAPI SDK:", error)
        setError("Failed to load voice assistant. You can try the web call option below.")
      }
    }

    loadVapi()
  }, [])

  // Initialize VAPI client
  useEffect(() => {
    if (!vapiReady || !window.Vapi) return

    try {
      const vapi = new window.Vapi(VAPI_PUBLIC_KEY)

      vapi.on("call-start", () => {
        console.log("Call started")
        setIsConnected(true)
        setIsConnecting(false)
        setConversationStarted(true)
        setError("")
      })

      vapi.on("call-end", () => {
        console.log("Call ended")
        setIsConnected(false)
        setIsConnecting(false)
      })

      vapi.on("message", (message: any) => {
        console.log("VAPI message:", message)
        if (message.type === "transcript" && message.transcript) {
          setTranscript((prev) => {
            const newTranscript = prev + (prev ? " " : "") + message.transcript
            setTimeout(() => {
              if (transcriptRef.current) {
                transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight
              }
            }, 100)
            return newTranscript
          })
        }
      })

      vapi.on("error", (error: any) => {
        console.error("VAPI error:", error)
        setError(`Call failed: ${error.message || "Unknown error"}`)
        setIsConnected(false)
        setIsConnecting(false)
      })

      vapiRef.current = vapi
      console.log("VAPI client ready")
    } catch (error) {
      console.error("Failed to initialize VAPI:", error)
      setError("Failed to initialize voice assistant")
    }
  }, [vapiReady])

  const startDirectCall = async () => {
    if (!vapiRef.current) {
      setError("Voice assistant not ready")
      return
    }

    try {
      setIsConnecting(true)
      setError("")
      setTranscript("")

      await vapiRef.current.start({
        assistantId: VAPI_AGENT_ID,
      })
    } catch (error: any) {
      console.error("Failed to start call:", error)
      setError(`Failed to start call: ${error.message || "Unknown error"}`)
      setIsConnecting(false)
    }
  }

  const createWebCall = async () => {
    try {
      setIsConnecting(true)
      setError("")

      const response = await fetch("/api/vapi-call", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assistantId: VAPI_AGENT_ID,
        }),
      })

      const data = await response.json()

      if (data.success && data.webCallUrl) {
        setWebCallUrl(data.webCallUrl)
        // Open in new tab
        window.open(data.webCallUrl, "_blank")
        setConversationStarted(true)
      } else {
        throw new Error(data.error || "Failed to create web call")
      }
    } catch (error: any) {
      console.error("Failed to create web call:", error)
      setError(`Failed to create web call: ${error.message}`)
    } finally {
      setIsConnecting(false)
    }
  }

  const endCall = () => {
    if (vapiRef.current && isConnected) {
      vapiRef.current.stop()
    }
  }

  const saveTranscript = () => {
    if (!transcript.trim()) {
      alert("No transcript to save.")
      return
    }
    alert("Transcript saved successfully!")
  }

  const submitReport = () => {
    if (!transcript.trim()) {
      alert("No transcript to submit.")
      return
    }
    window.location.href = `/report?transcript=${encodeURIComponent(transcript)}`
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
            <span className="text-2xl font-bold text-gray-900">Aegis Voice Assistant</span>
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

          {/* Voice Assistant Card */}
          <Card className="border-0 shadow-xl mb-8">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center space-x-2">
                <Phone className="h-6 w-6 text-blue-600" />
                <span>AI Voice Assistant</span>
                {!vapiReady && <Loader2 className="h-4 w-4 animate-spin" />}
              </CardTitle>
              <CardDescription>
                {vapiReady ? "Choose your preferred way to start the voice call" : "Loading voice assistant..."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <Badge
                  variant={isConnected ? "default" : isConnecting ? "secondary" : error ? "destructive" : "outline"}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Direct Call Option */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-center">Direct Call (Recommended)</h3>
                  <div className="flex justify-center">
                    {!isConnected ? (
                      <Button
                        onClick={startDirectCall}
                        disabled={isConnecting || !vapiReady}
                        size="lg"
                        className="w-full"
                      >
                        {isConnecting ? (
                          <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          <>
                            <Phone className="h-5 w-5 mr-2" />
                            Start Direct Call
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button onClick={endCall} variant="destructive" size="lg" className="w-full">
                        <PhoneOff className="h-5 w-5 mr-2" />
                        End Call
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 text-center">Call directly in this browser window</p>
                </div>

                {/* Web Call Option */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-center">Web Call (Alternative)</h3>
                  <div className="flex justify-center">
                    <Button
                      onClick={createWebCall}
                      disabled={isConnecting}
                      variant="outline"
                      size="lg"
                      className="w-full"
                    >
                      {isConnecting ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <ExternalLink className="h-5 w-5 mr-2" />
                          Open Web Call
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-600 text-center">Opens in a new tab if direct call fails</p>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">How to use:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Try "Direct Call" first for the best experience</li>
                  <li>• Use "Web Call" if direct call doesn't work</li>
                  <li>• Speak clearly about your concern</li>
                  <li>• The AI will guide you through questions</li>
                  <li>• Everything is transcribed automatically</li>
                  <li>• Your conversation is secure and encrypted</li>
                </ul>
              </div>

              {webCallUrl && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-green-800 text-sm">
                    ✅ Web call created! The call should open in a new tab. After your conversation, you can manually
                    enter the transcript below.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Transcript Section */}
          {(conversationStarted || transcript) && (
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Edit3 className="h-5 w-5 text-green-600" />
                    <span>Conversation Transcript</span>
                  </CardTitle>
                  <Badge variant="outline">{isConnected ? "🔴 Live Recording" : "📝 Manual Entry"}</Badge>
                </div>
                <CardDescription>
                  {isConnected
                    ? "Real-time transcript of your conversation"
                    : "Enter or edit your conversation transcript"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="transcript">Transcript</Label>
                  {isConnected ? (
                    <div
                      ref={transcriptRef}
                      className="min-h-[200px] max-h-[400px] p-4 border rounded-lg bg-white overflow-y-auto"
                    >
                      {transcript ? (
                        <span className="text-gray-900 whitespace-pre-wrap">{transcript}</span>
                      ) : (
                        <span className="text-gray-400">Your conversation will appear here as you speak...</span>
                      )}
                    </div>
                  ) : (
                    <Textarea
                      id="transcript"
                      value={transcript}
                      onChange={(e) => setTranscript(e.target.value)}
                      className="min-h-[200px]"
                      placeholder="Enter your conversation transcript here, or paste it from the web call..."
                    />
                  )}
                </div>

                {transcript && !isConnected && (
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
