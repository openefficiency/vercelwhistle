import { NextResponse } from "next/server"

export async function POST() {
  try {
    console.log("🚪 Logout API called")

    const response = NextResponse.json({ success: true, message: "Logged out" })

    // Clear session cookie
    response.cookies.set("aegis-session", "", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    })

    console.log("✅ Session cleared")
    return response
  } catch (error) {
    console.error("💥 Logout error:", error)
    return NextResponse.json({ error: "Logout failed", details: String(error) }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Logout endpoint is working",
    method: "POST",
  })
}
