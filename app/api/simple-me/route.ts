import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    console.log("👤 Session check API called")

    const sessionCookie = request.cookies.get("aegis-session")

    if (!sessionCookie?.value) {
      console.log("❌ No session cookie found")
      return NextResponse.json({ user: null })
    }

    try {
      // Decode session data
      const sessionData = JSON.parse(Buffer.from(sessionCookie.value, "base64").toString())
      console.log("✅ Session decoded:", sessionData.email, sessionData.role)

      // Check if session is expired (24 hours)
      const now = Date.now()
      const sessionAge = now - sessionData.loginTime
      const maxAge = 24 * 60 * 60 * 1000 // 24 hours

      if (sessionAge > maxAge) {
        console.log("❌ Session expired")
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
    } catch (decodeError) {
      console.log("❌ Session decode error:", decodeError)
      return NextResponse.json({ user: null })
    }
  } catch (error) {
    console.error("💥 Session check error:", error)
    return NextResponse.json({ user: null })
  }
}
