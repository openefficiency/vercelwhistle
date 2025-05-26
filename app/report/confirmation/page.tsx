"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Shield, Copy, Download, MessageSquare, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ConfirmationPage() {
  const [trackingNumber, setTrackingNumber] = useState("")
  const [copied, setCopied] = useState(false)
  const [reportData, setReportData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get tracking number from URL
    const urlParams = new URLSearchParams(window.location.search)
    const tracking = urlParams.get("tracking")

    if (tracking) {
      setTrackingNumber(tracking)

      // Try to get report data from localStorage (replace with API call)
      try {
        const storedData = localStorage.getItem(`report_${tracking}`)
        if (storedData) {
          setReportData(JSON.parse(storedData))
        }
      } catch (error) {
        console.error("Error loading report data:", error)
      }
    } else {
      // If no tracking number, generate a fallback one
      const fallbackTracking = `AEG-${Date.now().toString().slice(-8)}`
      setTrackingNumber(fallbackTracking)
    }

    setLoading(false)
  }, [])

  const copyTrackingNumber = async () => {
    try {
      await navigator.clipboard.writeText(trackingNumber)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea")
      textArea.value = trackingNumber
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const downloadReceipt = () => {
    const submissionTime = reportData?.timestamp
      ? new Date(reportData.timestamp).toLocaleString()
      : new Date().toLocaleString()

    const receipt = `
AEGIS WHISTLEBLOWER PLATFORM
Report Submission Confirmation

Tracking Number: ${trackingNumber}
Submitted: ${submissionTime}
Status: Received and Under Review
Type: ${reportData?.reportType || "Not specified"}
Anonymous: ${reportData?.isAnonymous ? "Yes" : "No"}

Your report has been securely submitted and will be reviewed by our ethics team.
You can track the progress of your report using the tracking number above.

For questions or updates, visit: ${window.location.origin}/whistleblower

This is an automated confirmation. Please keep this tracking number for your records.

Report ID: ${trackingNumber}
Generated: ${new Date().toLocaleString()}
    `

    const blob = new Blob([receipt], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `aegis-report-${trackingNumber}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading confirmation...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Home</span>
          </Link>
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-green-600" />
            <span className="text-2xl font-bold text-gray-900">Aegis</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Success Message */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Report Submitted Successfully</h1>
            <p className="text-lg text-gray-600">
              Thank you for your courage in speaking up. Your report has been securely received and will be handled with
              the utmost confidentiality.
            </p>
          </div>

          {/* Tracking Information */}
          <Card className="border-0 shadow-xl mb-8">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center space-x-2">
                <Shield className="h-6 w-6 text-blue-600" />
                <span>Your Report Details</span>
              </CardTitle>
              <CardDescription>Keep this information for your records and future reference</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Tracking Number */}
              <div className="text-center">
                <label className="block text-sm font-medium text-gray-600 mb-2">Tracking Number</label>
                <div className="flex items-center justify-center space-x-3">
                  <Badge variant="outline" className="text-lg px-4 py-2 font-mono">
                    {trackingNumber}
                  </Badge>
                  <Button variant="outline" size="sm" onClick={copyTrackingNumber}>
                    <Copy className="h-4 w-4 mr-1" />
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                </div>
              </div>

              {/* Status */}
              <div className="text-center">
                <label className="block text-sm font-medium text-gray-600 mb-2">Current Status</label>
                <Badge className="bg-blue-100 text-blue-800">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Received and Under Review
                </Badge>
              </div>

              {/* Submission Time */}
              <div className="text-center">
                <label className="block text-sm font-medium text-gray-600 mb-2">Submitted</label>
                <p className="text-gray-900">
                  {reportData?.timestamp
                    ? new Date(reportData.timestamp).toLocaleString()
                    : new Date().toLocaleString()}
                </p>
              </div>

              {/* Report Type */}
              {reportData?.reportType && (
                <div className="text-center">
                  <label className="block text-sm font-medium text-gray-600 mb-2">Report Type</label>
                  <p className="text-gray-900 capitalize">{reportData.reportType.replace(/([A-Z])/g, " $1")}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* What Happens Next */}
          <Card className="border-0 shadow-xl mb-8">
            <CardHeader>
              <CardTitle>What Happens Next?</CardTitle>
              <CardDescription>Here's what you can expect from our investigation process</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-blue-600 font-semibold text-sm">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Initial Review</h3>
                    <p className="text-gray-600 text-sm">
                      Our ethics team will review your report within 24-48 hours to assess the situation and determine
                      next steps.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-yellow-600 font-semibold text-sm">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Investigation Assignment</h3>
                    <p className="text-gray-600 text-sm">
                      If warranted, your case will be assigned to a qualified investigator who will conduct a thorough
                      and impartial investigation.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-green-600 font-semibold text-sm">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Regular Updates</h3>
                    <p className="text-gray-600 text-sm">
                      You'll receive updates on the progress of your case. Use your tracking number to check status
                      anytime.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-purple-600 font-semibold text-sm">4</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Resolution & Follow-up</h3>
                    <p className="text-gray-600 text-sm">
                      Once the investigation is complete, appropriate actions will be taken and you'll be notified of
                      the outcome.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <Button onClick={downloadReceipt} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download Receipt
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/whistleblower">
                <MessageSquare className="h-4 w-4 mr-2" />
                Track Your Report
              </Link>
            </Button>
          </div>

          {/* Important Information */}
          <Card className="border-0 shadow-xl bg-blue-50">
            <CardContent className="p-6">
              <h3 className="font-semibold text-blue-900 mb-3">Important Information</h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>
                  • <strong>Keep your tracking number safe</strong> - This is the only way to access your report status
                </li>
                <li>
                  • <strong>Your identity is protected</strong> - Anonymous reports cannot be traced back to you
                </li>
                <li>
                  • <strong>No retaliation policy</strong> - We have strict policies against retaliation for good faith
                  reports
                </li>
                <li>
                  • <strong>Confidential process</strong> - Information is shared only on a need-to-know basis
                </li>
                <li>
                  • <strong>Professional investigation</strong> - All reports are handled by trained professionals
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Support Information */}
          <div className="text-center mt-8">
            <p className="text-gray-600 mb-4">Need help or have questions about your report?</p>
            <div className="flex justify-center gap-4">
              <Button asChild variant="outline">
                <Link href="/whistleblower">Access Whistleblower Portal</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/">Return to Home</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
