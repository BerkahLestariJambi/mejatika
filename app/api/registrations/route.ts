import { NextResponse } from "next/server"

export async function PUT(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization")
    const body = await request.json()
    const { id, status } = body // ID Registrasi dan status baru (aktif/ditolak)

    const response = await fetch(`https://backend.mejatika.com/api/registrations/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": authHeader || ""
      },
      body: JSON.stringify({ status })
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Gagal update status" }, { status: 500 })
  }
}
