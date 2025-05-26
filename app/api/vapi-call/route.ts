import { type NextRequest, NextResponse } from "next/server"

const VAPI_PRIVATE_KEY = "0a4b2b25-ecba-4a82-864c-1b7f057260f5"
const VAPI_AGENT_ID = "bb8029bb-dde6-485a-9c32-d41b684568ff"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log("Creating VAPI call for web client...")

    const response = await fetch("https://api.vapi.ai/call", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${VAPI_PRIVATE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "web",
        assistant: {
          id: VAPI_AGENT_ID,
          variableValues: {
            platform: "aegis",
            reportType: "whistleblower",
            userRole: "reporter",
          },
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("VAPI API Error:", response.status, errorText)
      throw new Error(`VAPI API error: ${response.status}`)
    }

    const callData = await response.json()

    return NextResponse.json({
      success: true,
      callId: callData.id,
      webCallUrl: callData.webCallUrl,
      status: callData.status,
    })
  } catch (error) {
    console.error("VAPI call creation error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create VAPI call",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
