import { NextResponse } from "next/server"

export async function GET() {
  try {
    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      nextauth: {
        secret: process.env.NEXTAUTH_SECRET ? "configured" : "missing",
        url: process.env.NEXTAUTH_URL || "not-set",
      },
    })
  } catch (error) {
    return NextResponse.json({ status: "error", error: String(error) }, { status: 500 })
  }
}
