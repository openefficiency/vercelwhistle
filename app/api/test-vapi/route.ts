import { NextResponse } from "next/server"

const VAPI_PRIVATE_KEY = "0a4b2b25-ecba-4a82-864c-1b7f057260f5"
const VAPI_AGENT_ID = "bb8029bb-dde6-485a-9c32-d41b684568ff"
const VAPI_PUBLIC_KEY = "4669de51-f9ba-4e99-a9dd-e39279a6f510"

export async function GET() {
  try {
    console.log("🔍 Testing VAPI connection...")
    console.log("🔑 Using private key:", VAPI_PRIVATE_KEY.slice(0, 8) + "...")
    console.log("🤖 Looking for agent:", VAPI_AGENT_ID)

    // Test 1: Check VAPI API connection
    console.log("📡 Step 1: Testing VAPI API connection...")
    const response = await fetch("https://api.vapi.ai/assistant", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${VAPI_PRIVATE_KEY}`,
        "Content-Type": "application/json",
      },
    })

    console.log("📊 Response status:", response.status)
    console.log("📋 Response headers:", Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ VAPI API Error:", response.status, errorText)

      let errorMessage = `VAPI API returned ${response.status}`
      if (response.status === 401) {
        errorMessage = "Invalid VAPI private key - check your credentials"
      } else if (response.status === 403) {
        errorMessage = "VAPI access forbidden - check your account permissions"
      } else if (response.status === 429) {
        errorMessage = "VAPI rate limit exceeded - try again later"
      }

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          details: errorText,
          statusCode: response.status,
          troubleshooting: {
            step: "API Connection",
            suggestions: [
              "Verify your VAPI private key is correct",
              "Check if your VAPI account is active",
              "Ensure you have API access permissions",
              "Try again in a few minutes if rate limited",
            ],
          },
        },
        { status: response.status },
      )
    }

    const assistants = await response.json()
    console.log("✅ VAPI connection successful!")
    console.log("📝 Found assistants:", assistants.length)

    // Test 2: Check if our specific agent exists
    console.log("🔍 Step 2: Looking for our specific agent...")
    const ourAgent = assistants.find((a: any) => a.id === VAPI_AGENT_ID)

    if (ourAgent) {
      console.log("✅ Found our agent:", ourAgent.name || "Unnamed")
    } else {
      console.log("❌ Our agent not found in the list")
      console.log(
        "📋 Available agents:",
        assistants.map((a: any) => ({ id: a.id, name: a.name })),
      )
    }

    // Test 3: Test public key format
    console.log("🔍 Step 3: Validating public key format...")
    const publicKeyValid = VAPI_PUBLIC_KEY && VAPI_PUBLIC_KEY.length > 20

    return NextResponse.json({
      success: true,
      message: "VAPI connection successful",
      tests: {
        apiConnection: "✅ Passed",
        agentFound: ourAgent ? "✅ Passed" : "❌ Failed",
        publicKeyFormat: publicKeyValid ? "✅ Passed" : "❌ Failed",
      },
      data: {
        assistantCount: assistants.length,
        ourAgentFound: !!ourAgent,
        ourAgentId: VAPI_AGENT_ID,
        publicKey: VAPI_PUBLIC_KEY.slice(0, 8) + "...",
        agentDetails: ourAgent
          ? {
              id: ourAgent.id,
              name: ourAgent.name,
              model: ourAgent.model,
              voice: ourAgent.voice,
              createdAt: ourAgent.createdAt,
            }
          : null,
        availableAgents: assistants.map((a: any) => ({
          id: a.id,
          name: a.name || "Unnamed",
        })),
      },
      troubleshooting: ourAgent
        ? null
        : {
            issue: "Agent not found",
            suggestions: [
              "Check if the agent ID is correct",
              "Verify the agent exists in your VAPI account",
              "Make sure the agent is not deleted",
              "Try using one of the available agent IDs listed above",
            ],
          },
    })
  } catch (error) {
    console.error("💥 VAPI test error:", error)

    let errorMessage = "Failed to connect to VAPI"
    let suggestions = [
      "Check your internet connection",
      "Verify VAPI service is operational",
      "Try again in a few minutes",
    ]

    if (error instanceof TypeError && error.message.includes("fetch")) {
      errorMessage = "Network error - cannot reach VAPI servers"
      suggestions = [
        "Check your internet connection",
        "Verify you're not behind a firewall blocking VAPI",
        "Try again in a few minutes",
      ]
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: error instanceof Error ? error.message : "Unknown error",
        troubleshooting: {
          step: "Network Connection",
          suggestions,
        },
      },
      { status: 500 },
    )
  }
}
