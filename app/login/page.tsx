"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, GraduationCap, LogOut, ArrowRight } from "lucide-react"

export default function DashboardPage() {
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState<string>("Peserta")
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()

  // Fungsi helper krusial untuk mencegah "React Error #31"
  // Memastikan data yang dirender HANYA string atau angka
  const safeRender = (data: any): string => {
    if (typeof data === "string") return data;
    if (typeof data === "number") return data.toString();
    if (typeof data === "object" && data !== null) {
      return data.name || data.title || "Data Detail";
    }
    return "";
  };

  useEffect(() => {
    setIsClient(true)
    
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (!token || !userData) {
      router.push("/login")
      return
    }

    try {
      const parsedUser = JSON.parse(userData)
      // Paksa menjadi string agar tidak crash
      setUserName(safeRender(parsedUser.name || "Peserta"))
    } catch (e) {
      console.error("Gagal parse data user")
    }

    fetchCourses(token)
  }, [])

  const fetchCourses = async (token: string) => {
    try {
      const res = await fetch("https://backend.mejatika.com/api/courses", {
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        }
      })
      
      const responseData = await res.json()
      
      // Standarisasi data ke format Array
      if (Array.isArray(responseData)) {
        setCourses(responseData)
      } else if (responseData?.data && Array.isArray(responseData.data)) {
        setCourses(responseData.data)
      }
    } catch (err) {
      console.error("Error fetching courses:", err)
    } finally {
      // Pastikan loading berhenti meskipun terjadi error
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    window.location.href = "/login"
  }

  if (!isClient) return null

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-zinc-50">
        <Loader2 className="animate-spin text-amber-500 h-10 w-10 mb-4" />
        <p className="font-black uppercase italic text-zinc-400 text-[10px] tracking-[0.3em]">
          MENYIAPKAN DASHBOARD...
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 pb-20 text-zinc-900">
      <nav className="bg-white border-b px-6 py-4 sticky top-0 z-10 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2 font-black italic tracking-tighter text-xl uppercase">
            MEJA<span className="text-amber-500">TIKA</span>
        </div>
        <Button variant="ghost" onClick={handleLogout} className="text-red-500 font-bold hover:bg-red-50 rounded-xl px-4">
          <LogOut size={18} className="mr-2" /> LOGOUT
        </Button>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-10">
        <header className="mb-10 bg-zinc-900 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter">
              Hello, <span className="text-amber-500">{userName}</span>
            </h2>
            <p className="text-zinc-400 font-bold text-[10px] uppercase tracking-[0.4em] mt-2 opacity-70">
              Welcome to Member Area
            </p>
          </div>
          <GraduationCap className="absolute right-[-20px] bottom-[-20px] h-48 w-48 text-white/5 -rotate-12" />
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.length > 0 ? (
            courses.map((course: any) => (
              <Card key={course.id?.toString() || Math.random()} className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white hover:shadow-2xl transition-all duration-300">
                <div className="bg-zinc-100 h-32 flex items-center justify-center relative">
                   <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent" />
                   <GraduationCap className="h-12 w-12 text-zinc-300" />
                </div>
                <CardContent className="p-8">
                  <CardTitle className="font-black uppercase italic tracking-tighter text-xl mb-3 leading-tight">
                    {safeRender(course.title)}
                  </CardTitle>
                  <p className="text-zinc-500 text-sm mb-8 line-clamp-2 font-medium leading-relaxed">
                    {safeRender(course.description)}
                  </p>
                  <Button className="w-full bg-zinc-900 hover:bg-amber-500 text-white rounded-2xl h-14 font-black uppercase tracking-widest shadow-lg shadow-zinc-200 active:scale-95 transition-all">
                    Daftar Sekarang <ArrowRight size={18} className="ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-zinc-200">
               <p className="font-black uppercase italic text-zinc-300 text-2xl tracking-tighter">
                 Belum ada kursus tersedia
               </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
