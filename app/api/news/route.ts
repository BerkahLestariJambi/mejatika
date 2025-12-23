import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get("limit")

    const news = await db.getNews(limit ? Number.parseInt(limit) : undefined)

    // Get categories and authors for each news
    const newsWithDetails = await Promise.all(
      news.map(async (item) => {
        const category = await db.getNewsCategoryById(item.categoryId)
        const author = await db.getUserById(item.authorId)

        return {
          ...item,
          category,
          author: {
            id: author?.id,
            name: author?.name,
            avatar: author?.avatar,
          },
        }
      }),
    )

    return NextResponse.json(newsWithDetails)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const news = await db.createNews(body)
    return NextResponse.json(news, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create news" }, { status: 500 })
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
    const news = await db.updateNews(id, body)

    if (!news) {
      return NextResponse.json({ error: "News not found" }, { status: 404 })
    }

    return NextResponse.json(news)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update news" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    const success = await db.deleteNews(id)

    if (!success) {
      return NextResponse.json({ error: "News not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete news" }, { status: 500 })
  }
}
