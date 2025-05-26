import { type NextRequest, NextResponse } from "next/server"

const VAPI_PRIVATE_KEY = "0a4b2b25-ecba-4a82-864c-1b7f057260f5"

export async function POST(request: NextRequest) {
  try {
    const { agentId, publicKey, assistantOverrides } = await request.json()

    console.log("Starting VAPI call with agent:", agentId)

    // Make actual VAPI API call
    const response = await fetch("https://api.vapi.ai/call", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${VAPI_PRIVATE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        assistant: {
          id: agentId,
          ...(assistantOverrides || {}),
        },
        // For web calls, we don't need phone numbers
        type: "web",
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error("VAPI API Error:", response.status, errorData)
      throw new Error(`VAPI API returned ${response.status}: ${errorData}`)
    }

    const callData = await response.json()
    console.log("VAPI call created successfully:", callData.id)

    return NextResponse.json({
      success: true,
      callId: callData.id,
      status: callData.status,
      message: "VAPI call started successfully",
    })
  } catch (error) {
    console.error("VAPI call error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to start VAPI call",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
