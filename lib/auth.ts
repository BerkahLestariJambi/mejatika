// Simple authentication helper
// In production, use proper session management with cookies

import { db } from "./db"
import type { User } from "./types"

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const user = await db.getUserByEmail(email)

  // In production, compare hashed passwords
  if (user && user.password === password) {
    return user
  }

  return null
}

export function canAccessAdmin(user: User | null): boolean {
  return user?.role === "admin" || user?.role === "contributor"
}

export function isAdmin(user: User | null): boolean {
  return user?.role === "admin"
}
