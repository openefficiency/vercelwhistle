"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, FileText, Clock, MessageSquare, Upload, Calendar } from "lucide-react"

// Mock data for assigned cases
const mockCases = [
  {
    id: "AEG-12345679",
    title: "Financial Fraud Investigation",
    type: "fraud",
    priority: "critical",
    status: "investigating",
    assignedDate: "2024-01-14",
    dueDate: "2024-01-28",
    description: "Suspicious financial transactions in Q4 reports requiring detailed investigation...",
    evidence: ["Financial_Report_Q4.pdf", "Email_Thread.pdf"],
    notes: "Initial review shows discrepancies in expense reports. Need to interview department head.",
    progress: 60,
  },
  {
    id: "AEG-12345681",
    title: "Workplace Harassment Case",
    type: "harassment",
    priority: "high",
    status: "new",
    assignedDate: "2024-01-15",
    dueDate: "2024-01-29",
    description: "Multiple reports of inappropriate behavior from senior manager...",
    evidence: ["Witness_Statement_1.pdf"],
    notes: "",
    progress: 10,
  },
]

export default function InvestigatorPage() {
  const [selectedCase, setSelectedCase] = useState(mockCases[0])
  const [newNote, setNewNote] = useState("")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800"
      case "investigating":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Eye className="h-8 w-8 text-purple-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Investigator Portal</h1>
                <p className="text-sm text-gray-600">Manage your assigned investigations</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-purple-600 border-purple-600">
                Investigator: John Smith
              </Badge>
              <Button variant="outline" size="sm">
                Profile
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cases List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>My Cases</CardTitle>
                <CardDescription>Cases assigned to you for investigation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockCases.map((case_) => (
                  <div
                    key={case_.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedCase.id === case_.id ? "border-purple-500 bg-purple-50" : "hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedCase(case_)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-sm">{case_.title}</h3>
                      <Badge className={getPriorityColor(case_.priority)} variant="secondary">
                        {case_.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getStatusColor(case_.status)} variant="secondary">
                        {case_.status}
                      </Badge>
                      <span className="text-xs text-gray-500">{case_.id}</span>
                    </div>
                    <div className="text-xs text-gray-600">Due: {new Date(case_.dueDate).toLocaleDateString()}</div>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${case_.progress}%` }}></div>
                      </div>
                      <span className="text-xs text-gray-500">{case_.progress}% complete</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Case Details */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="evidence">Evidence</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{selectedCase.title}</CardTitle>
                        <CardDescription>Case ID: {selectedCase.id}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getStatusColor(selectedCase.status)}>{selectedCase.status}</Badge>
                        <Badge className={getPriorityColor(selectedCase.priority)}>{selectedCase.priority}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-2">Case Description</h3>
                      <p className="text-gray-700">{selectedCase.description}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Assigned Date</Label>
                        <div className="flex items-center mt-1">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <span>{new Date(selectedCase.assignedDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Due Date</Label>
                        <div className="flex items-center mt-1">
                          <Clock className="h-4 w-4 text-gray-400 mr-2" />
                          <span>{new Date(selectedCase.dueDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-600 mb-2 block">Progress</Label>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-purple-600 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${selectedCase.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-500 mt-1">{selectedCase.progress}% complete</span>
                    </div>

                    <div className="flex gap-3">
                      <Button>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Contact Ethics Officer
                      </Button>
                      <Button variant="outline">
                        <FileText className="h-4 w-4 mr-2" />
                        Generate Report
                      </Button>
                      <Button variant="outline">Update Status</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="evidence">
                <Card>
                  <CardHeader>
                    <CardTitle>Evidence & Documents</CardTitle>
                    <CardDescription>Manage case evidence and supporting documents</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Upload Area */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Drag and drop evidence files here, or click to select</p>
                      <Button variant="outline" size="sm" className="mt-2">
                        Upload Files
                      </Button>
                    </div>

                    {/* Evidence List */}
                    <div className="space-y-2">
                      <h3 className="font-semibold">Current Evidence</h3>
                      {selectedCase.evidence.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-5 w-5 text-gray-400" />
                            <span className="text-sm">{file}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                            <Button variant="outline" size="sm">
                              Download
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notes">
                <Card>
                  <CardHeader>
                    <CardTitle>Investigation Notes</CardTitle>
                    <CardDescription>Document your investigation progress and findings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Current Notes */}
                    {selectedCase.notes && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-semibold mb-2">Previous Notes</h3>
                        <p className="text-sm text-gray-700">{selectedCase.notes}</p>
                      </div>
                    )}

                    {/* Add New Note */}
                    <div className="space-y-2">
                      <Label htmlFor="new-note">Add Investigation Note</Label>
                      <Textarea
                        id="new-note"
                        placeholder="Document your findings, interviews, or next steps..."
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        className="min-h-[100px]"
                      />
                      <Button>Save Note</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="timeline">
                <Card>
                  <CardHeader>
                    <CardTitle>Case Timeline</CardTitle>
                    <CardDescription>Track important events and milestones</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { date: "2024-01-15", event: "Case assigned to investigator", type: "assignment" },
                        { date: "2024-01-14", event: "Initial report submitted", type: "report" },
                        { date: "2024-01-14", event: "Case created by ethics officer", type: "creation" },
                      ].map((item, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="flex-shrink-0 w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                          <div>
                            <p className="text-sm font-medium">{item.event}</p>
                            <p className="text-xs text-gray-500">{new Date(item.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
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
