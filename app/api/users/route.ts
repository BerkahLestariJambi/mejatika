import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  const users = await db.getUsers()
  // Remove password from response
  const safeUsers = users.map(({ password, ...user }) => user)
  return NextResponse.json(safeUsers)
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const newUser = {
      id: `user-${Date.now()}`,
      email: data.email,
      password: data.password, // In production, hash this
      name: data.name,
      role: data.role,
      avatar: data.avatar,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    db.users.push(newUser)

    const { password, ...safeUser } = newUser
    return NextResponse.json(safeUser)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const index = db.users.findIndex((u) => u.id === data.id)

    if (index === -1) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    db.users[index] = {
      ...db.users[index],
      ...data,
      updatedAt: new Date(),
    }

    const { password, ...safeUser } = db.users[index]
    return NextResponse.json(safeUser)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const index = db.users.findIndex((u) => u.id === id)

    if (index === -1) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    db.users.splice(index, 1)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
