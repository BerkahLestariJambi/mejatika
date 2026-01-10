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
import { Bell, LogOut, Settings, User, Users, FileText, ArrowRight } from "lucide-react"
import Swal from "sweetalert2"

export function AdminHeader() {
  const router = useRouter()
  const [adminName, setAdminName] = useState("Admin")
  
  // State baru untuk Notifikasi
  const [notifyData, setNotifyData] = useState({
    total_unread: 0,
    details: { new_users: 0, new_news: 0, new_registrations: 0 }
  })

  // 1. Ambil data user & Notifikasi saat dimuat
  useEffect(() => {
    const user = localStorage.getItem("user")
    const token = localStorage.getItem("token")

    if (user) {
      try {
        const userData = JSON.parse(user)
        setAdminName(userData.name || "Admin")
      } catch (e) {
        console.error("Gagal parsing data user")
      }
    }

    // Ambil Data Notifikasi dari API
    const fetchNotif = async () => {
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

    fetchNotif()
    const interval = setInterval(fetchNotif, 60000) // Cek tiap 1 menit
    return () => clearInterval(interval)
  }, [])

  const handleLogout = () => {
    Swal.fire({
      title: "Logout?",
      text: "Anda akan keluar dari sesi admin.",
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
    <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        <div className="flex-1">
           <span className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 italic">
             Panel <span className="text-amber-500 font-black">Management</span>
           </span>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          
          {/* --- TOMBOL BELL YANG SUDAH DIHIDUPKAN --- */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative hover:bg-zinc-100 rounded-full transition-all">
                <Bell className={`h-5 w-5 ${notifyData.total_unread > 0 ? 'text-amber-500' : 'text-zinc-500'}`} />
                {notifyData.total_unread > 0 && (
                  <span className="absolute top-2 right-2 flex h-2.5 w-2.5 rounded-full bg-rose-500 border-2 border-white animate-pulse"></span>
                )}
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-72 rounded-2xl p-2 shadow-2xl border-zinc-100 animate-in fade-in zoom-in duration-200">
              <DropdownMenuLabel className="font-black text-[10px] uppercase tracking-widest text-zinc-400 px-3 py-2 italic">
                Pemberitahuan Terbaru
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {/* Notif User Baru */}
              <DropdownMenuItem 
                onClick={() => router.push('/admin/users')}
                className="rounded-xl cursor-pointer p-3 focus:bg-zinc-50 flex justify-between items-center"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg"><Users className="h-4 w-4 text-blue-600" /></div>
                  <span className="text-xs font-bold text-zinc-700">Pendaftaran User</span>
                </div>
                <span className="bg-zinc-100 px-2 py-0.5 rounded text-[10px] font-black">{notifyData.details.new_users}</span>
              </DropdownMenuItem>

              {/* Notif Berita Baru */}
              <DropdownMenuItem 
                onClick={() => router.push('/admin/news')}
                className="rounded-xl cursor-pointer p-3 focus:bg-zinc-50 flex justify-between items-center"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-lg"><FileText className="h-4 w-4 text-green-600" /></div>
                  <span className="text-xs font-bold text-zinc-600">Update Berita</span>
                </div>
                <span className="bg-zinc-100 px-2 py-0.5 rounded text-[10px] font-black">{notifyData.details.new_news}</span>
              </DropdownMenuItem>

              {notifyData.total_unread === 0 && (
                <div className="py-6 text-center">
                  <p className="text-[10px] font-bold text-zinc-300 italic uppercase">Semua data up to date</p>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* --- DROPDOWN ADMIN PROFIL --- */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-3 px-2 hover:bg-zinc-100 rounded-full transition-all">
                <div className="flex flex-col items-end hidden md:flex">
                  <span className="text-sm font-black leading-none italic tracking-tighter">{adminName}</span>
                  <span className="text-[9px] text-zinc-400 font-black uppercase tracking-tighter">Administrator</span>
                </div>
                <Avatar className="h-9 w-9 border-2 border-amber-100 shadow-sm">
                  <AvatarImage src={`https://ui-avatars.com/api/?name=${adminName}&background=f59e0b&color=fff&bold=true`} />
                  <AvatarFallback className="bg-amber-500 text-white font-bold">AD</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-xl border-zinc-100">
              <DropdownMenuLabel className="font-black px-3 py-2 text-xs uppercase italic tracking-widest text-zinc-400">Pengaturan Akun</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuItem className="rounded-xl cursor-pointer py-2.5">
                <User className="mr-2 h-4 w-4 text-zinc-400" />
                <span className="text-sm font-bold tracking-tight">Profil Saya</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem className="rounded-xl cursor-pointer py-2.5">
                <Settings className="mr-2 h-4 w-4 text-zinc-400" />
                <span className="text-sm font-bold tracking-tight">System Settings</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={handleLogout}
                className="text-red-600 rounded-xl cursor-pointer focus:bg-red-50 focus:text-red-600 py-2.5"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span className="font-black uppercase text-[10px] italic tracking-[0.1em]">Keluar Sesi</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
