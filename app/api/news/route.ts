import { NextResponse } from "next/server"

const LARAVEL_API_URL = "https://backend.mejatika.com/api/news";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get("limit")

    const res = await fetch(LARAVEL_API_URL, {
      cache: 'no-store' // Memastikan data berita di halaman utama selalu segar
    })
    
    if (!res.ok) throw new Error("Gagal mengambil data dari Laravel")
    
    let news = await res.json()

    if (limit) {
      news = news.slice(0, Number.parseInt(limit))
    }

    const formattedNews = news.map((item: any) => ({
      ...item,
      // Mapping agar komponen UI tidak error mencari property ini
      categoryId: item.category_id,
      publishedAt: item.created_at, 
      author: {
        id: item.user_id || 1,
        name: item.author?.name || item.user?.name || "Admin MEJATIKA",
        avatar: "/placeholder-user.jpg",
      },
    }))

    return NextResponse.json(formattedNews)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch news from Laravel" }, { status: 500 })
  }
}

// DELETE harus bisa menangani ID dari database Laravel
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const token = request.headers.get("Authorization")

    // Pastikan endpoint Laravel Anda menerima DELETE di api/news/{id}
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
      // Mengambil pesan error dari Laravel jika gagal (misal: 401 Unauthorized)
      const errorData = await res.json();
      return NextResponse.json({ error: errorData.message || "Gagal menghapus" }, { status: res.status })
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete news" }, { status: 500 })
  }
}
