import { NextResponse } from "next/server"
export async function GET(request: Request) {
  try {
    // Ambil token dari header request yang dikirim oleh client (Next.js frontend)
    const authHeader = request.headers.get("Authorization")

    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const response = await fetch("https://backend.mejatika.com/api/registrations", {
      headers: {
        "Accept": "application/json",
        "Authorization": authHeader // Teruskan token ke Laravel
      }
    })

    const data = await response.json()
    
    if (!response.ok) {
      return NextResponse.json({ error: data.message }, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch registrations" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization")
    const body = await request.json()

    const response = await fetch("https://backend.mejatika.com/api/registrations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": authHeader || ""
      },
      body: JSON.stringify(body)
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create registration" }, { status: 500 })
  }
}
