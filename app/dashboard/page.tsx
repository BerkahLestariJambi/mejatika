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
  CheckCircle2, 
  Clock,
  LogOut 
} from "lucide-react"

interface Course {
  id: number
  title: string
  description: string
  price: number
  thumbnail?: string
}

interface Registration {
  course_id: number
  status: string
}

export default function ParticipantDashboard() {
  const [courses, setCourses] = useState<Course[]>([])
  const [registrations, setRegistrations] = useState<Registration[]>([]) // Simpan data pendaftaran
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [registeringId, setRegisteringId] = useState<number | null>(null)
  const [user, setUser] = useState<{name: string, role: string} | null>(null)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (!token || !userData) {
      router.push("/login")
      return
    }

    try {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      fetchData(token)
    } catch (e) {
      localStorage.clear()
      router.push("/login")
    }
  }, [router])

  // Ambil data Kursus DAN data Pendaftaran sekaligus
  const fetchData = async (token: string) => {
    try {
      const headers = { 
        "Accept": "application/json", 
        "Authorization": `Bearer ${token}` 
      }
      
      const [resCourses, resRegis] = await Promise.all([
        fetch("https://backend.mejatika.com/api/courses", { headers }),
        fetch("https://backend.mejatika.com/api/registrations", { headers, cache: 'no-store' })
      ])

      const dataCourses = await resCourses.json()
      const dataRegis = await resRegis.json()

      setCourses(Array.isArray(dataCourses) ? dataCourses : (dataCourses.data || []))
      setRegistrations(Array.isArray(dataRegis) ? dataRegis : (dataRegis.data || []))
    } catch (err) {
      console.error("Gagal load data")
    } finally {
      setLoading(false)
    }
  }

  const handleEnroll = async (courseId: number) => {
    if (!confirm("Konfirmasi pendaftaran?")) return
    setRegisteringId(courseId)
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("https://backend.mejatika.com/api/registrations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ course_id: courseId })
      })
      
      if (res.ok) {
        alert("Pendaftaran Berhasil! Menunggu aktivasi admin.")
        fetchData(token!) // Refresh data agar status langsung muncul "Pending"
      } else {
        alert("Gagal mendaftar.")
      }
    } catch (err) {
      alert("Error koneksi.")
    } finally {
      setRegisteringId(null)
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    window.location.href = "/login"
  }

  if (!mounted) return null
  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-zinc-50">
      <Loader2 className="animate-spin text-amber-500 h-10 w-10 mb-4" />
      <p className="font-black uppercase italic text-zinc-400 tracking-tighter">Sinkronisasi Data...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-zinc-50 pb-20">
      <nav className="bg-white border-b border-zinc-100 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 bg-zinc-900 rounded-xl flex items-center justify-center">
              <GraduationCap className="text-amber-500 h-6 w-6" />
            </div>
            <span className="font-black uppercase italic tracking-tighter text-xl">MEJA<span className="text-amber-500">TIKA</span></span>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout} className="text-red-500"><LogOut size={20} /></Button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-10">
        <section className="mb-12 bg-zinc-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-2">
              Hello, <span className="text-amber-500">{user?.name?.split(' ')[0]}</span>
            </h2>
            <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest">Panel Belajar Siswa</p>
          </div>
          <BookOpen className="absolute right-[-20px] bottom-[-20px] h-48 w-48 text-white/5" />
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {courses.map((course) => {
            // CEK STATUS PENDAFTARAN UNTUK KURSUS INI
            const userReg = registrations.find(r => r.course_id === course.id)
            const isRegistered = !!userReg
            const status = userReg?.status // 'pending', 'success', dsb

            return (
              <Card key={course.id} className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white group">
                <div className="h-44 bg-zinc-100 relative overflow-hidden">
                  <img src={course.thumbnail || "/placeholder.svg"} alt={course.title} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  {isRegistered && (
                    <div className="absolute top-4 right-4">
                      <Badge className={`${status === 'success' || status === 'aktif' ? 'bg-green-500' : 'bg-amber-500'} text-white border-none px-4 py-1 rounded-full font-bold uppercase text-[10px]`}>
                        {status === 'success' || status === 'aktif' ? 'Aktif' : 'Proses Verifikasi'}
                      </Badge>
                    </div>
                  )}
                </div>
                <CardContent className="p-8">
                  <CardTitle className="font-black uppercase italic text-xl mb-3 tracking-tighter line-clamp-1">{course.title}</CardTitle>
                  <div className="text-zinc-500 text-sm line-clamp-2 mb-6" dangerouslySetInnerHTML={{ __html: course.description }} />

                  <div className="flex items-center justify-between mb-6 bg-zinc-50 p-4 rounded-2xl">
                    <span className="text-lg font-black text-zinc-900">
                      {course.price == 0 ? "GRATIS" : `Rp ${Number(course.price).toLocaleString('id-ID')}`}
                    </span>
                    <Calendar className="text-amber-500 h-5 w-5" />
                  </div>

                  {/* LOGIC TOMBOL BERDASARKAN STATUS */}
                  {status === 'success' || status === 'aktif' ? (
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white h-14 rounded-2xl font-black uppercase italic gap-2">
                      <CheckCircle2 size={20} /> Mulai Belajar
                    </Button>
                  ) : isRegistered ? (
                    <Button disabled className="w-full bg-zinc-100 text-zinc-400 h-14 rounded-2xl font-black uppercase italic gap-2">
                      <Clock size={20} /> Menunggu Verifikasi
                    </Button>
                  ) : (
                    <Button 
                      className="w-full bg-zinc-900 hover:bg-amber-500 text-white h-14 rounded-2xl font-black uppercase italic"
                      onClick={() => handleEnroll(course.id)}
                      disabled={registeringId === course.id}
                    >
                      {registeringId === course.id ? <Loader2 className="animate-spin" /> : "Daftar Kursus"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </main>
    </div>
  )
}
