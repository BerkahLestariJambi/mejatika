"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Loader2, 
  GraduationCap, 
  Calendar, 
  ArrowRight, 
  LogOut,
  BookOpen
} from "lucide-react"

export default function ParticipantDashboard() {
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false) // State kunci untuk stop loading
  const [registeringId, setRegisteringId] = useState<number | null>(null)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    setMounted(true) // Menandakan komponen sudah menempel di browser
    
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (!token || !userData) {
      router.push("/login")
      return
    }

    try {
      const parsedUser = JSON.parse(userData)
      if (parsedUser.role === "admin") {
        router.push("/admin")
        return
      }
      setUser(parsedUser)
      fetchCourses(token)
    } catch (e) {
      localStorage.clear()
      router.push("/login")
    }
    
    // Safety break: Jika 7 detik masih loading, paksa berhenti
    const timer = setTimeout(() => setLoading(false), 7000)
    return () => clearTimeout(timer)
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
      const finalData = Array.isArray(data) ? data : (data.data || [])
      setCourses(finalData)
    } catch (err) {
      console.error("Fetch error")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    window.location.href = "/login"
  }

  // JANGAN RENDERING SEBELUM MOUNTED
  if (!mounted) return null

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-zinc-50">
        <Loader2 className="animate-spin text-amber-500 h-12 w-12 mb-4" />
        <p className="font-black uppercase italic text-zinc-400 tracking-[0.3em] text-[10px]">
          SINKRONISASI DATA MEJATIKA...
        </p>
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
          <Button variant="ghost" size="icon" onClick={handleLogout} className="text-red-500">
            <LogOut size={20} />
          </Button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-10">
        <section className="mb-12 bg-zinc-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-2">
              Hello, <span className="text-amber-500">{user?.name?.split(' ')[0]}</span>
            </h2>
            <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest">Student Dashboard</p>
          </div>
          <BookOpen className="absolute right-[-20px] bottom-[-20px] h-48 w-48 text-white/5" />
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {courses.map((course) => (
            <Card key={course.id} className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white group">
              <div className="h-40 bg-zinc-100 flex items-center justify-center relative">
                 <GraduationCap className="h-16 w-16 text-zinc-200 group-hover:text-amber-500/20 transition-all" />
              </div>
              <CardContent className="p-8">
                <CardTitle className="font-black uppercase italic text-xl mb-3 tracking-tighter">
                  {course.title}
                </CardTitle>
                <div 
                  className="text-zinc-500 text-sm line-clamp-3 mb-6 prose prose-sm"
                  dangerouslySetInnerHTML={{ __html: course.description }}
                />
                <Button 
                  className="w-full bg-zinc-900 hover:bg-amber-500 text-white h-14 rounded-2xl font-black uppercase italic"
                  onClick={() => {/* fungsi enroll */}}
                >
                  Daftar Sekarang <ArrowRight size={18} className="ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
