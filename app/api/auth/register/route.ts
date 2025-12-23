import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    // Check if user already exists
    const existingUser = db.users.find((u) => u.email === email)
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 })
    }

    // Create new user
    const newUser = {
      id: `user-${Date.now()}`,
      email,
      password, // In production, hash the password
      name,
      role: "participant" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    db.users.push(newUser)

    return NextResponse.json({
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
