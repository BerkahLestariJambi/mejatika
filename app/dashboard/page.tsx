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
  const [registeringId, setRegisteringId] = useState<number | null>(null)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (!token || !userData) {
      router.push("/login")
      return
    }

    try {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)

      // Proteksi Role: Jika admin nyasar ke sini, lempar ke dashboard admin
      if (parsedUser.role === "admin") {
        router.push("/admin")
        return
      }
    } catch (e) {
      localStorage.clear()
      router.push("/login")
    }

    fetchCourses()
  }, [router])

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("https://backend.mejatika.com/api/courses", {
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        }
      })
      const data = await res.json()
      
      // Menangani format array langsung atau object { data: [] } dari Laravel
      const finalData = Array.isArray(data) ? data : (data.data || [])
      setCourses(finalData)
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
        alert("Pendaftaran Berhasil! Admin akan segera memverifikasi pesanan Anda.")
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
    window.location.href = "/login"
  }

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-zinc-50">
        <Loader2 className="animate-spin text-amber-500 h-12 w-12 mb-4" />
        <p className="font-black uppercase italic text-zinc-400 tracking-[0.3em] text-xs">Menyiapkan Dashboard...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 pb-20">
      {/* NAVBAR */}
      <nav className="bg-white border-b border-zinc-100 px-6 py-4 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 bg-zinc-900 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
              <GraduationCap className="text-amber-500 h-6 w-6" />
            </div>
            <span className="font-black uppercase italic tracking-tighter text-xl text-zinc-900">
              MEJA<span className="text-amber-500">TIKA</span>
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
              <p className="text-[10px] font-black uppercase text-zinc-400 leading-none mb-1">Signed in as</p>
              <p className="text-sm font-black text-zinc-900 uppercase italic">{user?.name}</p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleLogout}
              className="rounded-xl hover:bg-red-50 hover:text-red-500 transition-all active:scale-90"
            >
              <LogOut size={20} />
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-10">
        {/* BANNER */}
        <section className="mb-12 bg-zinc-900 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl border-4 border-white">
          <div className="relative z-10">
            <Badge className="bg-amber-500 text-zinc-900 font-black mb-4 uppercase italic border-none shadow-lg">
              Official Student
            </Badge>
            <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter mb-4 leading-none">
              Hello, <span className="text-amber-500">{user?.name?.split(' ')[0]}</span>
            </h2>
            <p className="text-zinc-400 font-bold text-sm uppercase tracking-[0.2em] max-w-md">
              Akses materi eksklusif dan tingkatkan level skill programming kamu hari ini.
            </p>
          </div>
          <BookOpen className="absolute right-[-40px] bottom-[-40px] h-80 w-80 text-white/5 rotate-12" />
        </section>

        {/* TITLES */}
        <div className="mb-8">
          <h3 className="text-3xl font-black uppercase italic tracking-tighter text-zinc-900">
            Katalog <span className="text-amber-500">Program</span>
          </h3>
          <div className="h-1.5 w-20 bg-amber-500 rounded-full mt-2" />
        </div>

        {/* GRID KURSUS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.length > 0 ? (
            courses.map((course) => (
              <Card key={course.id} className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <div className="h-48 bg-zinc-100 relative overflow-hidden flex items-center justify-center">
                   <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/40 to-transparent z-10" />
                   <GraduationCap className="h-24 w-24 text-zinc-200 group-hover:scale-110 group-hover:text-amber-500/20 transition-all duration-700" />
                   <Badge className="absolute top-6 right-6 bg-amber-500 text-zinc-900 font-black border-none text-[10px] uppercase italic z-20 shadow-lg">
                      {course.category || "Bootcamp"}
                   </Badge>
                </div>
                
                <CardHeader className="pt-8 px-8">
                  <CardTitle className="font-black uppercase italic text-2xl tracking-tighter leading-tight group-hover:text-amber-600 transition-colors">
                    {course.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="px-8 pb-8">
                  {/* FIX: RENDER HTML DESCRIPTION */}
                  <div 
                    className="text-zinc-500 text-sm font-medium line-clamp-3 mb-8 min-h-[60px] prose prose-sm prose-zinc"
                    dangerouslySetInnerHTML={{ __html: course.description || "Belum ada deskripsi." }}
                  />

                  <div className="flex items-center justify-between mb-8 bg-zinc-50 p-5 rounded-[2rem] border border-zinc-100">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">Total Biaya</span>
                      <span className="text-xl font-black text-zinc-900 italic tracking-tighter">
                        {course.price === 0 ? "FREE" : `Rp ${course.price.toLocaleString('id-ID')}`}
                      </span>
                    </div>
                    <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                      <Calendar className="text-amber-600 h-6 w-6" />
                    </div>
                  </div>

                  <Button 
                    onClick={() => handleEnroll(course.id)}
                    disabled={registeringId === course.id}
                    className="w-full bg-zinc-900 hover:bg-amber-500 text-white h-16 rounded-[1.5rem] font-black uppercase tracking-widest transition-all shadow-xl shadow-zinc-200 active:scale-95 group"
                  >
                    {registeringId === course.id ? (
                      <Loader2 className="animate-spin h-6 w-6" />
                    ) : (
                      <span className="flex items-center gap-3 text-sm">
                        Ambil Kursus Ini <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                      </span>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-zinc-200">
              <BookOpen className="h-16 w-16 text-zinc-200 mx-auto mb-4" />
              <p className="font-black uppercase italic text-zinc-400 text-xl tracking-tighter">Belum ada kursus tersedia</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
