"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Bell, 
  LogOut, 
  Settings, 
  User, 
  Users, 
  FileText, 
  CheckCheck,
  BellOff
} from "lucide-react"
import Swal from "sweetalert2"

export function AdminHeader() {
  const router = useRouter()
  const [adminName, setAdminName] = useState("Admin")
  const [notifyData, setNotifyData] = useState({
    total_unread: 0,
    details: { new_users: 0, new_news: 0, new_registrations: 0 }
  })

  // 1. Fungsi ambil data notifikasi dari API
  const fetchNotif = async () => {
    const token = localStorage.getItem("token")
    if (!token) return
    try {
      const res = await fetch(`https://backend.mejatika.com/api/admin/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const json = await res.json()
      if (json.success) setNotifyData(json.data)
    } catch (err) {
      console.error("Gagal sinkron notifikasi")
    }
  }

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (user) {
      try {
        const userData = JSON.parse(user)
        setAdminName(userData.name || "Admin")
      } catch (e) { console.error("Error parsing user") }
    }

    fetchNotif()
    // Auto-refresh setiap 1 menit agar angka update otomatis
    const interval = setInterval(fetchNotif, 60000)
    return () => clearInterval(interval)
  }, [])

  // 2. Fungsi saat salah satu notif diklik (Angka berkurang)
  const handleReadItem = async (type: 'users' | 'news', targetUrl: string) => {
    const token = localStorage.getItem("token")
    
    // Kurangi angka di UI dulu biar cepet (Optimistic)
    setNotifyData(prev => ({
      ...prev,
      total_unread: Math.max(0, prev.total_unread - (type === 'users' ? prev.details.new_users : prev.details.new_news)),
      details: { ...prev.details, [type === 'users' ? 'new_users' : 'new_news']: 0 }
    }))

    router.push(targetUrl)

    // Kirim ke backend agar permanen
    try {
      await fetch(`https://backend.mejatika.com/api/admin/notifications/read`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      })
    } catch (e) { console.error("Gagal update status") }
  }

  // 3. Fungsi Tandai Semua Dibaca (Angka jadi 0)
  const markAllAsRead = async () => {
    const token = localStorage.getItem("token")
    setNotifyData({ total_unread: 0, details: { new_users: 0, new_news: 0, new_registrations: 0 } })
    
    try {
      await fetch(`https://backend.mejatika.com/api/admin/notifications/mark-all`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
    } catch (e) { console.error("Gagal mark all") }
  }

  const handleLogout = () => {
    Swal.fire({
      title: "Logout?",
      text: "Sesi admin akan diakhiri.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#f59e0b",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Ya, Keluar!",
      cancelButtonText: "Batal"
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        router.push("/login")
      }
    })
  }

  return (
    <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        
        {/* Sisi Kiri: Label */}
        <div className="flex-1">
           <span className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 italic">
             Mejatika <span className="text-amber-500 font-black text-sm">Panel</span>
           </span>
        </div>

        <div className="flex items-center gap-2 md:gap-5">
          
          {/* --- DROPDOWN NOTIFIKASI --- */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative hover:bg-zinc-100 rounded-full h-10 w-10 transition-all">
                <Bell className={`h-5 w-5 ${notifyData.total_unread > 0 ? 'text-amber-500 animate-swing' : 'text-zinc-400'}`} />
                {notifyData.total_unread > 0 && (
                  <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white border-2 border-white shadow-sm">
                    {notifyData.total_unread > 9 ? '9+' : notifyData.total_unread}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-80 rounded-3xl p-2 shadow-2xl border-zinc-100 animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-between px-3 py-2">
                <DropdownMenuLabel className="font-black text-[10px] uppercase tracking-widest text-zinc-400 italic">
                  Notifikasi
                </DropdownMenuLabel>
                {notifyData.total_unread > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="flex items-center gap-1 text-[10px] font-bold text-amber-600 hover:text-amber-700 transition-colors uppercase"
                  >
                    <CheckCheck size={12} /> Bersihkan
                  </button>
                )}
              </div>
              <DropdownMenuSeparator />
              
              <div className="max-h-[300px] overflow-y-auto">
                {/* Notif User Baru */}
                <DropdownMenuItem 
                  onClick={() => handleReadItem('users', '/admin/users')}
                  className="rounded-2xl cursor-pointer p-4 focus:bg-zinc-50 flex justify-between items-center group mb-1"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-blue-50 rounded-xl group-hover:scale-110 transition-transform"><Users className="h-5 w-5 text-blue-600" /></div>
                    <div className="flex flex-col">
                      <span className="text-sm font-black italic text-zinc-800 uppercase leading-none mb-1">Pendaftaran</span>
                      <span className="text-[10px] font-medium text-zinc-400">Ada pengguna baru terdaftar</span>
                    </div>
                  </div>
                  {notifyData.details.new_users > 0 && (
                    <span className="h-6 w-6 flex items-center justify-center bg-zinc-900 text-white rounded-full text-[10px] font-black italic">
                      {notifyData.details.new_users}
                    </span>
                  )}
                </DropdownMenuItem>

                {/* Notif Berita Baru */}
                <DropdownMenuItem 
                  onClick={() => handleReadItem('news', '/admin/news')}
                  className="rounded-2xl cursor-pointer p-4 focus:bg-zinc-50 flex justify-between items-center group"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-green-50 rounded-xl group-hover:scale-110 transition-transform"><FileText className="h-5 w-5 text-green-600" /></div>
                    <div className="flex flex-col">
                      <span className="text-sm font-black italic text-zinc-800 uppercase leading-none mb-1">Berita/News</span>
                      <span className="text-[10px] font-medium text-zinc-400">Update artikel berita terbaru</span>
                    </div>
                  </div>
                  {notifyData.details.new_news > 0 && (
                    <span className="h-6 w-6 flex items-center justify-center bg-zinc-900 text-white rounded-full text-[10px] font-black italic">
                      {notifyData.details.new_news}
                    </span>
                  )}
                </DropdownMenuItem>
              </div>

              {notifyData.total_unread === 0 && (
                <div className="py-10 flex flex-col items-center justify-center gap-2 opacity-40">
                  <BellOff size={24} className="text-zinc-300" />
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest italic">Tidak ada notifikasi</p>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* --- DROPDOWN PROFIL ADMIN --- */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-3 px-1 md:px-2 hover:bg-zinc-100 rounded-full transition-all group">
                <div className="flex flex-col items-end hidden md:flex">
                  <span className="text-sm font-black leading-none italic tracking-tighter text-zinc-800 group-hover:text-amber-500 transition-colors">
                    {adminName}
                  </span>
                  <span className="text-[9px] text-zinc-400 font-black uppercase tracking-widest italic">Admin</span>
                </div>
                <Avatar className="h-10 w-10 border-2 border-amber-100 group-hover:border-amber-400 transition-all shadow-sm">
                  <AvatarImage src={`https://ui-avatars.com/api/?name=${adminName}&background=f59e0b&color=fff&bold=true`} />
                  <AvatarFallback className="bg-amber-500 text-white font-bold text-xs">AD</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-60 rounded-3xl p-2 shadow-2xl border-zinc-100 mt-1">
              <DropdownMenuLabel className="font-black px-4 py-3 text-[10px] uppercase italic tracking-[0.2em] text-zinc-400">
                Menu Akun
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuItem className="rounded-2xl cursor-pointer py-3 px-4 focus:bg-zinc-50 group">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
                  <span className="text-sm font-bold text-zinc-700 italic">Profil Saya</span>
                </div>
              </DropdownMenuItem>
              
              <DropdownMenuItem className="rounded-2xl cursor-pointer py-3 px-4 focus:bg-zinc-50 group">
                <div className="flex items-center gap-3">
                  <Settings className="h-4 w-4 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
                  <span className="text-sm font-bold text-zinc-700 italic">Pengaturan Sistem</span>
                </div>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={handleLogout}
                className="text-rose-600 rounded-2xl cursor-pointer focus:bg-rose-50 focus:text-rose-600 py-3 px-4 transition-all"
              >
                <div className="flex items-center gap-3 w-full">
                  <LogOut className="h-4 w-4" />
                  <span className="font-black uppercase text-[10px] italic tracking-widest">Logout Sesi</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </div>
      
      {/* CSS untuk Animasi Goyang Bell */}
      <style jsx global>{`
        @keyframes swing {
          0% { transform: rotate(0deg); }
          20% { transform: rotate(15deg); }
          40% { transform: rotate(-10deg); }
          60% { transform: rotate(5deg); }
          80% { transform: rotate(-5deg); }
          100% { transform: rotate(0deg); }
        }
        .animate-swing {
          animation: swing 1s ease-in-out infinite;
          transform-origin: top center;
        }
      `}</style>
    </header>
  )
}
