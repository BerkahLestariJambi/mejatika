import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const gallery = await db.getGallery()
    return NextResponse.json(gallery)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch gallery" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const gallery = await db.createGallery(body)
    return NextResponse.json(gallery, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create gallery" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    const body = await request.json()
    const gallery = await db.updateGallery(id, body)

    if (!gallery) {
      return NextResponse.json({ error: "Gallery not found" }, { status: 404 })
    }

    return NextResponse.json(gallery)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update gallery" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    const success = await db.deleteGallery(id)

    if (!success) {
      return NextResponse.json({ error: "Gallery not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete gallery" }, { status: 500 })
  }
}
