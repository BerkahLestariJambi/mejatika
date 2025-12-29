"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, BookOpen, CheckCircle, GraduationCap } from "lucide-react"

export default function ParticipantDashboard() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [registeringId, setRegisteringId] = useState<number | null>(null)
  const router = useRouter()

  useEffect(() => {
    // 1. Cek apakah sudah login
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    // 2. Ambil List Kursus yang Tersedia
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const res = await fetch("https://backend.mejatika.com/api/courses", {
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      })
      const data = await res.json()
      setCourses(data)
    } catch (err) {
      console.error("Gagal mengambil kursus")
    } finally {
      setLoading(false)
    }
  }

  const handleEnroll = async (courseId: number) => {
    setRegisteringId(courseId)
    try {
      const res = await fetch("https://backend.mejatika.com/api/enrollments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ course_id: courseId })
      })

      if (res.ok) {
        alert("Berhasil mendaftar kursus! Silakan tunggu konfirmasi.")
        // Refresh data atau arahkan ke halaman "Kursus Saya"
      } else {
        alert("Gagal mendaftar. Mungkin Anda sudah terdaftar di kursus ini.")
      }
    } catch (err) {
      alert("Terjadi kesalahan koneksi.")
    } finally {
      setRegisteringId(null)
    }
  }

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>

  return (
    <div className="min-h-screen bg-zinc-50 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-black uppercase italic tracking-tighter text-zinc-900">
            Peserta <span className="text-amber-500">Dashboard</span>
          </h1>
          <p className="text-zinc-500 font-bold text-sm uppercase tracking-widest">Pilih dan daftar kursus yang kamu minati</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {courses.map((course: any) => (
            <Card key={course.id} className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white hover:scale-[1.02] transition-transform">
              <div className="h-32 bg-zinc-900 flex items-center justify-center">
                <GraduationCap className="text-amber-500 h-12 w-12" />
              </div>
              <CardHeader>
                <CardTitle className="font-black uppercase italic text-xl tracking-tighter">
                  {course.title}
                </CardTitle>
                <CardDescription className="line-clamp-2 text-xs font-medium">
                  {course.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-lg font-black text-amber-600">
                    {course.price === 0 ? "FREE" : `IDR ${course.price?.toLocaleString()}`}
                  </span>
                  <span className="text-[10px] font-black bg-zinc-100 px-3 py-1 rounded-full uppercase tracking-widest">
                    {course.category || "General"}
                  </span>
                </div>
                
                <Button 
                  onClick={() => handleEnroll(course.id)}
                  disabled={registeringId === course.id}
                  className="w-full bg-zinc-900 hover:bg-amber-600 rounded-xl h-12 font-black uppercase tracking-widest text-white transition-all"
                >
                  {registeringId === course.id ? <Loader2 className="animate-spin" /> : "Daftar Kursus Sekarang"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
