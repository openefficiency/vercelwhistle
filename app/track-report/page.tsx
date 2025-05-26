"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Search, MessageSquare, Gift, Clock, CheckCircle, AlertTriangle, ArrowLeft } from "lucide-react"
import Link from "next/link"

// Mock data for demonstration
const mockReportData: Record<string, any> = {
  "AEG-12345678": {
    id: "AEG-12345678",
    title: "Workplace Safety Concern",
    type: "safety",
    status: "investigating",
    submittedAt: "2024-01-15T10:30:00Z",
    lastUpdate: "2024-01-16T14:20:00Z",
    anonymous: true,
    investigatorQueries: [
      {
        id: 1,
        from: "Senior Investigator John Smith",
        message:
          "Thank you for your report. Could you provide more details about the specific safety equipment that was not properly maintained?",
        timestamp: "2024-01-16T14:20:00Z",
        responded: false,
      },
    ],
    ethicsOfficerMessages: [
      {
        id: 1,
        from: "Ethics Officer Jane Doe",
        message:
          "We appreciate your courage in reporting this concern. Your report is being taken seriously and investigated thoroughly.",
        timestamp: "2024-01-15T16:45:00Z",
        type: "acknowledgment",
      },
    ],
    rewards: [
      {
        id: 1,
        type: "recognition",
        title: "Courage in Reporting Award",
        description: "For demonstrating courage in reporting safety concerns",
        amount: null,
        status: "pending",
        timestamp: "2024-01-16T10:00:00Z",
      },
    ],
  },
  "AEG-12345680": {
    id: "AEG-12345680",
    title: "Financial Irregularities",
    type: "fraud",
    status: "resolved",
    submittedAt: "2024-01-10T09:15:00Z",
    lastUpdate: "2024-01-14T16:45:00Z",
    anonymous: false,
    investigatorQueries: [],
    ethicsOfficerMessages: [
      {
        id: 1,
        from: "Ethics Officer Jane Doe",
        message:
          "Your report has been resolved. Thank you for bringing this to our attention. Appropriate actions have been taken.",
        timestamp: "2024-01-14T16:45:00Z",
        type: "resolution",
      },
    ],
    rewards: [
      {
        id: 1,
        type: "monetary",
        title: "Whistleblower Protection Reward",
        description: "For reporting financial misconduct that led to recovery of funds",
        amount: 5000,
        status: "approved",
        timestamp: "2024-01-14T16:45:00Z",
      },
    ],
  },
}

export default function TrackReportPage() {
  const [trackingNumber, setTrackingNumber] = useState("")
  const [reportData, setReportData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [response, setResponse] = useState("")

  const searchReport = async () => {
    if (!trackingNumber.trim()) {
      setError("Please enter a tracking number")
      return
    }

    setLoading(true)
    setError("")
    setReportData(null)

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Check mock data first
      const mockData = mockReportData[trackingNumber.toUpperCase()]
      if (mockData) {
        setReportData(mockData)
        return
      }

      // Check localStorage for user's own reports
      const storedData = localStorage.getItem(`report_${trackingNumber}`)
      if (storedData) {
        const parsed = JSON.parse(storedData)
        setReportData({
          ...parsed,
          investigatorQueries: [],
          ethicsOfficerMessages: [
            {
              id: 1,
              from: "Ethics Officer",
              message: "Thank you for your report. It has been received and is under review.",
              timestamp: parsed.timestamp,
              type: "acknowledgment",
            },
          ],
          rewards: [],
        })
        return
      }

      setError("Report not found. Please check your tracking number and try again.")
    } catch (err) {
      setError("Error searching for report. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const submitResponse = async () => {
    if (!response.trim()) {
      alert("Please enter a response")
      return
    }

    // Simulate submitting response
    alert("Response submitted successfully!")
    setResponse("")

    // Mark query as responded (in real app, this would be an API call)
    if (reportData?.investigatorQueries?.length > 0) {
      setReportData({
        ...reportData,
        investigatorQueries: reportData.investigatorQueries.map((q: any) => ({
          ...q,
          responded: true,
        })),
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted":
        return "bg-blue-100 text-blue-800"
      case "investigating":
        return "bg-yellow-100 text-yellow-800"
      case "resolved":
        return "bg-green-100 text-green-800"
      case "closed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "submitted":
        return <Clock className="h-4 w-4" />
      case "investigating":
        return <AlertTriangle className="h-4 w-4" />
      case "resolved":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
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
            <span className="text-2xl font-bold text-gray-900">Track Your Report</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Track Your Report</h1>
            <p className="text-lg text-gray-600">
              Enter your tracking number to check the status of your report and see any updates from investigators.
            </p>
          </div>

          {/* Search Section */}
          <Card className="border-0 shadow-xl mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="h-6 w-6 text-blue-600" />
                <span>Find Your Report</span>
              </CardTitle>
              <CardDescription>Enter the tracking number you received when you submitted your report</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="tracking">Tracking Number</Label>
                  <Input
                    id="tracking"
                    placeholder="e.g., AEG-12345678"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
                    onKeyPress={(e) => e.key === "Enter" && searchReport()}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={searchReport} disabled={loading}>
                    {loading ? "Searching..." : "Search"}
                  </Button>
                </div>
              </div>

              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              <div className="text-sm text-gray-600">
                <p>
                  <strong>Demo tracking numbers to try:</strong>
                </p>
                <p>• AEG-12345678 (Active investigation with queries)</p>
                <p>• AEG-12345680 (Resolved case with reward)</p>
              </div>
            </CardContent>
          </Card>

          {/* Report Details */}
          {reportData && (
            <div className="space-y-6">
              {/* Status Overview */}
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{reportData.title || "Your Report"}</CardTitle>
                      <CardDescription>Report ID: {reportData.id}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(reportData.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(reportData.status)}
                        {reportData.status}
                      </div>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Submitted</Label>
                      <p className="text-sm">{new Date(reportData.submittedAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Last Update</Label>
                      <p className="text-sm">{new Date(reportData.lastUpdate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Type</Label>
                      <p className="text-sm capitalize">{reportData.type}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Investigator Queries */}
              {reportData.investigatorQueries && reportData.investigatorQueries.length > 0 && (
                <Card className="border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MessageSquare className="h-6 w-6 text-orange-600" />
                      <span>Investigator Queries</span>
                      <Badge variant="destructive">Action Required</Badge>
                    </CardTitle>
                    <CardDescription>The investigator has questions about your report</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {reportData.investigatorQueries.map((query: any) => (
                      <div key={query.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{query.from}</h4>
                          <Badge variant={query.responded ? "default" : "destructive"}>
                            {query.responded ? "Responded" : "Pending Response"}
                          </Badge>
                        </div>
                        <p className="text-gray-700 mb-3">{query.message}</p>
                        <p className="text-xs text-gray-500">{new Date(query.timestamp).toLocaleString()}</p>

                        {!query.responded && (
                          <div className="mt-4 space-y-2">
                            <Label htmlFor="response">Your Response</Label>
                            <textarea
                              id="response"
                              className="w-full p-3 border rounded-lg"
                              rows={3}
                              placeholder="Type your response here..."
                              value={response}
                              onChange={(e) => setResponse(e.target.value)}
                            />
                            <Button onClick={submitResponse} size="sm">
                              Submit Response
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Ethics Officer Messages */}
              {reportData.ethicsOfficerMessages && reportData.ethicsOfficerMessages.length > 0 && (
                <Card className="border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Shield className="h-6 w-6 text-green-600" />
                      <span>Ethics Officer Updates</span>
                    </CardTitle>
                    <CardDescription>Messages from the ethics team</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {reportData.ethicsOfficerMessages.map((message: any) => (
                      <div key={message.id} className="border rounded-lg p-4 bg-green-50">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-green-900">{message.from}</h4>
                          <Badge className="bg-green-100 text-green-800">{message.type}</Badge>
                        </div>
                        <p className="text-green-800 mb-2">{message.message}</p>
                        <p className="text-xs text-green-600">{new Date(message.timestamp).toLocaleString()}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Rewards */}
              {reportData.rewards && reportData.rewards.length > 0 && (
                <Card className="border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Gift className="h-6 w-6 text-purple-600" />
                      <span>Recognition & Rewards</span>
                    </CardTitle>
                    <CardDescription>Awards and recognition for your courage in reporting</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {reportData.rewards.map((reward: any) => (
                      <div key={reward.id} className="border rounded-lg p-4 bg-purple-50">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-purple-900">{reward.title}</h4>
                          <Badge
                            className={
                              reward.status === "approved"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }
                          >
                            {reward.status}
                          </Badge>
                        </div>
                        <p className="text-purple-800 mb-2">{reward.description}</p>
                        {reward.amount && (
                          <p className="text-purple-900 font-semibold">Amount: ${reward.amount.toLocaleString()}</p>
                        )}
                        <p className="text-xs text-purple-600 mt-2">{new Date(reward.timestamp).toLocaleString()}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Help Section */}
          <Card className="border-0 shadow-xl bg-blue-50 mt-8">
            <CardContent className="p-6">
              <h3 className="font-semibold text-blue-900 mb-3">Need Help?</h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>• If you can't find your tracking number, check your email or download receipt</li>
                <li>• Tracking numbers are case-sensitive and start with "AEG-"</li>
                <li>• If you have questions about your case, respond to investigator queries above</li>
                <li>• For technical issues, contact our support team</li>
              </ul>
              <div className="mt-4 flex gap-3">
                <Button asChild variant="outline" size="sm">
                  <Link href="/report">Submit New Report</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/whistleblower">Full Portal Access</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
