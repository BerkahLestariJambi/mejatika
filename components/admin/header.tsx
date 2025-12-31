"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation" // Untuk redirect setelah logout
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
import { Bell, LogOut, Settings, User } from "lucide-react"
import Swal from "sweetalert2"

export function AdminHeader() {
  const router = useRouter()
  const [adminName, setAdminName] = useState("Admin")

  // Ambil data user dari localStorage saat komponen dimuat
  useEffect(() => {
    const user = localStorage.getItem("user")
    if (user) {
      try {
        const userData = JSON.parse(user)
        setAdminName(userData.name || "Admin")
      } catch (e) {
        console.error("Gagal parsing data user")
      }
    }
  }, [])

  // Fungsi Logout
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
        router.push("/login") // Redirect ke halaman login
      }
    })
  }

  return (
    <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        <div className="flex-1">
           {/* Anda bisa menambahkan Breadcrumbs di sini nanti */}
           <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Panel Dashboard</span>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-amber-500"></span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-3 px-2 hover:bg-zinc-100 rounded-full">
                <div className="flex flex-col items-end hidden md:flex">
                  <span className="text-sm font-bold leading-none">{adminName}</span>
                  <span className="text-[10px] text-zinc-500 font-medium">Administrator</span>
                </div>
                <Avatar className="h-9 w-9 border-2 border-amber-100">
                  <AvatarImage src={`https://ui-avatars.com/api/?name=${adminName}&background=f59e0b&color=fff`} />
                  <AvatarFallback className="bg-amber-500 text-white">AD</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-xl border-zinc-100">
              <DropdownMenuLabel className="font-bold px-3 py-2">Akun Saya</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuItem className="rounded-xl cursor-pointer">
                <User className="mr-2 h-4 w-4 text-zinc-400" />
                <span>Profil</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem className="rounded-xl cursor-pointer">
                <Settings className="mr-2 h-4 w-4 text-zinc-400" />
                <span>Pengaturan</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={handleLogout}
                className="text-red-600 rounded-xl cursor-pointer focus:bg-red-50 focus:text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span className="font-bold uppercase text-xs italic">Keluar Sesi</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
