import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

// FIX 1: Paksa route ini menjadi dinamis agar Vercel tidak mengeksekusinya secara statis saat build
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const users = await db.getUsers()
    // Remove password from response
    // FIX 2: Menambahkan pengecekan Array agar tidak crash jika users bernilai undefined/null
    const safeUsers = (users || []).map(({ password, ...user }: any) => user)
    return NextResponse.json(safeUsers)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
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
    const index = db.users.findIndex((u: any) => u.id === data.id)

    if (index === -1) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    db.users[index] = {
      ...db.users[index],
      ...data,
      updatedAt: new Date(),
    }

    const { password, ...safeUser } = db.users[index] as any
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

    const index = db.users.findIndex((u: any) => u.id === id)

    if (index === -1) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    db.users.splice(index, 1)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
