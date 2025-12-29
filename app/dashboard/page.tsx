"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Loader2, 
  BookOpen, 
  GraduationCap, 
  Calendar, 
  ArrowRight, 
  LogOut
} from "lucide-react"

interface Course {
  id: number
  title: string
  description: string
  price: number
  category?: string
}

export default function ParticipantDashboard() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false) // State pencegah stuck
  const [registeringId, setRegisteringId] = useState<number | null>(null)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    setMounted(true) // Komponen berhasil ditempel ke browser
    
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (!token || !userData) {
      router.push("/login")
      return
    }

    try {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)

      if (parsedUser.role !== "peserta") {
        router.push("/" + parsedUser.role) 
      }
      
      fetchCourses(token)
    } catch (e) {
      localStorage.clear()
      router.push("/login")
    }
  }, [router])

  const fetchCourses = async (token: string) => {
    try {
      const res = await fetch("https://backend.mejatika.com/api/courses", {
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        }
      })
      const data = await res.json()
      // Penanganan fleksibel untuk format data Laravel
      const finalData = Array.isArray(data) ? data : (data.data || [])
      setCourses(finalData)
    } catch (err) {
      console.error("Gagal memuat data kursus")
    } finally {
      setLoading(false)
    }
  }

  const handleEnroll = async (courseId: number) => {
    if (!confirm("Apakah Anda yakin ingin mendaftar kursus ini?")) return
    setRegisteringId(courseId)
    try {
      const res = await fetch("https://backend.mejatika.com/api/registrations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ course_id: courseId })
      })
      const result = await res.json()
      if (res.ok) {
        alert("Pendaftaran Berhasil! Admin akan segera memverifikasi pendaftaran Anda.")
      } else {
        alert(result.message || "Gagal mendaftar.")
      }
    } catch (err) {
      alert("Terjadi kesalahan koneksi.")
    } finally {
      setRegisteringId(null)
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    window.location.href = "/login"
  }

  // 1. CEK MOUNTED (Penting agar tidak stuck)
  if (!mounted) return null

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-zinc-50">
        <Loader2 className="animate-spin text-amber-500 h-12 w-12 mb-4" />
        <p className="font-black uppercase italic text-zinc-400 tracking-widest text-xs">Menyiapkan Dashboard...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 pb-20">
      <nav className="bg-white border-b border-zinc-100 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 bg-zinc-900 rounded-xl flex items-center justify-center">
              <GraduationCap className="text-amber-500 h-6 w-6" />
            </div>
            <span className="font-black uppercase italic tracking-tighter text-xl">
              MEJA<span className="text-amber-500">TIKA</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <p className="hidden md:block text-sm font-bold text-zinc-900 uppercase italic">Hi, {user?.name}</p>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-red-500">
              <LogOut size={20} />
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-10">
        <section className="mb-12 bg-zinc-900 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <Badge className="bg-amber-500 text-zinc-900 font-black mb-4 uppercase italic">Student Dashboard</Badge>
            <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter mb-2">
              Hello, <span className="text-amber-500">{user?.name?.split(' ')[0]}!</span>
            </h2>
          </div>
          <BookOpen className="absolute right-[-20px] bottom-[-20px] h-64 w-64 text-white/5 rotate-12" />
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <Card key={course.id} className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white group hover:shadow-2xl transition-all duration-300">
              <div className="h-44 bg-zinc-100 flex items-center justify-center relative">
                 <GraduationCap className="h-16 w-16 text-zinc-200 group-hover:text-amber-500/20 transition-all" />
              </div>
              
              <CardHeader className="pt-6">
                <CardTitle className="font-black uppercase italic text-xl tracking-tighter leading-tight group-hover:text-amber-600 transition-colors">
                  {course.title}
                </CardTitle>
              </CardHeader>

              <CardContent>
                {/* 2. SOLUSI TAG HTML: dangerouslySetInnerHTML */}
                <div 
                  className="text-zinc-500 text-sm mb-6 line-clamp-3 prose prose-sm"
                  dangerouslySetInnerHTML={{ __html: course.description || "Tidak ada deskripsi." }}
                />

                <div className="flex items-center justify-between mb-6 bg-zinc-50 p-4 rounded-2xl">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">Investasi</span>
                    <span className="text-lg font-black text-zinc-900 italic">
                      {course.price === 0 ? "GRATIS" : `Rp ${course.price.toLocaleString('id-ID')}`}
                    </span>
                  </div>
                  <Calendar className="text-amber-600 h-5 w-5" />
                </div>

                <Button 
                  onClick={() => handleEnroll(course.id)}
                  disabled={registeringId === course.id}
                  className="w-full bg-zinc-900 hover:bg-amber-500 text-white h-14 rounded-2xl font-black uppercase tracking-[0.1em] shadow-lg active:scale-95"
                >
                  {registeringId === course.id ? <Loader2 className="animate-spin h-5 w-5" /> : "Daftar Sekarang"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
