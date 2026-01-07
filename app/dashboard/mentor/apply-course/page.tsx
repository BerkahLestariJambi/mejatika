"use client"
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, BookOpen, Send } from "lucide-react"
import { toast } from "sonner"

export default function ApplyCoursePage() {
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState<number | null>(null)

  // URL Base API Mejatika
  const API_BASE = "https://backend.mejatika.com/api"

  useEffect(() => {
    fetchAvailableCourses()
  }, [])

  const fetchAvailableCourses = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_BASE}/mentor/available-courses`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setCourses(data.data || [])
    } catch (error) {
      toast.error("Gagal mengambil daftar kursus")
    } finally {
      setLoading(false)
    }
  }

  const handleApply = async (courseId: number) => {
    setSubmitting(courseId)
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_BASE}/mentor/apply`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ course_id: courseId }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success("Lamaran berhasil dikirim! Menunggu persetujuan admin.")
        // Refresh daftar agar kursus yang sudah dilamar hilang dari list
        fetchAvailableCourses()
      } else {
        toast.error(data.message || "Gagal mengirim lamaran")
      }
    } catch (error) {
      toast.error("Terjadi kesalahan jaringan")
    } finally {
      setSubmitting(null)
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center">
        <Loader2 className="animate-spin text-amber-500 mb-4" size={40} />
        <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Memuat Kursus...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-10">
        <h1 className="text-4xl font-black uppercase italic tracking-tighter text-zinc-900 leading-none">
          Pilih <span className="text-amber-500">Kursus Mengajar</span>
        </h1>
        <p className="text-zinc-500 mt-2 font-medium">Daftarkan diri Anda sebagai instruktur pada kursus yang tersedia di bawah ini.</p>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white border-4 border-dashed border-zinc-100 rounded-[3rem] p-20 text-center shadow-sm">
          <div className="bg-zinc-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="text-zinc-300" size={40} />
          </div>
          <p className="text-zinc-500 font-black uppercase tracking-tighter text-xl">Belum Ada Kursus Baru</p>
          <p className="text-zinc-400 text-sm mt-1">Semua kursus saat ini sudah memiliki pengajar atau sedang Anda lamar.</p>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.id} className="border-none shadow-xl shadow-zinc-200/50 rounded-[2.5rem] overflow-hidden flex flex-col bg-white transition-all hover:shadow-2xl hover:-translate-y-1">
              <div className="relative h-56 w-full">
                <img 
                  src={course.thumbnail_url || "https://backend.mejatika.com/storage/placeholder.png"} 
                  alt={course.title} 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute top-5 left-5">
                  <Badge className="bg-zinc-900/90 hover:bg-zinc-900 text-white backdrop-blur border-none font-black text-[10px] uppercase px-4 py-1.5 rounded-full tracking-widest">
                    {course.category?.name || "Umum"}
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-8 flex flex-col flex-grow">
                <h3 className="text-2xl font-black uppercase italic text-zinc-900 mb-6 leading-[1.1] tracking-tighter">
                  {course.title}
                </h3>
                
                <div className="mt-auto pt-6 border-t border-zinc-50 space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Estimasi Durasi</span>
                    <Badge variant="outline" className="rounded-lg border-zinc-100 font-bold text-zinc-700">
                       {course.duration}
                    </Badge>
                  </div>
                  
                  <Button 
                    onClick={() => handleApply(course.id)}
                    disabled={submitting === course.id}
                    className="w-full bg-zinc-900 hover:bg-amber-500 text-white rounded-2xl h-14 font-black uppercase text-xs tracking-[0.2em] transition-all shadow-lg shadow-zinc-200 active:scale-95"
                  >
                    {submitting === course.id ? (
                      <Loader2 className="animate-spin mr-2" />
                    ) : (
                      <><Send size={16} className="mr-2" /> Lamar Mengajar</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
