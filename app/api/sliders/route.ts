import { NextResponse } from "next/server"

// Mock sliders data
const sliders = [
  {
    id: "1",
    title: "Selamat Datang di MEJATIKA",
    description: "Platform pembelajaran digital terbaik untuk meningkatkan keterampilan Anda",
    image: "/placeholder.jpg?height=500&width=1200&query=online+learning+hero",
    link: "/kursus",
    buttonText: "Mulai Belajar",
  },
  {
    id: "2",
    title: "Kursus Online Berkualitas",
    description: "Belajar dari instruktur berpengalaman dengan materi terstruktur",
    image: "/placeholder.jpg?height=500&width=1200&query=online+course+education",
    link: "/kursus",
    buttonText: "Lihat Kursus",
  },
  {
    id: "3",
    title: "Sertifikat Profesional",
    description: "Dapatkan sertifikat yang diakui setelah menyelesaikan kursus",
    image: "/placeholder.jpg?height=500&width=1200&query=certificate+diploma",
    link: "/kursus",
    buttonText: "Daftar Sekarang",
  },
]

export async function GET() {
  try {
    return NextResponse.json(sliders)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch sliders" }, { status: 500 })
  }
}
