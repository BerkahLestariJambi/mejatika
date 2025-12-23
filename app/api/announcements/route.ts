import { NextResponse } from "next/server"

// Mock announcements data
const announcements = [
  {
    id: "1",
    content: "Pendaftaran kursus batch baru telah dibuka! Daftar sekarang juga.",
    link: "/kursus",
    type: "info",
  },
  {
    id: "2",
    content: "Webinar gratis: Pengenalan Programming untuk Pemula - 25 Januari 2025",
    link: "/berita",
    type: "success",
  },
  {
    id: "3",
    content: "Dapatkan diskon 20% untuk pendaftaran sebelum akhir bulan!",
    link: "/kursus",
    type: "warning",
  },
]

export async function GET() {
  try {
    return NextResponse.json(announcements)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch announcements" }, { status: 500 })
  }
}
