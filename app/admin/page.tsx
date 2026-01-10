"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Users, 
  FileText, 
  GraduationCap, 
  ImageIcon, 
  AlertCircle,
  ArrowRight,
  RefreshCw
} from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AdminDashboard() {
  const router = useRouter()
  
  // States
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [statsData, setStatsData] = useState({
    total_users: 0,
    total_news: 0,
    active_courses: 0,
    total_gallery: 0,
    recent_activities: []
  })

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
      }

      // Hanya fetch Stats, notifikasi sudah dihandle oleh AdminHeader
      const statsRes = await fetch(`https://backend.mejatika.com/api/admin/dashboard/stats`, { 
        headers, 
        cache: 'no-store' 
      })

      if (statsRes.status === 401) throw new Error("Sesi login berakhir.")
      
      const sJson = await statsRes.json()
      if (sJson.success) setStatsData(sJson.data)

      setError(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [router])

  const statsCards = [
    { title: "Total Users", value: statsData.total_users, description: "Pengguna terdaftar", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "News Articles", value: statsData.total_news, description: "Berita diterbitkan", icon: FileText, color: "text-green-600", bg: "bg-green-50" },
    { title: "Active Courses", value: statsData.active_courses, description: "Kursus aktif", icon: GraduationCap, color: "text-purple-600", bg: "bg-purple-50" },
    { title: "Gallery Items", value: statsData.total_gallery, description: "Foto diunggah", icon: ImageIcon, color: "text-orange-600", bg: "bg-orange-50" },
  ]

  return (
    <div className="space-y-8 p-4 max-w-7xl mx-auto">
      
      {/* ERROR ALERT */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl flex items-center gap-3 animate-bounce">
          <AlertCircle size={20} />
          <p className="text-sm font-bold">{error}</p>
          <Button variant="ghost" size="sm" onClick={fetchData} className="ml-auto text-rose-700 underline">Reload</Button>
        </div>
      )}

      {/* HEADER SECTION - Sekarang lebih simpel & bersih */}
      <div className="flex items-center justify-between border-b pb-6">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-zinc-900">
            Admin <span className="text-amber-500">Dashboard</span>
          </h1>
          <p className="text-zinc-500 text-sm font-medium">
            Real-time monitoring: <span className="text-zinc-800 font-bold tracking-tight">backend.mejatika.com</span>
          </p>
        </div>
        
        {/* Tombol Refresh Manual */}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchData} 
          disabled={loading}
          className="rounded-full font-bold uppercase text-[10px] tracking-widest italic"
        >
          <RefreshCw size={14} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
          Sync Data
        </Button>
      </div>

      {/* STATS CARDS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <Card key={stat.title} className="border-none shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">{stat.title}</CardTitle>
              <div className={`p-2 rounded-xl ${stat.bg} group-hover:rotate-12 transition-transform`}><stat.icon className={`h-5 w-5 ${stat.color}`} /></div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-10 w-24 bg-zinc-100 animate-pulse rounded-lg" />
              ) : (
                <div className="text-4xl font-black italic tracking-tighter text-zinc-900">{stat.value}</div>
              )}
              <p className="text-[11px] font-bold text-zinc-500 mt-2 uppercase italic">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* RECENT ACTIVITIES */}
        <Card className="lg:col-span-2 border-none shadow-sm overflow-hidden border-l-4 border-zinc-900">
          <CardHeader className="bg-zinc-900 text-white py-4 px-6 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-black uppercase italic tracking-[0.2em]">Live Stream Activity</CardTitle>
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" title="System Online" />
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="flex gap-4 animate-pulse">
                    <div className="h-10 w-10 bg-zinc-100 rounded-full" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-3 bg-zinc-100 rounded w-3/4" />
                      <div className="h-2 bg-zinc-50 rounded w-1/4" />
                    </div>
                  </div>
                ))
              ) : statsData.recent_activities && statsData.recent_activities.length > 0 ? (
                statsData.recent_activities.map((activity: any, i: number) => (
                  <div key={i} className="flex items-start gap-4 group">
                    <div className={`mt-1.5 h-3 w-3 rounded-full ${activity.color || 'bg-zinc-400'} ring-4 ring-zinc-50 group-hover:scale-125 transition-all`} />
                    <div className="flex-1 border-b border-zinc-50 pb-4">
                      <p className="text-sm font-black text-zinc-800 italic uppercase tracking-tight">{activity.label}</p>
                      <p className="text-[10px] text-zinc-400 font-bold uppercase">{activity.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-xs text-zinc-400 italic font-bold">LOG AKTIVITAS KOSONG</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* QUICK ACTIONS */}
        <Card className="border-none shadow-sm bg-zinc-50/50">
          <CardHeader>
            <CardTitle className="text-xs font-black uppercase italic tracking-[0.2em] text-zinc-800">
              Navigation Hub
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 py-2">
            <div className="grid gap-2">
              {[
                { label: "Berita", icon: FileText, path: "/admin/news", color: "hover:border-green-500" },
                { label: "Kursus", icon: GraduationCap, path: "/admin/courses", color: "hover:border-purple-500" },
                { label: "User", icon: Users, path: "/admin/users", color: "hover:border-blue-500" },
              ].map((action, i) => (
                <button 
                  key={i}
                  onClick={() => router.push(action.path)}
                  className={`group flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-4 text-left transition-all hover:shadow-md ${action.color}`}
                >
                  <div className="flex items-center gap-3">
                    <action.icon className="h-5 w-5 text-zinc-400 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-black uppercase italic">{action.label}</span>
                  </div>
                  <ArrowRight size={16} className="text-zinc-200 group-hover:text-zinc-900 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
