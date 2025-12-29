"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, GraduationCap, LogOut, ArrowRight } from "lucide-react"

export default function DashboardPage() {
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState<string>("Peserta")
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  // 1. Fungsi pembersih data agar tidak kena "React Error #31"
  const safeText = (val: any) => {
    if (typeof val === "string" || typeof val === "number") return val;
    if (typeof val === "object" && val !== null) return val.name || val.title || "Detail";
    return "";
  };

  useEffect(() => {
    setMounted(true)
    
    // Ambil data dari localStorage
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (!token || !userData) {
      router.push("/login")
      return
    }

    try {
      const parsed = JSON.parse(userData)
      setUserName(safeText(parsed.name))
    } catch (e) {
      console.error("User data error")
    }

    // Panggil API
    fetch("https://backend.mejatika.com/api/courses", {
      headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" }
    })
    .then(res => res.json())
    .then(data => {
      const arrayData = Array.isArray(data) ? data : (data?.data || [])
      setCourses(arrayData)
    })
    .catch(err => console.log("Fetch error"))
    .finally(() => setLoading(false))

    // SAFETY NET: Paksa loading berhenti setelah 3 detik jika API lambat/error
    const timer = setTimeout(() => setLoading(false), 3000)
    return () => clearTimeout(timer)
  }, [router])

  // Cegah Hydration Error
  if (!mounted) return null

  // Tampilan Loading
  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="animate-spin text-amber-500 h-10 w-10 mb-4" />
        <p className="font-bold text-zinc-400 text-xs tracking-tighter uppercase italic">
          Menyiapkan Data...
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      {/* NAVBAR */}
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="font-black italic text-xl">MEJA<span className="text-amber-500">TIKA</span></div>
        <Button 
          variant="ghost" 
          onClick={() => { localStorage.clear(); window.location.href = "/login"; }}
          className="text-red-500 font-bold"
        >
          <LogOut size={18} className="mr-2" /> EXIT
        </Button>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* WELCOME CARD */}
        <div className="mb-10 bg-zinc-900 rounded-[2.5rem] p-8 text-white shadow-2xl">
          <h2 className="text-3xl font-black uppercase italic tracking-tighter">
            Hello, <span className="text-amber-500">{userName}</span>
          </h2>
          <p className="text-zinc-500 font-bold text-[10px] tracking-[0.3em] mt-2">DASHBOARD PESERTA</p>
        </div>

        {/* COURSE GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.length > 0 ? (
            courses.map((c: any, i: number) => (
              <Card key={c.id || i} className="border-none shadow-lg rounded-[2rem] overflow-hidden bg-white">
                <div className="bg-zinc-100 h-24 flex items-center justify-center">
                  <GraduationCap className="h-10 w-10 text-zinc-200" />
                </div>
                <CardContent className="p-6">
                  <CardTitle className="font-black uppercase italic text-lg mb-2">
                    {safeText(c.title)}
                  </CardTitle>
                  <p className="text-zinc-500 text-xs mb-6 line-clamp-2">
                    {safeText(c.description)}
                  </p>
                  <Button className="w-full bg-zinc-900 hover:bg-amber-500 text-white rounded-xl h-12 font-black uppercase text-xs">
                    Daftar Sekarang <ArrowRight size={16} className="ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-10 text-zinc-300 font-black italic uppercase">
              Data kursus tidak ditemukan
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
