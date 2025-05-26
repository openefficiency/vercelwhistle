import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import type { NextRequest } from "next/server"

// Simple user data - no external dependencies
const USERS = [
  { id: "1", email: "jane.doe@company.com", password: "ethics123", name: "Jane Doe", role: "ethics_officer" },
  { id: "2", email: "john.smith@company.com", password: "investigate123", name: "John Smith", role: "investigator" },
  { id: "3", email: "admin@company.com", password: "admin123", name: "Admin", role: "admin" },
]

const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null
          }

          const user = USERS.find((u) => u.email === credentials.email && u.password === credentials.password)

          if (user) {
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
            }
          }

          return null
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }: any) {
      if (session?.user) {
        session.user.id = token.sub
        session.user.role = token.role
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt" as const,
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-development",
}

const handler = NextAuth(authOptions)

export async function GET(request: NextRequest) {
  try {
    return await handler(request)
  } catch (error) {
    console.error("NextAuth GET error:", error)
    return new Response(JSON.stringify({ error: "Authentication error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    return await handler(request)
  } catch (error) {
    console.error("NextAuth POST error:", error)
    return new Response(JSON.stringify({ error: "Authentication error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
