"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, Search, MessageSquare, FileText, Clock, CheckCircle, AlertTriangle, Plus } from "lucide-react"

// Mock data for user's reports
const mockReports = [
  {
    id: "AEG-12345678",
    title: "Workplace Safety Concern",
    type: "safety",
    status: "investigating",
    submittedAt: "2024-01-15T10:30:00Z",
    lastUpdate: "2024-01-16T14:20:00Z",
    anonymous: true,
    hasUpdates: true,
  },
  {
    id: "AEG-12345680",
    title: "Financial Irregularities",
    type: "fraud",
    status: "resolved",
    submittedAt: "2024-01-10T09:15:00Z",
    lastUpdate: "2024-01-14T16:45:00Z",
    anonymous: false,
    hasUpdates: false,
  },
]

export default function WhistleblowerPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedReport, setSelectedReport] = useState(mockReports[0])

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
      <header className="bg-white/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Reports</h1>
                <p className="text-sm text-gray-600">Track your submitted reports and updates</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button asChild>
                <a href="/report">
                  <Plus className="h-4 w-4 mr-2" />
                  New Report
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href="/voice-report">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Voice Report
                </a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Reports List */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Your Reports</CardTitle>
                <CardDescription>Track the status of your submitted concerns</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search your reports..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Reports List */}
                {mockReports.map((report) => (
                  <div
                    key={report.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedReport.id === report.id
                        ? "border-blue-500 bg-blue-50 shadow-md"
                        : "hover:bg-gray-50 hover:shadow-sm"
                    }`}
                    onClick={() => setSelectedReport(report)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-sm">{report.title}</h3>
                      {report.hasUpdates && <div className="w-2 h-2 bg-red-500 rounded-full"></div>}
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getStatusColor(report.status)} variant="secondary">
                        <div className="flex items-center gap-1">
                          {getStatusIcon(report.status)}
                          {report.status}
                        </div>
                      </Badge>
                      {report.anonymous && (
                        <Badge variant="outline" className="text-xs">
                          Anonymous
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      <div>ID: {report.id}</div>
                      <div>Submitted: {new Date(report.submittedAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Report Details */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="details" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="updates">Updates</TabsTrigger>
                <TabsTrigger value="communication">Messages</TabsTrigger>
              </TabsList>

              <TabsContent value="details">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{selectedReport.title}</CardTitle>
                        <CardDescription>Report ID: {selectedReport.id}</CardDescription>
                      </div>
                      <Badge className={getStatusColor(selectedReport.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(selectedReport.status)}
                          {selectedReport.status}
                        </div>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-sm text-gray-600">Submission Details</h3>
                        <div className="space-y-1 text-sm">
                          <div>
                            Type: <span className="font-medium">{selectedReport.type}</span>
                          </div>
                          <div>
                            Submitted:{" "}
                            <span className="font-medium">{new Date(selectedReport.submittedAt).toLocaleString()}</span>
                          </div>
                          <div>
                            Last Update:{" "}
                            <span className="font-medium">{new Date(selectedReport.lastUpdate).toLocaleString()}</span>
                          </div>
                          <div>
                            Anonymous: <span className="font-medium">{selectedReport.anonymous ? "Yes" : "No"}</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-semibold text-sm text-gray-600">Current Status</h3>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            {getStatusIcon(selectedReport.status)}
                            <span className="font-medium capitalize">{selectedReport.status}</span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {selectedReport.status === "investigating"
                              ? "Your report is currently being investigated by our team. We will update you as soon as we have more information."
                              : selectedReport.status === "resolved"
                                ? "This case has been resolved. Thank you for bringing this to our attention."
                                : "Your report has been received and is being reviewed."}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm text-gray-600">What happens next?</h3>
                      <div className="space-y-2">
                        <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                          <div>
                            <p className="text-sm font-medium text-blue-900">Investigation Process</p>
                            <p className="text-xs text-blue-700">
                              Our ethics team will review your report and conduct a thorough investigation.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                          <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></div>
                          <div>
                            <p className="text-sm font-medium text-yellow-900">Regular Updates</p>
                            <p className="text-xs text-yellow-700">
                              You'll receive updates on the progress of your case through this portal.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                          <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                          <div>
                            <p className="text-sm font-medium text-green-900">Resolution</p>
                            <p className="text-xs text-green-700">
                              Once the investigation is complete, you'll be notified of the outcome and any actions
                              taken.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button variant="outline">
                        <FileText className="h-4 w-4 mr-2" />
                        Download Report
                      </Button>
                      <Button variant="outline">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Send Message
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="updates">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Case Updates</CardTitle>
                    <CardDescription>Timeline of actions and progress on your report</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        {
                          date: "2024-01-16T14:20:00Z",
                          title: "Investigation Update",
                          description:
                            "Our team has begun the formal investigation process. We have interviewed relevant parties and are reviewing documentation.",
                          type: "update",
                        },
                        {
                          date: "2024-01-15T16:45:00Z",
                          title: "Case Assigned",
                          description:
                            "Your report has been assigned to Senior Investigator John Smith for detailed review.",
                          type: "assignment",
                        },
                        {
                          date: "2024-01-15T10:30:00Z",
                          title: "Report Received",
                          description:
                            "Thank you for submitting your report. We have received it and will begin our review process.",
                          type: "received",
                        },
                      ].map((update, index) => (
                        <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                          <div className="flex-shrink-0 w-3 h-3 bg-blue-600 rounded-full mt-1"></div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-semibold text-sm">{update.title}</h3>
                              <span className="text-xs text-gray-500">
                                {new Date(update.date).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{update.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="communication">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Secure Communication</CardTitle>
                    <CardDescription>Communicate securely with the investigation team</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-900">Secure Messaging</span>
                        </div>
                        <p className="text-xs text-blue-700">
                          All messages are encrypted and your identity remains protected according to your privacy
                          settings.
                        </p>
                      </div>

                      {/* Message Thread */}
                      <div className="space-y-3">
                        <div className="flex justify-end">
                          <div className="max-w-xs bg-blue-600 text-white p-3 rounded-lg">
                            <p className="text-sm">
                              I have additional information that might be relevant to this case. How can I share it
                              securely?
                            </p>
                            <span className="text-xs opacity-75">Yesterday, 2:30 PM</span>
                          </div>
                        </div>
                        <div className="flex justify-start">
                          <div className="max-w-xs bg-gray-100 p-3 rounded-lg">
                            <p className="text-sm">
                              Thank you for reaching out. You can upload additional documents through the secure portal
                              or schedule a confidential call with our team.
                            </p>
                            <span className="text-xs text-gray-500">Today, 9:15 AM</span>
                          </div>
                        </div>
                      </div>

                      {/* Message Input */}
                      <div className="border-t pt-4">
                        <div className="flex gap-2">
                          <Input placeholder="Type your secure message..." className="flex-1" />
                          <Button>Send</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
