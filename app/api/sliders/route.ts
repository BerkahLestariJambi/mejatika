import { NextResponse } from "next/server"

export async function GET() {
  try {
    const res = await fetch("https://backend.mejatika.com/api/sliders", {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`, // atau ambil dari cookie/localStorage jika pakai client auth
      },
      cache: "no-store",
    })

    if (!res.ok) {
      throw new Error("Failed to fetch sliders")
    }

    const sliders = await res.json()
    return NextResponse.json(sliders)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch sliders" }, { status: 500 })
  }
}
