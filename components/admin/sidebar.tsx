"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  FileText,
  GraduationCap,
  ImageIcon,
  Download,
  Settings,
  MenuIcon,
  Calendar,
  Award,
  Folder,
  ClipboardCheck,
} from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Menus", href: "/admin/menus", icon: MenuIcon },
  { name: "Sliders", href: "/admin/sliders", icon: ImageIcon },
  { name: "News", href: "/admin/news", icon: FileText },
  { name: "Categories", href: "/admin/categories", icon: Folder },
  { name: "Courses", href: "/admin/courses", icon: GraduationCap },
  { name: "Schedules", href: "/admin/schedules", icon: Calendar },
  { name: "Registrations", href: "/admin/registrations", icon: Award },
  { name: "Mentor Kursus", href: "/admin/mentor-approval", icon: ClipboardCheck },
  { name: "Materials", href: "/admin/materials", icon: FileText },
  { name: "Submissions", href: "/admin/submissions", icon: FileText },
  { name: "Certificates", href: "/admin/certificates", icon: Award },
  { name: "Gallery", href: "/admin/gallery", icon: ImageIcon },
  { name: "Downloads", href: "/admin/downloads", icon: Download },
  { name: "Settings", href: "/admin/settings", icon: Settings },
]

function SidebarContent() {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col bg-zinc-50/50">
      {/* HEADER SIDEBAR - Tetap Diam (Sticky) */}
      <div className="border-b bg-white p-6">
        <h2 className="text-xl font-black italic uppercase tracking-tighter text-zinc-900">
          MEJATIKA <span className="text-amber-500">Admin</span>
        </h2>
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 italic">
          Control Center v2.0
        </p>
      </div>

      {/* NAVIGASI - Bisa Di-scroll ke Atas/Bawah */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-1 custom-scrollbar">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-200 uppercase italic tracking-tight",
                isActive
                  ? "bg-zinc-900 text-white shadow-lg shadow-zinc-200 translate-x-1"
                  : "text-zinc-500 hover:bg-white hover:text-zinc-900 hover:shadow-sm"
              )}
            >
              <item.icon className={cn(
                "h-4 w-4 transition-transform group-hover:scale-110",
                isActive ? "text-amber-500" : "text-zinc-400"
              )} />
              {item.name}
              {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-amber-500" />}
            </Link>
          )
        })}
      </nav>

      {/* FOOTER SIDEBAR - Opsional (Sticky di bawah) */}
      <div className="border-t p-4 bg-white/50">
        <p className="text-[10px] text-center font-bold text-zinc-400 uppercase tracking-widest">
          © 2026 Mejatika Dev
        </p>
      </div>

      {/* CSS KHUSUS UNTUK SCROLLBAR TIPIS */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e4e4e7;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d4d4d8;
        }
      `}</style>
    </div>
  )
}

export function AdminSidebar() {
  return (
    <>
      {/* Mobile sidebar */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="fixed left-4 top-3.5 z-50 rounded-full shadow-md bg-white">
              <MenuIcon className="h-5 w-5 text-zinc-600" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 border-r-0">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r bg-white lg:block">
        <SidebarContent />
      </aside>
    </>
  )
}
