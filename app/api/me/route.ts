import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get("aegis-session")?.value

    if (!sessionToken) {
      return NextResponse.json({ user: null })
    }

    // Decode the session token
    const sessionData = JSON.parse(atob(sessionToken))

    // Check if session is still valid (24 hours)
    const now = Date.now()
    const sessionAge = now - sessionData.timestamp
    const maxAge = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

    if (sessionAge > maxAge) {
      return NextResponse.json({ user: null })
    }

    return NextResponse.json({
      user: {
        id: sessionData.userId,
        email: sessionData.email,
        name: sessionData.name,
        role: sessionData.role,
        department: sessionData.department,
      },
    })
  } catch (error) {
    console.error("Session check error:", error)
    return NextResponse.json({ user: null })
  }
}
