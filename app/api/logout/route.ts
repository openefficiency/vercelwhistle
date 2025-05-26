import { NextResponse } from "next/server"

export async function POST() {
  try {
    const response = NextResponse.json({ success: true })

    // Clear the session cookie
    response.cookies.set("aegis-session", "", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    })

    console.log("Logout successful")
    return response
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Logout failed" }, { status: 500 })
  }
}
