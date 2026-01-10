"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Users, 
  FileText, 
  GraduationCap, 
  ImageIcon, 
  Settings, 
  LogOut,
  Bell,
  Search
} from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AdminDashboard() {
  const router = useRouter()

  // Fungsi untuk Logout
  const handleLogout = () => {
    const confirmLogout = confirm("Apakah Anda yakin ingin keluar dari sistem?")
    if (confirmLogout) {
      // 1. Hapus data autentikasi dari browser
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      
      // 2. Arahkan ke halaman login
      router.push("/login")
    }
  }

  const stats = [
    {
      title: "Total Users",
      value: "342",
      description: "Pengguna aktif",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      title: "News Articles",
      value: "128",
      description: "Artikel diterbitkan",
      icon: FileText,
      color: "text-green-600",
      bg: "bg-green-50"
    },
    {
      title: "Active Courses",
      value: "24",
      description: "Kursus berjalan",
      icon: GraduationCap,
      color: "text-purple-600",
      bg: "bg-purple-50"
    },
    {
      title: "Gallery Items",
      value: "89",
      description: "Foto diunggah",
      icon: ImageIcon,
      color: "text-orange-600",
      bg: "bg-orange-50"
    },
  ]

  return (
    <div className="space-y-8 p-2">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-zinc-900">
            Admin <span className="text-amber-500">Dashboard</span>
          </h1>
          <p className="text-zinc-500 font-medium">Selamat datang kembali di panel kendali MEJATIKA.</p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" className="rounded-full">
            <Bell size={18} />
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleLogout}
            className="rounded-xl font-bold uppercase text-xs tracking-widest gap-2 shadow-lg shadow-rose-100"
          >
            <LogOut size={16} />
            Logout
          </Button>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-zinc-400">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black italic text-zinc-900">{stat.value}</div>
              <p className="text-xs font-medium text-zinc-500 mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* RECENT ACTIVITIES */}
        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader className="bg-zinc-900 text-white">
            <CardTitle className="text-sm font-black uppercase italic tracking-widest">Recent Activities</CardTitle>
            <CardDescription className="text-zinc-400">Aktivitas sistem terbaru</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {[
                { label: "User baru terdaftar", time: "2 menit yang lalu", color: "bg-green-500" },
                { label: "Artikel berita diterbitkan", time: "15 menit yang lalu", color: "bg-blue-500" },
                { label: "Pendaftaran kursus baru", time: "1 jam yang lalu", color: "bg-purple-500" },
              ].map((activity, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className={`mt-1.5 h-2 w-2 rounded-full ${activity.color} ring-4 ring-zinc-50`} />
                  <div className="flex-1 border-b border-zinc-50 pb-2">
                    <p className="text-sm font-bold text-zinc-800">{activity.label}</p>
                    <p className="text-xs text-zinc-400">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* QUICK ACTIONS */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-black uppercase italic tracking-widest text-zinc-800">Quick Actions</CardTitle>
            <CardDescription>Tugas administratif umum</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-3">
              <button className="group flex items-center justify-between rounded-2xl border border-zinc-100 p-4 text-left hover:bg-zinc-900 hover:text-white transition-all">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-zinc-400 group-hover:text-amber-500" />
                  <span className="text-sm font-bold uppercase italic tracking-tight">Buat Berita Baru</span>
                </div>
                <div className="h-6 w-6 rounded-full bg-zinc-50 group-hover:bg-zinc-800 flex items-center justify-center">
                  <span className="text-xs">→</span>
                </div>
              </button>

              <button className="group flex items-center justify-between rounded-2xl border border-zinc-100 p-4 text-left hover:bg-zinc-900 hover:text-white transition-all">
                <div className="flex items-center gap-3">
                  <GraduationCap className="h-5 w-5 text-zinc-400 group-hover:text-amber-500" />
                  <span className="text-sm font-bold uppercase italic tracking-tight">Tambah Kursus Baru</span>
                </div>
                <div className="h-6 w-6 rounded-full bg-zinc-50 group-hover:bg-zinc-800 flex items-center justify-center">
                  <span className="text-xs">→</span>
                </div>
              </button>

              <button className="group flex items-center justify-between rounded-2xl border border-zinc-100 p-4 text-left hover:bg-zinc-900 hover:text-white transition-all">
                <div className="flex items-center gap-3">
                  <Settings className="h-5 w-5 text-zinc-400 group-hover:text-amber-500" />
                  <span className="text-sm font-bold uppercase italic tracking-tight">Pengaturan Sistem</span>
                </div>
                <div className="h-6 w-6 rounded-full bg-zinc-50 group-hover:bg-zinc-800 flex items-center justify-center">
                  <span className="text-xs">→</span>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
