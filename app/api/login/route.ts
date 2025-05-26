import { type NextRequest, NextResponse } from "next/server"

const users = [
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
    const { email, password } = await request.json()

    console.log("Login attempt:", { email, password })

    const user = users.find((u) => u.email === email && u.password === password)

    if (!user) {
      console.log("User not found or invalid password")
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    console.log("User found:", user.name, user.role)

    // Create a simple session token (just base64 encoded user data)
    const sessionData = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department,
      timestamp: Date.now(),
    }

    const sessionToken = btoa(JSON.stringify(sessionData))

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

    // Set simple session cookie
    response.cookies.set("aegis-session", sessionToken, {
      httpOnly: true,
      secure: false, // Set to false for development
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    })

    console.log("Login successful, session set")
    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
