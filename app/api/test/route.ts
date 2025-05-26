import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    message: "API routes are working!",
    timestamp: new Date().toISOString(),
    nextauth: {
      secret: process.env.NEXTAUTH_SECRET ? "✅ Set" : "❌ Missing",
      url: process.env.NEXTAUTH_URL || "❌ Not set",
    },
  })
}
