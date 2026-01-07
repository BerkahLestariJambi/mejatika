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
  CheckCircle2 
} from "lucide-react"

export default function MentorDashboard() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({ total: 0, active: 0, pending: 0 })
  const API_BASE = "https://backend.mejatika.com/api"

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token")
        const res = await fetch(`${API_BASE}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        setUser(data)
        
        // Hitung statistik dari teaching_courses
        const teaching = data.teaching_courses || []
        setStats({
          total: teaching.length,
          active: teaching.filter((c: any) => c.pivot.status === 'approved').length,
          pending: teaching.filter((c: any) => c.pivot.status === 'pending').length,
        })
      } catch (error) {
        console.error("Error fetching dashboard data")
      }
    }
    fetchData()
  }, [])

  return (
    <div className="container mx-auto px-4 py-10">
      {/* HEADER: Welcome Message */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter text-zinc-900 leading-none">
            Halo, <span className="text-amber-500">{user?.name || "Mentor"}!</span>
          </h1>
          <p className="text-zinc-500 mt-2 font-medium uppercase text-xs tracking-widest">
            Panel Kontributor Mejatika • {user?.role}
          </p>
        </div>
        <Link href="/dashboard/mentor/profile">
          <Button className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-2xl px-6 h-14 font-black uppercase text-xs tracking-widest shadow-xl">
            <UserCircle className="mr-2" size={20} /> Edit Profil
          </Button>
        </Link>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[
          { label: "Total Kursus", value: stats.total, icon: BookOpen, color: "text-blue-500" },
          { label: "Aktif Mengajar", value: stats.active, icon: CheckCircle2, color: "text-green-500" },
          { label: "Menunggu Approval", value: stats.pending, icon: Clock, color: "text-amber-500" },
        ].map((item, i) => (
          <Card key={i} className="border-none shadow-xl shadow-zinc-100 rounded-[2rem] bg-white">
            <CardContent className="p-8 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-1">{item.label}</p>
                <p className="text-4xl font-black italic text-zinc-900">{item.value}</p>
              </div>
              <item.icon size={40} className={item.color} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* QUICK ACTIONS */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Kursus yang sedang diajar */}
        <div className="space-y-6">
          <h3 className="text-xl font-black uppercase italic text-zinc-900 tracking-tighter flex items-center">
            <GraduationCap className="mr-2 text-amber-500" /> Kursus Saya
          </h3>
          <div className="space-y-4">
            {user?.teaching_courses?.length > 0 ? (
              user.teaching_courses.slice(0, 3).map((course: any) => (
                <div key={course.id} className="flex items-center justify-between p-5 bg-white rounded-3xl shadow-sm border border-zinc-50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-zinc-100 rounded-2xl overflow-hidden">
                      <img src={course.thumbnail_url} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-zinc-900">{course.title}</h4>
                      <Badge className={`text-[9px] uppercase font-black ${course.pivot.status === 'approved' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                        {course.pivot.status}
                      </Badge>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-zinc-300" />
                </div>
              ))
            ) : (
              <p className="text-zinc-400 text-sm italic">Belum ada kursus yang terdaftar.</p>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-amber-500 rounded-[2.5rem] p-10 text-white flex flex-col justify-between shadow-2xl shadow-amber-200">
          <div>
            <h3 className="text-3xl font-black uppercase italic leading-none mb-4">Mulai Berbagi Ilmu!</h3>
            <p className="text-amber-100 text-sm font-medium leading-relaxed">
              Daftarkan diri Anda pada kursus-kursus baru yang tersedia dan jadilah bagian dari perjalanan belajar siswa Mejatika.
            </p>
          </div>
          <Link href="/dashboard/mentor/apply-course" className="mt-8">
            <Button className="w-full bg-white hover:bg-zinc-900 text-zinc-900 hover:text-white rounded-2xl h-14 font-black uppercase text-xs tracking-widest transition-all">
              Cari Kursus Baru
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <span className={`px-2 py-0.5 rounded-md font-bold ${className}`}>
      {children}
    </span>
  )
}
