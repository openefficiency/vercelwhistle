import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    message: "Auth API is working!",
    timestamp: new Date().toISOString(),
    users: [
      { email: "jane.doe@company.com", role: "ethics_officer" },
      { email: "john.smith@company.com", role: "investigator" },
      { email: "admin@company.com", role: "admin" },
    ],
  })
}

export async function POST() {
  return NextResponse.json({
    message: "POST method working!",
    timestamp: new Date().toISOString(),
  })
}
