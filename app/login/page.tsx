"use client"

import { useEffect, useState, Suspense } from "react"
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
  LogOut
} from "lucide-react"

// Pisahkan komponen utama agar bisa dibungkus Suspense jika diperlukan
function DashboardContent() {
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [registeringId, setRegisteringId] = useState<number | null>(null)
  const [userName, setUserName] = useState("") // Gunakan string, jangan simpan objek user langsung untuk dirender
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
      // PASTIKAN HANYA STRING YANG DISIMPAN KE STATE UNTUK DIRENDER
      setUserName(parsedUser.name || "Peserta")
      
      if (parsedUser.role !== "peserta") {
        router.push("/login") 
      }
    } catch (e) {
      localStorage.clear()
      router.push("/login")
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
      // Pastikan data adalah array sebelum disimpan
      if (Array.isArray(data)) {
        setCourses(data)
      } else if (data.data && Array.isArray(data.data)) {
        setCourses(data.data)
      }
    } catch (err) {
      console.error("Gagal memuat data kursus")
    } finally {
      setLoading(false)
    }
  }

  const handleEnroll = async (courseId: number) => {
    if (!confirm("Daftar kursus ini?")) return
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
      if (res.ok) {
        alert("Berhasil mendaftar!")
      } else {
        const errData = await res.json()
        alert(errData.message || "Gagal mendaftar.")
      }
    } catch (err) {
      alert("Error koneksi.")
    } finally {
      setRegisteringId(null)
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    router.push("/login")
  }

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-zinc-50">
      <Loader2 className="animate-spin text-amber-500 h-10 w-10" />
    </div>
  )

  return (
    <div className="min-h-screen bg-zinc-50 pb-20">
      <nav className="bg-white border-b px-6 py-4 sticky top-0 z-10 flex justify-between items-center">
        <div className="flex items-center gap-2 font-black italic tracking-tighter">
            MEJA<span className="text-amber-500">TIKA</span>
        </div>
        <Button variant="ghost" size="icon" onClick={handleLogout} className="text-red-500">
          <LogOut size={20} />
        </Button>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-10">
        <section className="mb-12 bg-zinc-900 rounded-[2rem] p-8 text-white">
          <h2 className="text-4xl font-black uppercase italic tracking-tighter">
            Hello, <span className="text-amber-500">{userName}</span>
          </h2>
          <p className="text-zinc-400 font-bold text-xs uppercase tracking-widest mt-2">Dashboard Peserta</p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {courses.map((course) => (
            <Card key={course.id} className="border-none shadow-xl rounded-[2rem] overflow-hidden">
              <CardHeader className="bg-zinc-100 h-32 flex items-center justify-center">
                <GraduationCap className="h-12 w-12 text-zinc-300" />
              </CardHeader>
              <CardContent className="pt-6">
                <CardTitle className="font-black uppercase italic tracking-tighter mb-2">{course.title}</CardTitle>
                <p className="text-zinc-500 text-sm mb-6 line-clamp-2">{course.description}</p>
                <Button 
                  onClick={() => handleEnroll(course.id)}
                  disabled={registeringId === course.id}
                  className="w-full bg-zinc-900 hover:bg-amber-500 rounded-xl font-black uppercase"
                >
                  {registeringId === course.id ? <Loader2 className="animate-spin" /> : "Daftar Kursus"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<Loader2 className="animate-spin" />}>
      <DashboardContent />
    </Suspense>
  )
}
