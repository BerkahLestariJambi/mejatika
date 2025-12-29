import { Suspense } from "react"
import { Loader2, Plus } from "lucide-react"
import { CourseClient } from "@/components/courses/course-client"
import { Button } from "@/components/ui/button"

// 1. MEMAKSA HALAMAN MENJADI DINAMIS (Solusi Error Build Vercel)
// Ini memberitahu Next.js agar tidak melakukan prerender statis karena kita menggunakan fetch no-store.
export const dynamic = "force-dynamic"

/**
 * Fungsi untuk mengambil data kursus dari Backend Laravel
 */
async function getCourses() {
  try {
    const res = await fetch("https://backend.mejatika.com/api/courses", {
      cache: "no-store", // Memastikan data selalu terbaru dari database
      headers: { 
        "Accept": "application/json",
        // Jika endpoint ini memerlukan auth admin, tambahkan Authorization header di sini
      }
    })

    if (!res.ok) {
      throw new Error(`Gagal mengambil data: ${res.status}`)
    }

    const json = await res.json()
    
    // Penanganan fleksibel untuk format response Laravel (array langsung atau object .data)
    if (Array.isArray(json)) return json
    if (json && typeof json === 'object' && Array.isArray(json.data)) return json.data
    
    return []
  } catch (error) {
    console.error("Fetch error pada Admin Courses:", error)
    return []
  }
}

export default async function CoursesManagementPage() {
  // Mengambil data di sisi server (Server Component)
  const initialCourses = await getCourses()

  return (
    <div className="space-y-8 p-6 bg-zinc-50/50 min-h-screen">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black uppercase italic tracking-tighter text-zinc-900">
            Course <span className="text-amber-500">Management</span>
          </h1>
          <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest opacity-70">
            Panel Kontrol Inventaris Kursus Mejatika
          </p>
        </div>
        
        {/* Tombol aksi cepat bisa diletakkan di sini jika perlu */}
      </div>

      <hr className="border-zinc-200" />

      {/* MAIN CONTENT WITH SUSPENSE */}
      {/* Suspense digunakan untuk menangani transisi jika initialData diproses ulang di client */}
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[2.5rem] border-2 border-dashed border-zinc-200">
          <Loader2 className="h-12 w-12 animate-spin text-amber-500 mb-4" />
          <p className="font-black uppercase italic text-zinc-400 text-xs tracking-[0.3em]">
            Sinkronisasi Database...
          </p>
        </div>
      }>
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-zinc-200/50 border border-zinc-100 overflow-hidden">
          <CourseClient initialData={initialCourses} />
        </div>
      </Suspense>
      
      {/* FOOTER INFO */}
      <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        Sistem Terhubung ke backend.mejatika.com
      </div>
    </div>
  )
}
