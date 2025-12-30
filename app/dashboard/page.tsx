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

export default function ParticipantDashboard() {
  const [courses, setCourses] = useState<any[]>([])
  const [myRegistrations, setMyRegistrations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<any>(null)
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
      setUser(JSON.parse(userData))
      fetchDashboardData(token)
    } catch (e) {
      localStorage.clear()
      router.push("/login")
    }
  }, [])

  const fetchDashboardData = async (token: string) => {
    try {
      const headers = { 
        "Accept": "application/json", 
        "Authorization": `Bearer ${token}` 
      }
      
      // Ambil data kursus dan pendaftaran secara bersamaan
      const [resCourses, resRegis] = await Promise.all([
        fetch("https://backend.mejatika.com/api/courses", { headers }),
        fetch("https://backend.mejatika.com/api/registrations", { headers, cache: 'no-store' })
      ])

      const dataCourses = await resCourses.json()
      const dataRegis = await resRegis.json()

      setCourses(Array.isArray(dataCourses) ? dataCourses : (dataCourses.data || []))
      setMyRegistrations(Array.isArray(dataRegis) ? dataRegis : (dataRegis.data || []))
    } catch (err) {
      console.error("Gagal load data")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    window.location.href = "/login"
  }

  if (!mounted) return null

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-zinc-50">
        <Loader2 className="animate-spin text-amber-500 h-10 w-10 mb-4" />
        <p className="font-black uppercase italic text-zinc-400 tracking-tighter">Sinkronisasi Status...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 pb-20">
      {/* NAVBAR */}
      <nav className="bg-white border-b border-zinc-100 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 bg-zinc-900 rounded-xl flex items-center justify-center">
              <GraduationCap className="text-amber-500 h-6 w-6" />
            </div>
            <span className="font-black uppercase italic tracking-tighter text-xl text-zinc-900">
              MEJA<span className="text-amber-500">TIKA</span>
            </span>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout} className="text-red-500 hover:bg-red-50 rounded-full">
            <LogOut size={20} />
          </Button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-10">
        {/* HERO SECTION */}
        <section className="mb-12 bg-zinc-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-zinc-200">
          <div className="relative z-10">
            <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-2">
              Hello, <span className="text-amber-500">{user?.name?.split(' ')[0] || 'Student'}</span>
            </h2>
            <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest italic">Panel Belajar Peserta</p>
          </div>
          <BookOpen className="absolute right-[-20px] bottom-[-20px] h-48 w-48 text-white/5" />
        </section>

        {/* COURSE GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {courses.map((course) => {
            // MENCARI APAKAH KURSUS INI SUDAH DIDAFTARKAN
            const registration = myRegistrations?.find((r: any) => r.course_id === course.id)
            const isRegistered = !!registration
            const status = registration?.status?.toLowerCase() // Memastikan huruf kecil (success/pending)

            return (
              <Card key={course.id} className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white group hover:translate-y-[-5px] transition-all duration-300">
                <div className="h-44 bg-zinc-100 relative overflow-hidden">
                  <img 
                    src={course.thumbnail || "/placeholder.svg"} 
                    alt={course.title} 
                    className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  />
                  
                  {/* Tampilkan Badge di pojok kanan atas gambar jika sudah daftar */}
                  {isRegistered && (
                    <div className="absolute top-4 right-4">
                      <Badge className={`${status === 'success' || status === 'aktif' ? 'bg-green-500' : 'bg-amber-500'} text-white border-none px-4 py-1 rounded-full font-bold uppercase text-[10px] tracking-widest`}>
                        {status === 'success' || status === 'aktif' ? 'Sudah Aktif' : 'Menunggu Verifikasi'}
                      </Badge>
                    </div>
                  )}
                </div>

                <CardContent className="p-8">
                  <CardTitle className="font-black uppercase italic text-xl mb-3 tracking-tighter text-zinc-900">
                    {course.title}
                  </CardTitle>
                  
                  <div 
                    className="text-zinc-500 text-sm line-clamp-2 mb-6" 
                    dangerouslySetInnerHTML={{ __html: course.description }}
                  />

                  <div className="flex items-center justify-between mb-6 bg-zinc-50 p-4 rounded-2xl">
                    <span className="text-lg font-black text-zinc-900">
                      {course.price == 0 ? "GRATIS" : `Rp ${Number(course.price).toLocaleString('id-ID')}`}
                    </span>
                    <Calendar className="text-amber-500 h-5 w-5" />
                  </div>

                  {/* LOGIKA TOMBOL BERDASARKAN STATUS */}
                  {status === 'success' || status === 'aktif' ? (
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white h-14 rounded-2xl font-black uppercase italic gap-2 shadow-lg shadow-green-100">
                      <CheckCircle2 size={20} /> Mulai Belajar
                    </Button>
                  ) : isRegistered ? (
                    <Button disabled className="w-full bg-zinc-100 text-zinc-400 h-14 rounded-2xl font-black uppercase italic gap-2 border border-zinc-200">
                      <Clock size={20} /> Menunggu Verifikasi
                    </Button>
                  ) : (
                    <Button 
                      className="w-full bg-zinc-900 hover:bg-amber-500 text-white h-14 rounded-2xl font-black uppercase italic transition-all duration-300 shadow-lg shadow-zinc-200"
                      onClick={() => {/* Tambahkan handleEnroll di sini jika perlu */}}
                    >
                      Daftar Kursus
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
