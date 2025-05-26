"use client"

import { AuthProvider as CustomAuthProvider } from "@/lib/auth-context"
import type { ReactNode } from "react"

export function AuthProvider({ children }: { children: ReactNode }) {
  return <CustomAuthProvider>{children}</CustomAuthProvider>
}
