"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  UserCircle, 
  BookOpen, 
  GraduationCap, 
  ChevronRight, 
  Clock, 
  CheckCircle2,
  Loader2 
} from "lucide-react"

export default function MentorDashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, active: 0, pending: 0 })
  const API_BASE = "https://backend.mejatika.com/api"

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token")
        // Memanggil route /me yang sudah kita load relasinya di Laravel sebelumnya
        const res = await fetch(`${API_BASE}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        setUser(data)
        
        // Mengambil data teaching_courses dari response /me
        const teaching = data.teaching_courses || []
        setStats({
          total: teaching.length,
          active: teaching.filter((c: any) => c.pivot.status === 'approved').length,
          pending: teaching.filter((c: any) => c.pivot.status === 'pending').length,
        })
      } catch (error) {
        console.error("Error fetching dashboard data")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="animate-spin text-amber-500" size={40} />
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-10">
      {/* HEADER: Welcome Message */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter text-zinc-900 leading-none">
            Halo, <span className="text-amber-500">{user?.name || "Mentor"}!</span>
          </h1>
          <p className="text-zinc-500 mt-2 font-medium uppercase text-[10px] tracking-widest">
            Panel Kontributor Mejatika • <span className="text-zinc-900 font-bold">{user?.role}</span>
          </p>
        </div>
        <Link href="/dashboard/mentor/profile">
          <Button className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-2xl px-6 h-14 font-black uppercase text-xs tracking-widest shadow-xl transition-transform hover:-translate-y-1">
            <UserCircle className="mr-2" size={20} /> Edit Profil
          </Button>
        </Link>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[
          { label: "Total Kursus", value: stats.total, icon: BookOpen, color: "text-blue-500", bg: "bg-blue-50" },
          { label: "Aktif Mengajar", value: stats.active, icon: CheckCircle2, color: "text-green-500", bg: "bg-green-50" },
          { label: "Menunggu Approval", value: stats.pending, icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
        ].map((item, i) => (
          <Card key={i} className="border-none shadow-xl shadow-zinc-100 rounded-[2rem] bg-white overflow-hidden">
            <CardContent className="p-8 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-1">{item.label}</p>
                <p className="text-4xl font-black italic text-zinc-900">{item.value}</p>
              </div>
              <div className={`${item.bg} p-4 rounded-2xl`}>
                <item.icon size={32} className={item.color} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* QUICK ACTIONS & LIST */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Kursus yang sedang diajar (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black uppercase italic text-zinc-900 tracking-tighter flex items-center">
              <GraduationCap className="mr-2 text-amber-500" size={24} /> Kursus Saya
            </h3>
            <Link href="/dashboard/mentor/my-courses" className="text-[10px] font-bold uppercase text-zinc-400 hover:text-amber-600">
              Lihat Semua
            </Link>
          </div>
          
          <div className="space-y-4">
            {user?.teaching_courses?.length > 0 ? (
              user.teaching_courses.slice(0, 5).map((course: any) => (
                <div key={course.id} className="flex items-center justify-between p-4 bg-white rounded-3xl shadow-sm border border-zinc-100 group hover:border-amber-200 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-zinc-100 rounded-2xl overflow-hidden border border-zinc-50">
                      <img src={course.thumbnail_url} className="w-full h-full object-cover" alt={course.title} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-zinc-900 line-clamp-1">{course.title}</h4>
                      <Badge className={`text-[8px] mt-1 uppercase font-black tracking-tighter ${
                        course.pivot.status === 'approved' 
                        ? 'bg-green-100 text-green-600' 
                        : course.pivot.status === 'rejected' 
                        ? 'bg-red-100 text-red-600' 
                        : 'bg-amber-100 text-amber-600'
                      }`}>
                        {course.pivot.status}
                      </Badge>
                    </div>
                  </div>
                  <Link href={`/dashboard/mentor/courses/${course.id}`}>
                    <Button variant="ghost" size="icon" className="rounded-xl group-hover:bg-amber-50 group-hover:text-amber-600">
                      <ChevronRight size={20} />
                    </Button>
                  </Link>
                </div>
              ))
            ) : (
              <div className="p-10 text-center bg-zinc-50 rounded-[2rem] border-2 border-dashed border-zinc-100">
                <p className="text-zinc-400 text-sm font-medium italic">Belum ada kursus yang terdaftar.</p>
              </div>
            )}
          </div>
        </div>

        {/* Info Box (1/3 width) */}
        <div className="bg-amber-500 rounded-[3rem] p-10 text-white flex flex-col justify-between shadow-2xl shadow-amber-200 relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-3xl font-black uppercase italic leading-none mb-4">Bagikan<br/>Ilmu Anda!</h3>
            <p className="text-amber-100 text-xs font-medium leading-relaxed opacity-90">
              Jadilah instruktur dan bantu siswa Mejatika mencapai impian mereka. Klik tombol di bawah untuk melihat daftar kursus yang butuh mentor.
            </p>
          </div>
          <Link href="/dashboard/mentor/apply-course" className="mt-10 relative z-10">
            <Button className="w-full bg-white hover:bg-zinc-900 text-zinc-900 hover:text-white rounded-2xl h-14 font-black uppercase text-xs tracking-widest transition-all shadow-lg">
              Cari Kursus Baru
            </Button>
          </Link>
          {/* Decorative element */}
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-amber-400 rounded-full opacity-50 shadow-inner"></div>
        </div>
      </div>
    </div>
  )
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <span className={`px-2.5 py-1 rounded-full font-bold inline-block ${className}`}>
      {children}
    </span>
  )
}
