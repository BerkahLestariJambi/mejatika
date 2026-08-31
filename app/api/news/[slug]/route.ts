import { NextResponse } from "next/server"

const LARAVEL_API_URL = "https://backend.mejatika.com/api/news";

export async function GET(
  request: Request, 
  { params }: { params: { slug: string } }
) {
  try {
    // Ambil data detail berita berdasarkan slug dari API Laravel
    // Laravel route: Route::get('news/{news:slug}', ...)
    const res = await fetch(`${LARAVEL_API_URL}/${params.slug}`, {
      next: { revalidate: 60 } // Cache selama 1 menit
    })

    if (!res.ok) {
      return NextResponse.json({ error: "News not found in Laravel" }, { status: 404 })
    }

    const news = await res.json()

    // Mapping data dari format Laravel (snake_case) ke format Frontend (camelCase)
    // Laravel secara otomatis menyertakan 'category' jika Anda menggunakan ->load('category')
    return NextResponse.json({
      ...news,
      categoryId: news.category_id,
      publishedAt: news.created_at,
      excerpt: news.content.substring(0, 150) + "...", // Generate excerpt jika tidak ada
      author: {
        id: news.user_id || 1,
        name: news.author?.name || news.user?.name || "Admin MEJATIKA",
        avatar: "/placeholder-user.jpg",
      },
    })
  } catch (error) {
    console.error("Error fetching detail news:", error)
    return NextResponse.json({ error: "Failed to fetch news detail" }, { status: 500 })
  }
}
