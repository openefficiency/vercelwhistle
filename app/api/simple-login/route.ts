import { type NextRequest, NextResponse } from "next/server"

// Simple user database
const USERS = [
  {
    id: "1",
    email: "jane.doe@company.com",
    password: "ethics123",
    name: "Jane Doe",
    role: "ethics_officer",
    department: "Ethics & Compliance",
  },
  {
    id: "2",
    email: "john.smith@company.com",
    password: "investigate123",
    name: "John Smith",
    role: "investigator",
    department: "Internal Investigations",
  },
  {
    id: "3",
    email: "admin@company.com",
    password: "admin123",
    name: "Admin",
    role: "admin",
    department: "IT Security",
  },
]

export async function POST(request: NextRequest) {
  try {
    console.log("🔐 Login API called")

    const body = await request.json()
    console.log("📝 Request body:", body)

    const { email, password } = body

    if (!email || !password) {
      console.log("❌ Missing email or password")
      return NextResponse.json({ error: "Email and password required" }, { status: 400 })
    }

    const user = USERS.find((u) => u.email === email && u.password === password)

    if (!user) {
      console.log("❌ Invalid credentials for:", email)
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    console.log("✅ User authenticated:", user.name, user.role)

    // Create simple session data
    const sessionData = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department,
      loginTime: Date.now(),
    }

    // Encode session as base64
    const sessionToken = Buffer.from(JSON.stringify(sessionData)).toString("base64")

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
      },
    })

    // Set session cookie
    response.cookies.set("aegis-session", sessionToken, {
      httpOnly: true,
      secure: false, // Allow for development
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 hours
      path: "/",
    })

    console.log("✅ Session cookie set")
    return response
  } catch (error) {
    console.error("💥 Login error:", error)
    return NextResponse.json({ error: "Internal server error", details: String(error) }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Login endpoint is working",
    method: "POST",
    users: USERS.map((u) => ({ email: u.email, role: u.role })),
  })
}
