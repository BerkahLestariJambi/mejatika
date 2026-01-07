"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Loader2, 
  ChevronLeft, 
  FileText, 
  PlayCircle, 
  PlusCircle,
  Settings 
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function ManageCoursePage() {
  const params = useParams()
  const courseId = params.id
  const [course, setCourse] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const API_BASE = "https://backend.mejatika.com/api"

  useEffect(() => {
    if (courseId) fetchCourseDetail()
  }, [courseId])

  const fetchCourseDetail = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_BASE}/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setCourse(data)
    } catch (error) {
      toast.error("Gagal memuat detail kursus")
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
      <Link href="/dashboard/mentor/my-courses" className="flex items-center text-zinc-400 hover:text-zinc-900 mb-6 font-bold text-xs uppercase tracking-widest transition-all">
        <ChevronLeft size={16} className="mr-1" /> Kembali ke Daftar Kursus
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter text-zinc-900 leading-none">
            Kelola <span className="text-amber-500">Materi</span>
          </h1>
          <p className="text-zinc-500 mt-2 font-bold uppercase text-[10px] tracking-[0.2em]">
            Kursus: {course?.title}
          </p>
        </div>
        <Button className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-2xl px-6 h-12 font-black uppercase text-xs">
          <Settings className="mr-2" size={18} /> Pengaturan Kursus
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Daftar Materi */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black uppercase italic text-zinc-800 tracking-tight flex items-center gap-2">
              <FileText className="text-amber-500" /> Kurikulum / Materi
            </h3>
            <Button variant="outline" className="rounded-xl border-zinc-200 font-bold text-xs uppercase h-10">
              <PlusCircle className="mr-2 text-amber-500" size={16} /> Tambah Materi
            </Button>
          </div>

          {course?.materials?.length > 0 ? (
            course.materials.map((materi: any, index: number) => (
              <Card key={materi.id} className="border-none shadow-sm rounded-2xl bg-white border border-zinc-100 overflow-hidden group hover:border-amber-200 transition-all">
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-400 group-hover:bg-amber-100 group-hover:text-amber-600 transition-colors">
                      <span className="text-xs font-black">{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-zinc-900 text-sm">{materi.title}</h4>
                      <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest flex items-center gap-1 mt-0.5">
                        <PlayCircle size={12} /> {materi.type || 'Video'} • {materi.duration || '0'} Menit
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" className="text-xs font-bold uppercase text-zinc-400 hover:text-amber-600">
                    Edit
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="p-12 text-center bg-zinc-50 rounded-[2.5rem] border-2 border-dashed border-zinc-100">
              <p className="text-zinc-400 text-sm font-medium italic">Belum ada materi di kursus ini.</p>
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card className="border-none shadow-xl rounded-[2.5rem] bg-zinc-900 text-white p-8">
            <h4 className="font-black uppercase italic tracking-tighter text-xl mb-4">Statistik Siswa</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                <span className="text-xs text-zinc-400 font-bold uppercase">Total Siswa</span>
                <span className="text-xl font-black italic">{course?.registrations_count || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-400 font-bold uppercase">Tugas Terkumpul</span>
                <span className="text-xl font-black italic text-amber-500">0</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
