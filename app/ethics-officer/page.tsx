"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Shield,
  Search,
  Filter,
  AlertTriangle,
  Clock,
  CheckCircle,
  Eye,
  MessageSquare,
  TrendingUp,
  Users,
} from "lucide-react"

// Mock data for reports
const mockReports = [
  {
    id: "AEG-12345678",
    type: "harassment",
    status: "new",
    priority: "high",
    description: "Inappropriate behavior in workplace meetings...",
    submittedAt: "2024-01-15T10:30:00Z",
    assignedTo: null,
    anonymous: true,
  },
  {
    id: "AEG-12345679",
    type: "fraud",
    status: "investigating",
    priority: "critical",
    description: "Suspicious financial transactions in Q4 reports...",
    submittedAt: "2024-01-14T14:20:00Z",
    assignedTo: "John Smith",
    anonymous: false,
  },
  {
    id: "AEG-12345680",
    type: "safety",
    status: "resolved",
    priority: "medium",
    description: "Safety equipment not properly maintained...",
    submittedAt: "2024-01-13T09:15:00Z",
    assignedTo: "Sarah Johnson",
    anonymous: true,
  },
]

export default function EthicsOfficerPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
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

  const filteredReports = mockReports.filter((report) => {
    const matchesSearch =
      report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "all" || report.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-green-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Ethics Officer Portal</h1>
                <p className="text-sm text-gray-600">Manage and oversee ethical concerns</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-green-600 border-green-600">
                Officer: Jane Doe
              </Badge>
              <Button variant="outline" size="sm">
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">New Reports</p>
                  <p className="text-3xl font-bold text-blue-600">12</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-3xl font-bold text-yellow-600">8</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Resolved</p>
                  <p className="text-3xl font-bold text-green-600">45</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-3xl font-bold text-purple-600">23</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="reports" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="reports">All Reports</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="investigators">Investigators</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Report Management</CardTitle>
                <CardDescription>Review, assign, and track the progress of all submitted reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search reports by ID or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm">
                      Export
                    </Button>
                  </div>
                </div>

                {/* Reports List */}
                <div className="space-y-4">
                  {filteredReports.map((report) => (
                    <Card key={report.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-gray-900">{report.id}</h3>
                              <Badge className={getStatusColor(report.status)}>{report.status}</Badge>
                              <Badge className={getPriorityColor(report.priority)}>{report.priority}</Badge>
                              {report.anonymous && <Badge variant="outline">Anonymous</Badge>}
                            </div>
                            <p className="text-gray-600 mb-3">{report.description}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>Type: {report.type}</span>
                              <span>Submitted: {new Date(report.submittedAt).toLocaleDateString()}</span>
                              {report.assignedTo && <span>Assigned to: {report.assignedTo}</span>}
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button variant="outline" size="sm">
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Message
                            </Button>
                            <Button size="sm">Assign</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Dashboard</CardTitle>
                <CardDescription>Track trends and patterns in reported concerns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">Reports by Category Chart</p>
                  </div>
                  <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">Resolution Time Trends</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="investigators">
            <Card>
              <CardHeader>
                <CardTitle>Investigator Management</CardTitle>
                <CardDescription>Manage investigator assignments and workloads</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {["John Smith", "Sarah Johnson", "Mike Wilson"].map((investigator) => (
                    <div key={investigator} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Users className="h-8 w-8 text-gray-400" />
                        <div>
                          <h3 className="font-semibold">{investigator}</h3>
                          <p className="text-sm text-gray-600">Active Cases: 3</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          View Cases
                        </Button>
                        <Button size="sm">Assign New</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Portal Settings</CardTitle>
                <CardDescription>Configure portal preferences and notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">Notification Preferences</h3>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked />
                        <span className="text-sm">Email notifications for new reports</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked />
                        <span className="text-sm">SMS alerts for critical reports</span>
                      </label>
                    </div>
                  </div>
                  <Button>Save Settings</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
