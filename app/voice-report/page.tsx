"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Shield, ArrowLeft, Save, Edit3 } from "lucide-react"
import Link from "next/link"
import { VapiDirect } from "@/components/vapi-direct"

export default function VoiceReportPage() {
  const [transcript, setTranscript] = useState("")
  const [conversationStarted, setConversationStarted] = useState(false)

  const handleTranscript = (newTranscript: string) => {
    setTranscript(newTranscript)
    setConversationStarted(true)
  }

  const handleCallEnd = () => {
    // Call ended, transcript should be complete
    console.log("Call ended, final transcript:", transcript)
  }

  const saveTranscript = () => {
    if (!transcript.trim()) {
      alert("No transcript to save.")
      return
    }
    // Save to localStorage for demo
    localStorage.setItem("voice_transcript", transcript)
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

          {/* Voice Assistant */}
          <div className="mb-8">
            <VapiDirect onTranscript={handleTranscript} onCallEnd={handleCallEnd} />
          </div>

          {/* Transcript Section */}
          {conversationStarted && (
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Edit3 className="h-5 w-5 text-green-600" />
                  <span>Conversation Transcript</span>
                </CardTitle>
                <CardDescription>Your conversation with the AI assistant</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="transcript">Transcript</Label>
                  <Textarea
                    id="transcript"
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    className="min-h-[200px]"
                    placeholder="Your conversation transcript will appear here..."
                  />
                </div>

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
