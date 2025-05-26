"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Shield, ArrowLeft, Upload, Eye, EyeOff } from "lucide-react"
import Link from "next/link"

export default function ReportPage() {
  const [isAnonymous, setIsAnonymous] = useState(true)
  const [reportType, setReportType] = useState("")
  const [description, setDescription] = useState("")
  const [contactInfo, setContactInfo] = useState("")
  const [showContactInfo, setShowContactInfo] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Generate tracking number
    const trackingNumber = `AEG-${Date.now().toString().slice(-8)}`

    // Here you would submit to your backend
    console.log({
      reportType,
      description,
      isAnonymous,
      contactInfo: isAnonymous ? null : contactInfo,
      trackingNumber,
      timestamp: new Date().toISOString(),
    })

    // Redirect to confirmation page
    window.location.href = `/report/confirmation?tracking=${trackingNumber}`
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
            <span className="text-2xl font-bold text-gray-900">Aegis Report</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Submit a Report</h1>
            <p className="text-lg text-gray-600">
              Your report will be handled confidentially and investigated thoroughly.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle>Report Details</CardTitle>
                <CardDescription>
                  Please provide as much detail as possible to help us investigate your concern.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Anonymous Toggle */}
                <div className="flex items-center space-x-2 p-4 bg-blue-50 rounded-lg">
                  <Checkbox id="anonymous" checked={isAnonymous} onCheckedChange={setIsAnonymous} />
                  <Label htmlFor="anonymous" className="text-sm font-medium">
                    Submit this report anonymously
                  </Label>
                  <Shield className="h-4 w-4 text-blue-600 ml-auto" />
                </div>

                {/* Report Type */}
                <div className="space-y-2">
                  <Label htmlFor="report-type">Type of Concern *</Label>
                  <Select value={reportType} onValueChange={setReportType} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select the type of concern" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="harassment">Harassment or Discrimination</SelectItem>
                      <SelectItem value="fraud">Financial Fraud or Misconduct</SelectItem>
                      <SelectItem value="safety">Safety Violations</SelectItem>
                      <SelectItem value="corruption">Corruption or Bribery</SelectItem>
                      <SelectItem value="data">Data Privacy Violations</SelectItem>
                      <SelectItem value="environmental">Environmental Concerns</SelectItem>
                      <SelectItem value="other">Other Ethical Concerns</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description of Concern *</Label>
                  <Textarea
                    id="description"
                    placeholder="Please describe what happened, when it occurred, who was involved, and any other relevant details..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[120px]"
                    required
                  />
                </div>

                {/* File Upload */}
                <div className="space-y-2">
                  <Label>Supporting Documents (Optional)</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Drag and drop files here, or click to select</p>
                    <p className="text-xs text-gray-500 mt-1">Supported: PDF, DOC, JPG, PNG (Max 10MB)</p>
                  </div>
                </div>

                {/* Contact Information */}
                {!isAnonymous && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Contact Information</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowContactInfo(!showContactInfo)}
                      >
                        {showContactInfo ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {showContactInfo && (
                      <div className="space-y-2">
                        <Input
                          placeholder="Email address or phone number"
                          value={contactInfo}
                          onChange={(e) => setContactInfo(e.target.value)}
                        />
                        <p className="text-xs text-gray-500">
                          This information will only be used to contact you about your report if needed.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Submit Button */}
                <Button type="submit" className="w-full" size="lg">
                  Submit Report Securely
                </Button>

                {/* Security Notice */}
                <div className="text-center text-xs text-gray-500 space-y-1">
                  <p>🔒 Your report is encrypted and transmitted securely</p>
                  <p>🛡️ Anonymous reports cannot be traced back to you</p>
                  <p>📱 You'll receive a tracking number to follow up</p>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </div>
  )
}
