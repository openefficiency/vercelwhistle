import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Users, Eye, MessageSquare } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">Aegis</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/report" className="text-gray-600 hover:text-gray-900 transition-colors">
              Report
            </Link>
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors">
              Dashboard
            </Link>
            <Link href="/login" className="text-gray-600 hover:text-gray-900 transition-colors">
              Login
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Speak Up
            <span className="block text-blue-600">Safely & Securely</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Your voice matters. Report ethical concerns anonymously with our AI-powered platform that ensures your
            protection while promoting transparency.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link href="/report">Make a Report</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
              <Link href="/voice-report">Voice Report</Link>
            </Button>
            <Button asChild variant="secondary" size="lg" className="text-lg px-8 py-6">
              <Link href="/track-report">Track Report</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How Aegis Protects You</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center">
                <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Anonymous Reporting</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Your identity is protected with end-to-end encryption and anonymous submission options.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center">
                <MessageSquare className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle>AI Voice Assistant</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Report concerns naturally through our AI-powered voice interface for easier submission.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center">
                <Eye className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <CardTitle>Real-time Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Track your report's progress and receive updates while maintaining complete anonymity.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* User Types */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Choose Your Portal</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all hover:scale-105">
              <CardHeader className="text-center">
                <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Whistleblower</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="mb-4">Submit reports and track their progress securely.</CardDescription>
                <Button asChild className="w-full">
                  <Link href="/whistleblower">Access Portal</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all hover:scale-105">
              <CardHeader className="text-center">
                <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle>Ethics Officer</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="mb-4">
                  Review and manage incoming reports and investigations.
                </CardDescription>
                <Button asChild className="w-full">
                  <Link href="/ethics-officer">Access Portal</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all hover:scale-105">
              <CardHeader className="text-center">
                <Eye className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <CardTitle>Investigator</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="mb-4">Conduct investigations and document findings.</CardDescription>
                <Button asChild className="w-full">
                  <Link href="/investigator">Access Portal</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Shield className="h-6 w-6" />
            <span className="text-xl font-bold">Aegis</span>
          </div>
          <p className="text-gray-400">Protecting whistleblowers, promoting transparency.</p>
        </div>
      </footer>
    </div>
  )
}
