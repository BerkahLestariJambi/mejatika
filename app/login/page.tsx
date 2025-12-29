"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  BookOpen, 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  Loader2, 
  TrendingUp,
  PlusCircle
} from "lucide-react"
import Link from "next/link"

function AdminDashboardContent() {
  const [stats, setStats] = useState({ users: 0, courses: 0, registrations: 0 })
  const [loading, setLoading] = useState(true)
  const [adminName, setAdminName] = useState("")
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (!token || !userData) {
      router.push("/login")
      return
    }

    try {
      const user = JSON.parse(userData)
      if (user.role !== "admin") {
        router.push("/dashboard") // Jika bukan admin, lempar ke dashboard peserta
        return
      }
      setAdminName(user.name)
    } catch (e) {
      router.push("/login")
    }

    // Simulasi pengambilan data statistik (Anda bisa hubungkan ke API asli nanti)
    const fetchStats = async () => {
      try {
        // Contoh endpoint: https://backend.mejatika.com/api/admin/stats
        // Untuk sementara kita set data dummy agar UI terlihat
        setStats({ users: 120, courses: 15, registrations: 45 })
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [router])

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
    <div className="min-h-screen bg-zinc-50 flex">
      {/* SIDEBAR */}
      <aside className="w-64 bg-zinc-900 text-white hidden md:flex flex-col p-6">
        <div className="font-black italic text-2xl mb-10 tracking-tighter">
          MEJA<span className="text-amber-500">TIKA</span>
          <span className="block text-[10px] not-italic font-bold text-zinc-500 tracking-[0.3em] uppercase">Admin Panel</span>
        </div>
        
        <nav className="space-y-2 flex-1">
          <Link href="/admin" className="flex items-center gap-3 p-3 bg-amber-500 text-zinc-900 rounded-xl font-black uppercase text-xs">
            <LayoutDashboard size={18} /> Dashboard
          </Link>
          <Link href="/admin/courses" className="flex items-center gap-3 p-3 hover:bg-zinc-800 rounded-xl font-bold uppercase text-xs transition-colors">
            <BookOpen size={18} /> Manage Courses
          </Link>
          <Link href="/admin/users" className="flex items-center gap-3 p-3 hover:bg-zinc-800 rounded-xl font-bold uppercase text-xs transition-colors">
            <Users size={18} /> Manage Users
          </Link>
        </nav>

        <Button variant="ghost" onClick={handleLogout} className="justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 font-bold uppercase text-xs p-3">
          <LogOut size={18} /> Logout
        </Button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black uppercase italic tracking-tighter text-zinc-900">
              Admin <span className="text-amber-500">Overview</span>
            </h1>
            <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest mt-1">Selamat datang kembali, {adminName}</p>
          </div>
          <Button className="bg-zinc-900 hover:bg-amber-500 text-white rounded-xl font-black uppercase text-xs h-12 px-6 shadow-lg">
            <PlusCircle size={18} className="mr-2" /> New Course
          </Button>
        </header>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card className="border-none shadow-xl rounded-[2rem] bg-white p-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Total Students</CardTitle>
              <Users className="h-5 w-5 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black italic tracking-tighter">{stats.users}</div>
              <p className="text-[10px] text-emerald-500 font-bold mt-1 flex items-center gap-1">
                <TrendingUp size={12} /> +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl rounded-[2rem] bg-white p-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Active Courses</CardTitle>
              <BookOpen className="h-5 w-5 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black italic tracking-tighter">{stats.courses}</div>
              <p className="text-[10px] text-zinc-400 font-bold mt-1 uppercase">Ready for enrollment</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl rounded-[2rem] bg-white p-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">New Registrations</CardTitle>
              <Settings className="h-5 w-5 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black italic tracking-tighter">{stats.registrations}</div>
              <p className="text-[10px] text-amber-600 font-bold mt-1 uppercase italic tracking-wider italic">Awaiting Approval</p>
            </CardContent>
          </Card>
        </div>

        {/* QUICK ACTIONS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-zinc-100">
            <h3 className="font-black uppercase italic tracking-tighter text-xl mb-6">Recent Activities</h3>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                  <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold italic">
                    {i}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900">Peserta Baru Mendaftar</p>
                    <p className="text-[10px] text-zinc-400 uppercase font-black">2 Minutes Ago</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-zinc-900 p-8 rounded-[2.5rem] shadow-xl text-white flex flex-col justify-center relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="font-black uppercase italic tracking-tighter text-3xl mb-2 text-amber-500">System Status</h3>
              <p className="text-zinc-400 text-sm font-bold uppercase tracking-widest leading-relaxed">
                Backend Laravel: <span className="text-emerald-400 italic">Connected</span><br />
                Frontend Next.js: <span className="text-emerald-400 italic">Optimized</span>
              </p>
              <Button className="mt-6 bg-white text-zinc-900 hover:bg-amber-500 hover:text-white rounded-xl font-black uppercase text-xs transition-all shadow-lg">
                View Server Logs
              </Button>
            </div>
            <TrendingUp className="absolute right-[-20px] bottom-[-20px] h-48 w-48 text-white/5 -rotate-12" />
          </section>
        </div>
      </main>
    </div>
  )
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={null}>
      <AdminDashboardContent />
    </Suspense>
  )
}
