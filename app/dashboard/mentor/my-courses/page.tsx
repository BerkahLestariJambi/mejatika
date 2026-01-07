"use client"
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, BookOpen, Clock, ArrowRight, LayoutDashboard, ChevronLeft } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

export default function MyCoursesPage() {
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const API_BASE = "https://backend.mejatika.com/api"

  useEffect(() => {
    fetchMyCourses()
  }, [])

  const fetchMyCourses = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_BASE}/mentor/my-teaching`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        setCourses(data.data || [])
      }
    } catch (error) {
      toast.error("Gagal mengambil data kursus")
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="animate-spin text-amber-500" size={40} />
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Tombol Kembali */}
      <Link href="/dashboard/mentor" className="flex items-center text-zinc-400 hover:text-zinc-900 mb-6 font-bold text-xs uppercase tracking-widest transition-all">
        <ChevronLeft size={16} className="mr-1" /> Kembali ke Dashboard
      </Link>

      <div className="mb-10">
        <h1 className="text-4xl font-black uppercase italic tracking-tighter text-zinc-900">
          Kursus <span className="text-amber-500">Mengajar Saya</span>
        </h1>
        <p className="text-zinc-500 mt-2 font-medium">
          Daftar kursus aktif yang Anda ampu sebagai instruktur.
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-zinc-200 rounded-[3rem] p-20 text-center">
          <BookOpen className="text-zinc-200 mx-auto mb-4" size={60} />
          <h3 className="text-zinc-900 font-bold text-xl mb-2">Belum Ada Kursus Aktif</h3>
          <p className="text-zinc-500 mb-6 text-sm">Anda belum memiliki kursus yang disetujui untuk diajar.</p>
          <Link href="/dashboard/mentor/apply-course">
            <Button className="bg-amber-500 text-zinc-900 font-black italic rounded-2xl px-8 uppercase">Cari Kursus</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.id} className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white group hover:shadow-2xl transition-all duration-300">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={course.thumbnail_url} 
                  alt={course.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-zinc-900/80 backdrop-blur-md text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-full italic">
                    {course.category?.name || 'General'}
                  </span>
                </div>
              </div>
              
              <CardContent className="p-6">
                <h3 className="text-lg font-black text-zinc-900 mb-4 leading-tight italic uppercase tracking-tighter">
                  {course.title}
                </h3>
                
                <div className="flex items-center gap-4 mb-6 text-zinc-500">
                  <div className="flex items-center gap-1 text-[10px] font-bold uppercase">
                    <Clock size={14} className="text-amber-500" /> {course.duration || '0'} Jam Materi
                  </div>
                </div>

                <Link href={`/dashboard/mentor/courses/${course.id}`}>
                  <Button className="w-full bg-zinc-900 hover:bg-amber-500 hover:text-zinc-900 text-white rounded-2xl font-black italic uppercase tracking-tighter text-xs h-12 transition-all">
                    Kelola Kursus <ArrowRight size={16} className="ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
