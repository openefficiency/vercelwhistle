import { NextResponse } from "next/server"

const VAPI_PRIVATE_KEY = "0a4b2b25-ecba-4a82-864c-1b7f057260f5"
const VAPI_AGENT_ID = "bb8029bb-dde6-485a-9c32-d41b684568ff"

export async function GET() {
  try {
    console.log("Testing VAPI connection...")

    // Test VAPI API connection
    const response = await fetch("https://api.vapi.ai/assistant", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${VAPI_PRIVATE_KEY}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("VAPI API Error:", response.status, errorText)
      return NextResponse.json(
        {
          success: false,
          error: `VAPI API returned ${response.status}`,
          details: errorText,
        },
        { status: response.status },
      )
    }

    const assistants = await response.json()
    console.log("VAPI connection successful, assistants:", assistants.length)

    // Check if our specific agent exists
    const ourAgent = assistants.find((a: any) => a.id === VAPI_AGENT_ID)

    return NextResponse.json({
      success: true,
      message: "VAPI connection successful",
      assistantCount: assistants.length,
      ourAgentFound: !!ourAgent,
      ourAgentId: VAPI_AGENT_ID,
      agentDetails: ourAgent || null,
    })
  } catch (error) {
    console.error("VAPI test error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to connect to VAPI",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
