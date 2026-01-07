"use client"
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, BookOpen, Send, CheckCircle } from "lucide-react"
import { toast } from "sonner"

export default function ApplyCoursePage() {
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState<number | null>(null)

  useEffect(() => {
    fetchAvailableCourses()
  }, [])

  const fetchAvailableCourses = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mentor/available-courses`, {
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mentor/apply`, {
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
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="animate-spin text-amber-500" size={40} />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-10">
        <h1 className="text-4xl font-black uppercase italic tracking-tighter text-zinc-900">
          Pilih <span className="text-amber-500">Kursus Mengajar</span>
        </h1>
        <p className="text-zinc-500 mt-2">Daftarkan diri Anda sebagai instruktur pada kursus yang tersedia di bawah ini.</p>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-zinc-200 rounded-[2.5rem] p-20 text-center">
          <BookOpen className="mx-auto text-zinc-300 mb-4" size={48} />
          <p className="text-zinc-500 font-bold">Belum ada kursus baru yang tersedia untuk dilamar saat ini.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.id} className="border-none shadow-lg rounded-[2.5rem] overflow-hidden flex flex-col bg-white">
              <div className="relative h-48 w-full">
                <img 
                  src={course.thumbnail_url || "/placeholder.svg"} 
                  alt={course.title} 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-white/90 text-zinc-900 backdrop-blur border-none font-black text-[10px] uppercase px-3">
                    {course.category?.name || "General"}
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-black uppercase italic text-zinc-900 mb-4 leading-tight">
                  {course.title}
                </h3>
                
                <div className="mt-auto space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-black uppercase text-zinc-400">
                    <span>Durasi</span>
                    <span className="text-zinc-800">{course.duration}</span>
                  </div>
                  
                  <Button 
                    onClick={() => handleApply(course.id)}
                    disabled={submitting === course.id}
                    className="w-full bg-zinc-900 hover:bg-amber-600 text-white rounded-xl h-12 font-black uppercase text-xs tracking-widest transition-all"
                  >
                    {submitting === course.id ? (
                      <Loader2 className="animate-spin mr-2" />
                    ) : (
                      <><Send size={14} className="mr-2" /> Lamar Sekarang</>
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
