import { NextResponse } from "next/server"

export async function PUT(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization")
    const body = await request.json()
    
    // 1. Pastikan ID dan Status ada
    const { id, status } = body 

    if (!id) {
      return NextResponse.json({ error: "ID Registrasi diperlukan" }, { status: 400 })
    }

    // 2. Kirim ke Backend Laravel
    // Pastikan URL Laravel Anda menerima parameter {id} seperti ini
    const response = await fetch(`https://backend.mejatika.com/api/registrations/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": authHeader || ""
      },
      body: JSON.stringify({ status }) // Kirim status: 'success' atau 'aktif'
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(errorData, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
    
  } catch (error) {
    console.error("Error Proxy PUT:", error)
    return NextResponse.json({ error: "Gagal menyambung ke server backend" }, { status: 500 })
  }
}
