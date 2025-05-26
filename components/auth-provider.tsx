"use client"

import { SimpleAuthProvider } from "@/lib/simple-auth-context"
import type { ReactNode } from "react"

export function AuthProvider({ children }: { children: ReactNode }) {
  return <SimpleAuthProvider>{children}</SimpleAuthProvider>
}
