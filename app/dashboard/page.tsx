"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Loader2, 
  BookOpen, 
  GraduationCap, 
  Calendar, 
  ArrowRight, 
  LogOut,
  User as UserIcon
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
  const [registeringId, setRegisteringId] = useState<number | null>(null)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    // 1. Validasi Login & Role
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (!token || !userData) {
      router.push("/login")
      return
    }

    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)

    // Pastikan hanya peserta yang bisa akses (opsional tergantung kebutuhan)
    if (parsedUser.role !== "peserta") {
      router.push("/" + parsedUser.role) 
    }

    fetchCourses()
  }, [router])

  const fetchCourses = async () => {
    try {
      const res = await fetch("https://backend.mejatika.com/api/courses", {
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      })
      const data = await res.json()
      if (res.ok) {
        setCourses(data)
      }
    } catch (err) {
      console.error("Gagal memuat data kursus")
    } finally {
      setLoading(false)
    }
  }

  const handleEnroll = async (courseId: number) => {
    const confirmRegister = confirm("Apakah Anda yakin ingin mendaftar kursus ini?")
    if (!confirmRegister) return

    setRegisteringId(courseId)
    try {
      // Menggunakan endpoint /api/registrations sesuai api.php Anda
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
        alert("Pendaftaran Berhasil! Silakan cek menu pendaftaran atau hubungi admin untuk aktivasi.")
      } else {
        alert(result.message || "Gagal mendaftar. Anda mungkin sudah terdaftar.")
      }
    } catch (err) {
      alert("Terjadi kesalahan koneksi ke server.")
    } finally {
      setRegisteringId(null)
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    router.push("/login")
  }

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-zinc-50">
        <Loader2 className="animate-spin text-amber-500 h-10 w-10 mb-4" />
        <p className="font-black uppercase italic text-zinc-400 tracking-tighter">Memuat Dashboard...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 pb-20">
      {/* NAVBAR DASHBOARD */}
      <nav className="bg-white border-b border-zinc-100 px-6 py-4 sticky top-0 z-10">
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
            <div className="hidden md:block text-right">
              <p className="text-[10px] font-black uppercase text-zinc-400 leading-none">Logged in as</p>
              <p className="text-sm font-bold text-zinc-900">{user?.name}</p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleLogout}
              className="rounded-full hover:bg-red-50 hover:text-red-500 transition-colors"
            >
              <LogOut size={20} />
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-10">
        {/* WELCOME BANNER */}
        <section className="mb-12 bg-zinc-900 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <Badge className="bg-amber-500 text-zinc-900 font-black mb-4 uppercase italic">
              Student Dashboard
            </Badge>
            <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter mb-2">
              Hello, <span className="text-amber-500">{user?.name?.split(' ')[0]}!</span>
            </h2>
            <p className="text-zinc-400 font-bold text-sm uppercase tracking-[0.2em]">
              Siap untuk meningkatkan skill kamu hari ini?
            </p>
          </div>
          <BookOpen className="absolute right-[-20px] bottom-[-20px] h-64 w-64 text-white/5 rotate-12" />
        </section>

        {/* LIST KURSUS */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-black uppercase italic tracking-tighter text-zinc-900">
              Kursus <span className="text-amber-500">Tersedia</span>
            </h3>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Pilih program yang sesuai dengan karirmu</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.length > 0 ? (
            courses.map((course) => (
              <Card key={course.id} className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white group hover:shadow-2xl transition-all duration-300">
                <div className="h-48 bg-zinc-100 relative overflow-hidden flex items-center justify-center">
                   <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/20 to-transparent" />
                   <GraduationCap className="h-20 w-20 text-zinc-200 group-hover:text-amber-500/20 transition-colors duration-500" />
                   <Badge className="absolute top-4 right-4 bg-white/90 backdrop-blur text-zinc-900 font-black border-none text-[10px] uppercase italic">
                      {course.category || "Development"}
                   </Badge>
                </div>
                
                <CardHeader className="pt-6">
                  <CardTitle className="font-black uppercase italic text-xl tracking-tighter leading-tight group-hover:text-amber-600 transition-colors">
                    {course.title}
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="text-zinc-500 text-sm font-medium line-clamp-2 mb-6">
                    {course.description || "Pelajari keahlian baru dengan kurikulum berbasis industri terbaru."}
                  </p>

                  <div className="flex items-center justify-between mb-6 bg-zinc-50 p-4 rounded-2xl">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">Investasi</span>
                      <span className="text-lg font-black text-zinc-900">
                        {course.price === 0 ? "GRATIS" : `Rp ${course.price.toLocaleString()}`}
                      </span>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center">
                      <Calendar className="text-amber-600 h-5 w-5" />
                    </div>
                  </div>

                  <Button 
                    onClick={() => handleEnroll(course.id)}
                    disabled={registeringId === course.id}
                    className="w-full bg-zinc-900 hover:bg-amber-500 text-white h-14 rounded-2xl font-black uppercase tracking-[0.1em] transition-all shadow-lg shadow-zinc-200 active:scale-95"
                  >
                    {registeringId === course.id ? (
                      <Loader2 className="animate-spin h-5 w-5" />
                    ) : (
                      <span className="flex items-center gap-2">Daftar Sekarang <ArrowRight size={18} /></span>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <p className="font-black uppercase italic text-zinc-300 text-2xl tracking-tighter">Belum ada kursus yang tersedia</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
