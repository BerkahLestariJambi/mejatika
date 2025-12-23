import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const downloads = await db.getDownloads()
    return NextResponse.json(downloads)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch downloads" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const download = await db.createDownload(body)
    return NextResponse.json(download, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create download" }, { status: 500 })
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
    const download = await db.updateDownload(id, body)

    if (!download) {
      return NextResponse.json({ error: "Download not found" }, { status: 404 })
    }

    return NextResponse.json(download)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update download" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    const success = await db.deleteDownload(id)

    if (!success) {
      return NextResponse.json({ error: "Download not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete download" }, { status: 500 })
  }
}
