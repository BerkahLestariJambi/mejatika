import { NextResponse } from "next/server"

const LARAVEL_API_URL = "https://backend.mejatika.com/api/news";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get("limit")

    // Ambil data langsung dari Laravel
    const res = await fetch(LARAVEL_API_URL, {
      next: { revalidate: 10 } // Cache singkat 10 detik
    })
    
    if (!res.ok) throw new Error("Gagal mengambil data dari Laravel")
    
    let news = await res.json()

    // Jika ada limit, kita potong array-nya
    if (limit) {
      news = news.slice(0, Number.parseInt(limit))
    }

    // Sesuaikan format data Laravel ke format yang diharapkan Frontend
    const formattedNews = news.map((item: any) => ({
      ...item,
      // Map properti snake_case Laravel ke camelCase Next.js jika diperlukan
      categoryId: item.category_id,
      publishedAt: item.created_at,
      author: {
        id: 1, // Default jika Laravel belum mengirim data User
        name: "Admin MEJATIKA",
        avatar: "/placeholder-user.jpg",
      },
    }))

    return NextResponse.json(formattedNews)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch news from Laravel" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const token = request.headers.get("Authorization") // Teruskan token admin

    const res = await fetch(LARAVEL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token || "",
        "Accept": "application/json"
      },
      body: JSON.stringify(body)
    })

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create news" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const token = request.headers.get("Authorization")

    const res = await fetch(`${LARAVEL_API_URL}/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": token || "",
        "Accept": "application/json"
      }
    })

    if (res.ok) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: "Gagal menghapus" }, { status: res.status })
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete news" }, { status: 500 })
  }
}
