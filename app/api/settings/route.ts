import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get("key")

    if (key) {
      const value = await db.getSettingValue(key)
      return NextResponse.json({ key, value })
    }

    const settings = await db.getSettings()
    return NextResponse.json(settings)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get("key")
    if (!key) {
      return NextResponse.json({ error: "Key is required" }, { status: 400 })
    }

    const body = await request.json()
    const setting = await db.updateSetting(key, body.value)

    if (!setting) {
      return NextResponse.json({ error: "Setting not found" }, { status: 404 })
    }

    return NextResponse.json(setting)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update setting" }, { status: 500 })
  }
}
