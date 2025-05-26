import { type NextRequest, NextResponse } from "next/server"

const VAPI_PRIVATE_KEY = "0a4b2b25-ecba-4a82-864c-1b7f057260f5"

export async function POST(request: NextRequest) {
  try {
    const { agentId, publicKey } = await request.json()

    // For demo purposes, return a mock response
    // In production, you would make the actual VAPI API call
    console.log("VAPI call requested with:", { agentId, publicKey })

    // Simulate API response
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return NextResponse.json({
      success: true,
      callId: `demo-call-${Date.now()}`,
      status: "initiated",
      message: "Demo mode - VAPI integration would be active in production",
    })

    /* 
    // Production VAPI integration would look like this:
    const response = await fetch("https://api.vapi.ai/call", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${VAPI_PRIVATE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        assistant: {
          id: agentId,
        },
        customer: {
          number: "+1234567890", // This would be dynamic in production
        },
        phoneNumberId: publicKey,
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error("VAPI API Error:", errorData)
      throw new Error(`VAPI API returned ${response.status}: ${errorData}`)
    }

    const callData = await response.json()

    return NextResponse.json({
      success: true,
      callId: callData.id,
      status: callData.status,
    })
    */
  } catch (error) {
    console.error("VAPI call error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Voice service temporarily unavailable. Please use the text form instead.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
