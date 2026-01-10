"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Users, 
  FileText, 
  GraduationCap, 
  ImageIcon, 
  Bell,
  Loader2,
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [unreadCount, setUnreadCount] = useState(0) // State untuk notifikasi
  const [statsData, setStatsData] = useState({
    total_users: 0,
    total_news: 0,
    active_courses: 0,
    total_gallery: 0,
    recent_activities: []
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem("token")
        
        if (!token) {
          router.push("/login")
          return
        }

        const headers = {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }

        // 1. Ambil Statistik Utama
        const statsRes = await fetch(`https://backend.mejatika.com/api/admin/dashboard/stats`, {
          method: 'GET',
          headers,
          cache: 'no-store'
        })

        // 2. Ambil Data Notifikasi Baru (Lonceng)
        const notifyRes = await fetch(`https://backend.mejatika.com/api/admin/notifications`, {
          method: 'GET',
          headers,
          cache: 'no-store'
        })

        if (!statsRes.ok || !notifyRes.ok) {
          if (statsRes.status === 401) throw new Error("Sesi login berakhir. Silakan login kembali.")
          throw new Error("Gagal menyambung ke server.")
        }

        const statsResult = await statsRes.json()
        const notifyResult = await notifyRes.json()

        if (statsResult.success) {
          setStatsData(statsResult.data)
        }
        
        if (notifyResult.success) {
          setUnreadCount(notifyResult.data.total_unread)
        }

        setError(null)
      } catch (err: any) {
        console.error("Dashboard Error:", err.message)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  const stats = [
    { title: "Total Users", value: statsData.total_users, description: "Pengguna terdaftar", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "News Articles", value: statsData.total_news, description: "Berita diterbitkan", icon: FileText, color: "text-green-600", bg: "bg-green-50" },
    { title: "Active Courses", value: statsData.active_courses, description: "Kursus aktif", icon: GraduationCap, color: "text-purple-600", bg: "bg-purple-50" },
    { title: "Gallery Items", value: statsData.total_gallery, description: "Foto diunggah", icon: ImageIcon, color: "text-orange-600", bg: "bg-orange-50" },
  ]

  return (
    <div className="space-y-8 p-2">
      {/* ERROR ALERT */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl flex items-center gap-3 animate-in fade-in zoom-in duration-300">
          <AlertCircle size={20} />
          <p className="text-sm font-bold">{error}</p>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-zinc-900">
            Admin <span className="text-amber-500">Dashboard</span>
          </h1>
          <p className="text-zinc-500 font-medium tracking-tight">
            Data real-time: <span className="text-zinc-800">backend.mejatika.com</span>
          </p>
        </div>

        {/* NOTIFICATION BELL */}
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" className="rounded-full relative group bg-white shadow-sm">
            <Bell size={18} className="text-zinc-600 group-hover:rotate-12 transition-transform" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-rose-500 text-white text-[10px] font-black rounded-full border-2 border-white flex items-center justify-center animate-bounce">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-none shadow-sm hover:shadow-md transition-all group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-zinc-400">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bg} group-hover:scale-110 transition-transform`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-9 w-16 bg-zinc-100 animate-pulse rounded-lg" />
              ) : (
                <div className="text-3xl font-black italic text-zinc-900">{stat.value}</div>
              )}
              <p className="text-xs font-medium text-zinc-500 mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* RECENT ACTIVITIES */}
        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader className="bg-zinc-900 text-white">
            <CardTitle className="text-sm font-black uppercase italic tracking-widest">Recent Activities</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {loading ? (
                <div className="flex items-center gap-2 text-zinc-400">
                  <Loader2 className="animate-spin" /> 
                  <span className="text-xs font-bold">Syncing data...</span>
                </div>
              ) : statsData.recent_activities.length > 0 ? (
                statsData.recent_activities.map((activity: any, i: number) => (
                  <div key={i} className="flex items-start gap-4 group">
                    <div className={`mt-1.5 h-2 w-2 rounded-full ${activity.color} ring-4 ring-zinc-50 group-hover:scale-125 transition-transform`} />
                    <div className="flex-1 border-b border-zinc-50 pb-2">
                      <p className="text-sm font-bold text-zinc-800 tracking-tight">{activity.label}</p>
                      <p className="text-xs text-zinc-400 font-medium">{activity.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-zinc-400 italic">Tidak ada aktivitas terbaru.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* QUICK ACTIONS */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-black uppercase italic tracking-widest text-zinc-800">
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-3">
              {[
                { label: "Kelola Berita", icon: FileText, path: "/admin/news" },
                { label: "Kelola Kursus", icon: GraduationCap, path: "/admin/courses" },
                { label: "Manajemen User", icon: Users, path: "/admin/users" },
              ].map((action, i) => (
                <button 
                  key={i}
                  onClick={() => router.push(action.path)}
                  className="group flex items-center justify-between rounded-2xl border border-zinc-100 p-4 text-left hover:bg-zinc-900 hover:text-white transition-all transform hover:-translate-y-1"
                >
                  <div className="flex items-center gap-3">
                    <action.icon className="h-5 w-5 text-zinc-400 group-hover:text-amber-500" />
                    <span className="text-sm font-bold uppercase italic tracking-tight">{action.label}</span>
                  </div>
                  <div className="h-6 w-6 rounded-full bg-zinc-50 group-hover:bg-zinc-800 flex items-center justify-center transition-colors">
                    <span className="text-xs font-black group-hover:translate-x-0.5 transition-transform">→</span>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
