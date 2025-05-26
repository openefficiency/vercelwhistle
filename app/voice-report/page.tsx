"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Shield,
  ArrowLeft,
  AlertCircle,
  RotateCcw,
  Save,
  Volume2,
  Edit3,
  Command,
  HelpCircle,
  CheckCircle,
  X,
} from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"

// VAPI Configuration
const VAPI_PUBLIC_KEY = "4669de51-f9ba-4e99-a9dd-e39279a6f510"
const VAPI_AGENT_ID = "bb8029bb-dde6-485a-9c32-d41b684568ff"

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message: string
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null
  onend: ((this: SpeechRecognition, ev: Event) => any) | null
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition
    webkitSpeechRecognition: new () => SpeechRecognition
  }
}

interface VoiceCommand {
  command: string
  aliases: string[]
  description: string
  action: () => void
  requiresConfirmation?: boolean
}

export default function VoiceReportPage() {
  const [isConnected, setIsConnected] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [interimTranscript, setInterimTranscript] = useState("")
  const [finalTranscript, setFinalTranscript] = useState("")
  const [callStatus, setCallStatus] = useState<"idle" | "connecting" | "connected" | "ended" | "error">("idle")
  const [speechStatus, setSpeechStatus] = useState<"idle" | "listening" | "processing" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [vapiClient, setVapiClient] = useState<any>(null)
  const [speechRecognition, setSpeechRecognition] = useState<SpeechRecognition | null>(null)
  const [isEditingTranscript, setIsEditingTranscript] = useState(false)
  const [confidence, setConfidence] = useState(0)
  const [wordCount, setWordCount] = useState(0)
  const [speechSupported, setSpeechSupported] = useState(false)
  const [voiceCommandsEnabled, setVoiceCommandsEnabled] = useState(true)
  const [lastCommand, setLastCommand] = useState<string | null>(null)
  const [commandConfirmation, setCommandConfirmation] = useState<{
    command: string
    action: () => void
  } | null>(null)
  const [showCommandHelp, setShowCommandHelp] = useState(false)
  const [commandHistory, setCommandHistory] = useState<string[]>([])

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const transcriptRef = useRef<HTMLDivElement>(null)
  const commandTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Voice Commands Configuration
  const voiceCommands: VoiceCommand[] = [
    {
      command: "clear",
      aliases: ["clear transcript", "clear all", "delete all", "start over"],
      description: "Clear the entire transcript",
      action: () => clearTranscript(),
      requiresConfirmation: true,
    },
    {
      command: "save",
      aliases: ["save transcript", "save this", "save document"],
      description: "Save the current transcript",
      action: () => saveTranscript(),
    },
    {
      command: "submit",
      aliases: ["submit report", "send report", "submit this"],
      description: "Continue to submit the report",
      action: () => submitReport(),
      requiresConfirmation: true,
    },
    {
      command: "stop",
      aliases: ["stop recording", "stop listening", "pause"],
      description: "Stop speech recognition",
      action: () => stopSpeechRecognition(),
    },
    {
      command: "edit",
      aliases: ["edit transcript", "edit mode", "edit this"],
      description: "Switch to edit mode",
      action: () => setIsEditingTranscript(true),
    },
    {
      command: "help",
      aliases: ["show help", "what can I say", "commands"],
      description: "Show available voice commands",
      action: () => setShowCommandHelp(true),
    },
  ]

  // Command detection function
  const detectVoiceCommand = (text: string) => {
    if (!voiceCommandsEnabled) return null

    const lowerText = text.toLowerCase().trim()

    for (const cmd of voiceCommands) {
      // Check main command
      if (lowerText.includes(cmd.command)) {
        return cmd
      }
      // Check aliases
      for (const alias of cmd.aliases) {
        if (lowerText.includes(alias)) {
          return cmd
        }
      }
    }
    return null
  }

  // Execute voice command
  const executeCommand = (command: VoiceCommand) => {
    setLastCommand(command.command)
    setCommandHistory((prev) => [command.command, ...prev.slice(0, 4)])

    if (command.requiresConfirmation) {
      setCommandConfirmation({
        command: command.command,
        action: command.action,
      })
      // Auto-dismiss confirmation after 5 seconds
      setTimeout(() => setCommandConfirmation(null), 5000)
    } else {
      command.action()
    }

    // Clear command indicator after 3 seconds
    if (commandTimeoutRef.current) {
      clearTimeout(commandTimeoutRef.current)
    }
    commandTimeoutRef.current = setTimeout(() => {
      setLastCommand(null)
    }, 3000)
  }

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

    if (SpeechRecognition) {
      setSpeechSupported(true)
      const recognition = new SpeechRecognition()

      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = "en-US"

      recognition.onstart = () => {
        setSpeechStatus("listening")
        setIsListening(true)
        setErrorMessage("")
      }

      recognition.onend = () => {
        setSpeechStatus("idle")
        setIsListening(false)
      }

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interim = ""
        let final = ""
        let totalConfidence = 0
        let resultCount = 0

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          const transcript = result[0].transcript

          if (result.isFinal) {
            final += transcript + " "
            totalConfidence += result[0].confidence
            resultCount++

            // Check for voice commands in final results
            const command = detectVoiceCommand(transcript)
            if (command) {
              executeCommand(command)
              // Don't add command to transcript
              return
            }
          } else {
            interim += transcript
          }
        }

        setInterimTranscript(interim)

        if (final) {
          setFinalTranscript((prev) => prev + final)
          setTranscript((prev) => prev + final)
          if (resultCount > 0) {
            setConfidence(totalConfidence / resultCount)
          }
        }

        // Update word count
        const words = (finalTranscript + final)
          .trim()
          .split(/\s+/)
          .filter((word) => word.length > 0)
        setWordCount(words.length)

        // Auto-scroll to bottom
        if (transcriptRef.current) {
          transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight
        }
      }

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error:", event.error)
        setSpeechStatus("error")
        setIsListening(false)

        let errorMsg = "Speech recognition error occurred."
        switch (event.error) {
          case "no-speech":
            errorMsg = "No speech detected. Please try speaking again."
            break
          case "audio-capture":
            errorMsg = "Microphone access denied. Please check your permissions."
            break
          case "not-allowed":
            errorMsg = "Microphone permission denied. Please allow microphone access."
            break
          case "network":
            errorMsg = "Network error. Please check your connection."
            break
          default:
            errorMsg = `Speech recognition error: ${event.error}`
        }
        setErrorMessage(errorMsg)
      }

      setSpeechRecognition(recognition)
      recognitionRef.current = recognition
    } else {
      setSpeechSupported(false)
      setErrorMessage("Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.")
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (commandTimeoutRef.current) {
        clearTimeout(commandTimeoutRef.current)
      }
    }
  }, [])

  // Initialize VAPI client
  useEffect(() => {
    const initVAPI = async () => {
      try {
        console.log("Initializing VAPI with public key:", VAPI_PUBLIC_KEY)

        const mockVapiClient = {
          start: async () => {
            setCallStatus("connecting")
            await new Promise((resolve) => setTimeout(resolve, 2000))
            setCallStatus("connected")
            setIsConnected(true)
            setIsRecording(true)
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
        setErrorMessage("Failed to initialize voice assistant. You can still use speech-to-text transcription.")
        setCallStatus("error")
      }
    }

    initVAPI()
  }, [])

  const startSpeechRecognition = () => {
    if (speechRecognition && speechSupported) {
      try {
        setErrorMessage("")
        setSpeechStatus("listening")
        speechRecognition.start()
      } catch (error) {
        console.error("Failed to start speech recognition:", error)
        setErrorMessage("Failed to start speech recognition. Please try again.")
        setSpeechStatus("error")
      }
    }
  }

  const stopSpeechRecognition = () => {
    if (speechRecognition && isListening) {
      speechRecognition.stop()
      setSpeechStatus("idle")
      setIsListening(false)
    }
  }

  const clearTranscript = () => {
    setTranscript("")
    setFinalTranscript("")
    setInterimTranscript("")
    setWordCount(0)
    setConfidence(0)
    setCommandConfirmation(null)
  }

  const saveTranscript = () => {
    if (!finalTranscript) {
      setErrorMessage("No transcript to save.")
      return
    }
    console.log("Saving transcript:", finalTranscript)
    alert("Transcript saved successfully!")
  }

  const submitReport = () => {
    if (!finalTranscript) {
      setErrorMessage("No transcript to submit.")
      return
    }
    window.location.href = `/report?transcript=${encodeURIComponent(finalTranscript)}`
  }

  const startVAPICall = async () => {
    if (!vapiClient) {
      setErrorMessage("Voice assistant not available. You can still use speech-to-text transcription.")
      setCallStatus("error")
      return
    }

    try {
      setErrorMessage("")
      await vapiClient.start()
    } catch (error) {
      console.error("Failed to start VAPI call:", error)
      setErrorMessage("Unable to start voice call. You can still use speech-to-text transcription.")
      setCallStatus("error")
    }
  }

  const endCall = () => {
    if (vapiClient) {
      vapiClient.stop()
    }
    stopSpeechRecognition()
    setCallStatus("ended")
    setIsConnected(false)
    setIsRecording(false)
  }

  const getConfidenceColor = (conf: number) => {
    if (conf >= 0.8) return "text-green-600"
    if (conf >= 0.6) return "text-yellow-600"
    return "text-red-600"
  }

  const getConfidenceLabel = (conf: number) => {
    if (conf >= 0.8) return "High"
    if (conf >= 0.6) return "Medium"
    return "Low"
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
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Voice Report Assistant</h1>
            <p className="text-lg text-gray-600">
              Speak naturally and use voice commands to control the interface. Your report is processed securely and
              anonymously.
            </p>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{errorMessage}</AlertDescription>
            </Alert>
          )}

          {/* Command Confirmation Modal */}
          {commandConfirmation && (
            <Alert className="mb-6 border-orange-200 bg-orange-50">
              <Command className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <div className="flex items-center justify-between">
                  <span>Execute command: "{commandConfirmation.command}"?</span>
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      onClick={() => {
                        commandConfirmation.action()
                        setCommandConfirmation(null)
                      }}
                      className="h-6 px-2 text-xs"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Yes
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCommandConfirmation(null)}
                      className="h-6 px-2 text-xs"
                    >
                      <X className="h-3 w-3 mr-1" />
                      No
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Last Command Indicator */}
          {lastCommand && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">Voice command executed: "{lastCommand}"</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Voice Controls */}
            <Card className="border-0 shadow-xl">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center space-x-2">
                  <Mic className="h-6 w-6 text-blue-600" />
                  <span>Speech Recognition</span>
                </CardTitle>
                <CardDescription>Real-time speech-to-text with voice commands</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Voice Commands Toggle */}
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Command className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-900">Voice Commands</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={voiceCommandsEnabled ? "default" : "secondary"}>
                      {voiceCommandsEnabled ? "Enabled" : "Disabled"}
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={() => setVoiceCommandsEnabled(!voiceCommandsEnabled)}>
                      {voiceCommandsEnabled ? "Disable" : "Enable"}
                    </Button>
                  </div>
                </div>

                {/* Speech Status */}
                <div className="text-center">
                  <div
                    className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                      speechStatus === "idle"
                        ? "bg-gray-100 text-gray-700"
                        : speechStatus === "listening"
                          ? "bg-green-100 text-green-700"
                          : speechStatus === "processing"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-red-100 text-red-700"
                    }`}
                  >
                    {speechStatus === "idle" && "Ready to listen"}
                    {speechStatus === "listening" && "Listening for speech and commands..."}
                    {speechStatus === "processing" && "Processing..."}
                    {speechStatus === "error" && "Recognition error"}
                  </div>
                </div>

                {/* Voice Visualization */}
                <div className="flex justify-center">
                  <div
                    className={`w-32 h-32 rounded-full border-4 flex items-center justify-center transition-all duration-300 ${
                      isListening
                        ? "border-green-500 bg-green-50 animate-pulse"
                        : speechStatus === "error"
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300 bg-gray-50"
                    }`}
                  >
                    {speechStatus === "error" ? (
                      <AlertCircle className="h-12 w-12 text-red-500" />
                    ) : isListening ? (
                      <Volume2 className="h-12 w-12 text-green-500" />
                    ) : (
                      <MicOff className="h-12 w-12 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Speech Controls */}
                <div className="flex justify-center space-x-3">
                  {!isListening ? (
                    <Button
                      onClick={startSpeechRecognition}
                      size="lg"
                      className="px-6 py-3"
                      disabled={!speechSupported}
                    >
                      <Mic className="h-4 w-4 mr-2" />
                      Start Speaking
                    </Button>
                  ) : (
                    <Button onClick={stopSpeechRecognition} variant="destructive" size="lg" className="px-6 py-3">
                      <MicOff className="h-4 w-4 mr-2" />
                      Stop
                    </Button>
                  )}

                  <Button
                    onClick={clearTranscript}
                    variant="outline"
                    size="lg"
                    className="px-6 py-3"
                    disabled={!finalTranscript}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Clear
                  </Button>

                  <Button
                    onClick={() => setShowCommandHelp(!showCommandHelp)}
                    variant="outline"
                    size="lg"
                    className="px-6 py-3"
                  >
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Help
                  </Button>
                </div>

                {/* Voice Commands Help */}
                {showCommandHelp && (
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h3 className="font-semibold text-purple-900 mb-3 flex items-center">
                      <Command className="h-4 w-4 mr-2" />
                      Available Voice Commands
                    </h3>
                    <div className="space-y-2 text-sm">
                      {voiceCommands.map((cmd, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="font-medium text-purple-800">"{cmd.command}"</span>
                          <span className="text-purple-600 text-xs">{cmd.description}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-purple-700 mt-3">
                      Simply say any of these commands while speaking to execute them.
                    </p>
                  </div>
                )}

                {/* Command History */}
                {commandHistory.length > 0 && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Commands</h4>
                    <div className="flex flex-wrap gap-1">
                      {commandHistory.map((cmd, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {cmd}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Speech Stats */}
                {(wordCount > 0 || confidence > 0) && (
                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Words</p>
                      <p className="text-2xl font-bold text-gray-900">{wordCount}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Confidence</p>
                      <p className={`text-2xl font-bold ${getConfidenceColor(confidence)}`}>
                        {getConfidenceLabel(confidence)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Browser Support Notice */}
                {!speechSupported && (
                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <h3 className="font-semibold text-amber-900 mb-2">Browser Not Supported</h3>
                    <p className="text-sm text-amber-800">
                      Speech recognition requires Chrome, Edge, or Safari. Please switch browsers or use the text form.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Live Transcription */}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Edit3 className="h-5 w-5 text-purple-600" />
                    <span>Live Transcription</span>
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge variant={isListening ? "default" : "secondary"}>
                      {isListening ? "Recording" : "Stopped"}
                    </Badge>
                    {confidence > 0 && (
                      <Badge variant="outline" className={getConfidenceColor(confidence)}>
                        {Math.round(confidence * 100)}%
                      </Badge>
                    )}
                    {voiceCommandsEnabled && (
                      <Badge variant="outline" className="text-purple-600">
                        <Command className="h-3 w-3 mr-1" />
                        Commands
                      </Badge>
                    )}
                  </div>
                </div>
                <CardDescription>Your speech appears here in real-time</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Transcription Display */}
                <div className="space-y-2">
                  <Label htmlFor="transcript">Transcription</Label>
                  <div
                    ref={transcriptRef}
                    className="min-h-[200px] max-h-[300px] p-4 border rounded-lg bg-white overflow-y-auto"
                  >
                    {finalTranscript && <span className="text-gray-900">{finalTranscript}</span>}
                    {interimTranscript && <span className="text-gray-500 italic">{interimTranscript}</span>}
                    {!finalTranscript && !interimTranscript && (
                      <span className="text-gray-400">
                        Start speaking to see your words appear here...
                        {voiceCommandsEnabled && (
                          <span className="block mt-2 text-purple-500">
                            Try saying "help" to see available voice commands
                          </span>
                        )}
                      </span>
                    )}
                    {isListening && <span className="inline-block w-2 h-4 bg-green-500 animate-pulse ml-1"></span>}
                  </div>
                </div>

                {/* Edit Transcription */}
                {finalTranscript && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="edit-transcript">Edit Transcription</Label>
                      <Button variant="ghost" size="sm" onClick={() => setIsEditingTranscript(!isEditingTranscript)}>
                        <Edit3 className="h-4 w-4 mr-1" />
                        {isEditingTranscript ? "View" : "Edit"}
                      </Button>
                    </div>

                    {isEditingTranscript ? (
                      <Textarea
                        id="edit-transcript"
                        value={finalTranscript}
                        onChange={(e) => setFinalTranscript(e.target.value)}
                        className="min-h-[150px]"
                        placeholder="Edit your transcription here..."
                      />
                    ) : (
                      <div className="p-4 bg-gray-50 rounded-lg min-h-[150px] whitespace-pre-wrap">
                        {finalTranscript || "No transcription to edit yet."}
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button onClick={saveTranscript} disabled={!finalTranscript} className="flex-1">
                    <Save className="h-4 w-4 mr-2" />
                    Save Transcript
                  </Button>
                  <Button asChild variant="outline" disabled={!finalTranscript}>
                    <Link href={`/report?transcript=${encodeURIComponent(finalTranscript)}`}>Continue to Form</Link>
                  </Button>
                </div>

                {/* Voice Command Tip */}
                {voiceCommandsEnabled && finalTranscript && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                      💡 <strong>Voice Tip:</strong> Say "save" to save your transcript or "submit" to continue to the
                      report form.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* VAPI Integration Section */}
          <Card className="mt-8 border-0 shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center space-x-2">
                <Phone className="h-6 w-6 text-blue-600" />
                <span>AI Voice Assistant (Demo)</span>
              </CardTitle>
              <CardDescription>Connect with our AI assistant for guided reporting</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* VAPI Status */}
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
                  {callStatus === "connecting" && "Connecting to AI..."}
                  {callStatus === "connected" && "Connected to AI assistant"}
                  {callStatus === "ended" && "Call ended"}
                  {callStatus === "error" && "Connection failed"}
                </div>
              </div>

              {/* VAPI Controls */}
              <div className="flex justify-center space-x-4">
                {!isConnected && callStatus !== "error" ? (
                  <Button
                    onClick={startVAPICall}
                    size="lg"
                    variant="outline"
                    className="px-8 py-6 text-lg"
                    disabled={callStatus === "connecting"}
                  >
                    <Phone className="h-5 w-5 mr-2" />
                    {callStatus === "connecting" ? "Connecting..." : "Connect to AI Assistant"}
                  </Button>
                ) : callStatus === "error" ? (
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
                ) : (
                  <Button onClick={endCall} variant="destructive" size="lg" className="px-8 py-6 text-lg">
                    <PhoneOff className="h-5 w-5 mr-2" />
                    End AI Session
                  </Button>
                )}
              </div>

              {/* Demo Notice */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">AI Assistant Demo</h3>
                <p className="text-sm text-blue-800">
                  The AI assistant is in demo mode. Use the speech-to-text feature above with voice commands for real
                  transcription, then continue to the report form with your transcript.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Alternative Options */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">Prefer to type your report directly?</p>
            <Button asChild variant="outline" size="lg">
              <Link href="/report">Use Text Form Instead</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
