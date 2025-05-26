"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, MicOff, Phone, PhoneOff, Shield, ArrowLeft, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"

// VAPI Configuration
const VAPI_PUBLIC_KEY = "4669de51-f9ba-4e99-a9dd-e39279a6f510"
const VAPI_AGENT_ID = "bb8029bb-dde6-485a-9c32-d41b684568ff"

export default function VoiceReportPage() {
  const [isConnected, setIsConnected] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [callStatus, setCallStatus] = useState<"idle" | "connecting" | "connected" | "ended" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [vapiClient, setVapiClient] = useState<any>(null)

  // Initialize VAPI client
  useEffect(() => {
    const initVAPI = async () => {
      try {
        // For demo purposes, we'll simulate VAPI integration
        // In production, you would load the actual VAPI SDK
        console.log("Initializing VAPI with public key:", VAPI_PUBLIC_KEY)

        // Simulate VAPI client initialization
        const mockVapiClient = {
          start: async () => {
            setCallStatus("connecting")
            // Simulate connection delay
            await new Promise((resolve) => setTimeout(resolve, 2000))
            setCallStatus("connected")
            setIsConnected(true)
            setIsRecording(true)

            // Simulate transcript updates
            setTimeout(() => {
              setTranscript(
                "Hello, I'm your AI assistant. I'm here to help you submit your report securely. Please describe your concern.",
              )
            }, 1000)
          },
          stop: () => {
            setCallStatus("ended")
            setIsConnected(false)
            setIsRecording(false)
          },
          isConnected: () => isConnected,
        }

        setVapiClient(mockVapiClient)
      } catch (error) {
        console.error("Failed to initialize VAPI:", error)
        setErrorMessage("Failed to initialize voice assistant. Please try again or use the text form.")
        setCallStatus("error")
      }
    }

    initVAPI()
  }, [])

  const startVAPICall = async () => {
    if (!vapiClient) {
      setErrorMessage("Voice assistant not available. Please refresh the page or use the text form.")
      setCallStatus("error")
      return
    }

    try {
      setErrorMessage("")
      await vapiClient.start()
    } catch (error) {
      console.error("Failed to start VAPI call:", error)
      setErrorMessage("Unable to start voice call. Please try again or use the text form instead.")
      setCallStatus("error")
    }
  }

  const endCall = () => {
    if (vapiClient) {
      vapiClient.stop()
    }
    setCallStatus("ended")
    setIsConnected(false)
    setIsRecording(false)
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
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">Aegis Voice</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Voice Report Assistant</h1>
            <p className="text-lg text-gray-600">
              Speak naturally with our AI assistant to submit your report securely and anonymously.
            </p>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{errorMessage}</AlertDescription>
            </Alert>
          )}

          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center space-x-2">
                <Mic className="h-6 w-6 text-blue-600" />
                <span>AI Voice Assistant</span>
              </CardTitle>
              <CardDescription>Your conversation is encrypted and anonymous</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Call Status */}
              <div className="text-center">
                <div
                  className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                    callStatus === "idle"
                      ? "bg-gray-100 text-gray-700"
                      : callStatus === "connecting"
                        ? "bg-yellow-100 text-yellow-700"
                        : callStatus === "connected"
                          ? "bg-green-100 text-green-700"
                          : callStatus === "error"
                            ? "bg-red-100 text-red-700"
                            : "bg-red-100 text-red-700"
                  }`}
                >
                  {callStatus === "idle" && "Ready to connect"}
                  {callStatus === "connecting" && "Connecting..."}
                  {callStatus === "connected" && "Connected - Speak freely"}
                  {callStatus === "ended" && "Call ended"}
                  {callStatus === "error" && "Connection failed"}
                </div>
              </div>

              {/* Voice Visualization */}
              <div className="flex justify-center">
                <div
                  className={`w-32 h-32 rounded-full border-4 flex items-center justify-center transition-all duration-300 ${
                    isRecording
                      ? "border-red-500 bg-red-50 animate-pulse"
                      : callStatus === "error"
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300 bg-gray-50"
                  }`}
                >
                  {callStatus === "error" ? (
                    <AlertCircle className="h-12 w-12 text-red-500" />
                  ) : isRecording ? (
                    <Mic className="h-12 w-12 text-red-500" />
                  ) : (
                    <MicOff className="h-12 w-12 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Controls */}
              <div className="flex justify-center space-x-4">
                {!isConnected && callStatus !== "error" ? (
                  <Button
                    onClick={startVAPICall}
                    size="lg"
                    className="px-8 py-6 text-lg"
                    disabled={callStatus === "connecting"}
                  >
                    <Phone className="h-5 w-5 mr-2" />
                    {callStatus === "connecting" ? "Connecting..." : "Start Voice Report"}
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
                      className="px-8 py-6 text-lg"
                    >
                      Try Again
                    </Button>
                    <Button asChild size="lg" className="px-8 py-6 text-lg">
                      <Link href="/report">Use Text Form</Link>
                    </Button>
                  </div>
                ) : (
                  <Button onClick={endCall} variant="destructive" size="lg" className="px-8 py-6 text-lg">
                    <PhoneOff className="h-5 w-5 mr-2" />
                    End Call
                  </Button>
                )}
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Click "Start Voice Report" to connect with our AI assistant</li>
                  <li>• Describe your concern naturally - the AI will guide you</li>
                  <li>• Your voice is processed securely and anonymously</li>
                  <li>• You'll receive a tracking number for follow-up</li>
                </ul>
              </div>

              {/* Demo Notice */}
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <h3 className="font-semibold text-amber-900 mb-2">Demo Mode</h3>
                <p className="text-sm text-amber-800">
                  This is a demonstration of the voice interface. In production, this would connect to the live VAPI
                  service using your provided credentials. For now, you can use the text form to submit reports.
                </p>
              </div>

              {/* Transcript Display */}
              {transcript && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">AI Assistant:</h3>
                  <p className="text-sm text-gray-700">{transcript}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Alternative Options */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">Prefer to type your report?</p>
            <Button asChild variant="outline" size="lg">
              <Link href="/report">Use Text Form Instead</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
