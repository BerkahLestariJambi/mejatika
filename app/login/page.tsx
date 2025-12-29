"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, GraduationCap, LogOut, ArrowRight } from "lucide-react"

export default function DashboardPage() {
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState<string>("")
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()

  // Pastikan komponen hanya me-render di browser
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
      // Paksa menjadi string murni
      setUserName(String(parsedUser.name || "Peserta"))
    } catch (e) {
      setUserName("Peserta")
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
      
      // Standarisasi data ke Array
      if (Array.isArray(data)) {
        setCourses(data)
      } else if (data?.data && Array.isArray(data.data)) {
        setCourses(data.data)
      }
    } catch (err) {
      console.error("Fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    router.push("/login")
  }

  // Jika sedang build di server, jangan render apapun
  if (!isClient) return null

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-zinc-50">
      <Loader2 className="animate-spin text-amber-500 h-10 w-10" />
    </div>
  )

  return (
    <div className="min-h-screen bg-zinc-50 pb-20 text-zinc-900">
      <nav className="bg-white border-b px-6 py-4 sticky top-0 z-10 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2 font-black italic tracking-tighter text-xl uppercase">
            MEJA<span className="text-amber-500">TIKA</span>
        </div>
        <Button variant="ghost" onClick={handleLogout} className="text-red-500 font-bold">
          <LogOut size={18} className="mr-2" /> LOGOUT
        </Button>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-10">
        <header className="mb-10 bg-zinc-900 rounded-[2rem] p-8 text-white shadow-xl">
          <h2 className="text-3xl font-black uppercase italic tracking-tighter">
            Hello, <span className="text-amber-500">{userName}</span>
          </h2>
          <p className="text-zinc-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-2">Member Area</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.length > 0 ? (
            courses.map((course: any) => (
              <Card key={course.id?.toString() || Math.random()} className="border-none shadow-lg rounded-[2rem] overflow-hidden bg-white">
                <div className="bg-zinc-100 h-24 flex items-center justify-center">
                  <GraduationCap className="h-10 w-10 text-zinc-300" />
                </div>
                <CardContent className="p-6">
                  <CardTitle className="font-black uppercase italic tracking-tighter text-lg mb-2">
                    {String(course.title || "No Title")}
                  </CardTitle>
                  <p className="text-zinc-500 text-xs mb-6 line-clamp-2">
                    {String(course.description || "")}
                  </p>
                  <Button className="w-full bg-zinc-900 hover:bg-amber-500 text-white rounded-xl h-12 font-black uppercase">
                    Daftar Kursus <ArrowRight size={16} className="ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-10 text-zinc-400 font-bold uppercase italic">
               Belum ada data kursus.
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
