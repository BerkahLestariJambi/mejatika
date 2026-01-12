import { NextResponse } from "next/server";

// 1. Definisikan Interface untuk Type Safety
interface Announcement {
  id: string;
  content: string;
  link: string;
  type: "info" | "success" | "warning" | "error";
  isActive: boolean;
}

// 2. Mock Data yang lebih lengkap
const announcements: Announcement[] = [
  {
    id: "1",
    content: "Pendaftaran kursus batch baru telah dibuka! Daftar sekarang juga.",
    link: "/kursus",
    type: "info",
    isActive: true,
  },
  {
    id: "2",
    content: "Webinar gratis: Pengenalan Programming untuk Pemula - 25 Januari 2026",
    link: "/berita",
    type: "success",
    isActive: true,
  },
  {
    id: "3",
    content: "Dapatkan diskon 20% untuk pendaftaran sebelum akhir bulan!",
    link: "/kursus",
    type: "warning",
    isActive: true,
  },
];

// 3. Tambahkan revalidate jika data ini sering berubah (ISR)
export const revalidate = 60; // Update data setiap 60 detik

export async function GET() {
  try {
    // Simulasi pengambilan data (misal hanya yang aktif)
    const activeAnnouncements = announcements.filter(a => a.isActive);

    if (!activeAnnouncements || activeAnnouncements.length === 0) {
      return NextResponse.json(
        { message: "No active announcements found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: activeAnnouncements,
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Announcement API Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
