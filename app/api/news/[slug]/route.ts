import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  try {
    const news = await db.getNewsBySlug(params.slug)

    if (!news) {
      return NextResponse.json({ error: "News not found" }, { status: 404 })
    }

    const category = await db.getNewsCategoryById(news.categoryId)
    const author = await db.getUserById(news.authorId)

    return NextResponse.json({
      ...news,
      category,
      author: {
        id: author?.id,
        name: author?.name,
        avatar: author?.avatar,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 })
  }
}
