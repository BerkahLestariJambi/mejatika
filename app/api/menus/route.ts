import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const menus = await db.getMenus()

    // Organize menus with submenus
    const mainMenus = menus.filter((m) => !m.parentId)
    const menusWithSubs = await Promise.all(
      mainMenus.map(async (menu) => ({
        ...menu,
        subMenus: await db.getSubMenus(menu.id),
      })),
    )

    return NextResponse.json(menusWithSubs)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch menus" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const menu = await db.createMenu(body)
    return NextResponse.json(menu, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create menu" }, { status: 500 })
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
    const menu = await db.updateMenu(id, body)

    if (!menu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 })
    }

    return NextResponse.json(menu)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update menu" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    const success = await db.deleteMenu(id)

    if (!success) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete menu" }, { status: 500 })
  }
}
