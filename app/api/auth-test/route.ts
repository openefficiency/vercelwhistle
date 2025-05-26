import { NextResponse } from "next/server"

export async function GET() {
  try {
    return NextResponse.json({
      status: "working",
      message: "Auth API is functional",
      timestamp: new Date().toISOString(),
      routes: ["/api/login", "/api/logout", "/api/me"],
    })
  } catch (error) {
    return NextResponse.json({ error: "API Error", details: String(error) }, { status: 500 })
  }
}
