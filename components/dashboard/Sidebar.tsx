"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  UserCircle, 
  BookPlus, 
  LogOut, 
  Home,
  ChevronRight
} from "lucide-react"
import { cn } from "@/lib/utils" // Pastikan ada utility shadcn cn

export default function DashboardSidebar() {
  const pathname = usePathname()

  const menuItems = [
    {
      title: "Main Dashboard",
      href: "/dashboard/mentor",
      icon: LayoutDashboard,
    },
    {
      title: "Profil Pengajar",
      href: "/dashboard/mentor/profile",
      icon: UserCircle,
    },
    {
      title: "Lamar Mengajar",
      href: "/dashboard/mentor/apply-course",
      icon: BookPlus,
    },
  ]

  return (
    <div className="w-72 bg-white border-r border-zinc-100 flex flex-col h-screen sticky top-0">
      <div className="p-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-white font-black italic">M</div>
          <span className="text-xl font-black uppercase italic tracking-tighter">Meja<span className="text-amber-500">tika</span></span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4">Mentor Menu</p>
        
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-4 py-4 rounded-2xl transition-all duration-200 group",
                isActive 
                  ? "bg-zinc-900 text-white shadow-lg shadow-zinc-200" 
                  : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon size={20} className={isActive ? "text-amber-500" : "group-hover:text-amber-500"} />
                <span className="text-xs font-black uppercase tracking-widest">{item.title}</span>
              </div>
              {isActive && <ChevronRight size={14} className="text-amber-500" />}
            </Link>
          )
        })}
      </nav>

      <div className="p-6 border-t border-zinc-50 mt-auto">
        <Link href="/">
           <Button variant="ghost" className="w-full justify-start rounded-xl text-zinc-500 font-bold hover:text-amber-600">
              <Home size={18} className="mr-2" /> Kembali ke Web
           </Button>
        </Link>
        <Button 
          variant="ghost" 
          className="w-full justify-start rounded-xl text-red-500 font-bold hover:bg-red-50 hover:text-red-600 mt-2"
          onClick={() => {
            localStorage.clear()
            window.location.href = "/login"
          }}
        >
          <LogOut size={18} className="mr-2" /> Logout
        </Button>
      </div>
    </div>
  )
}

function Button({ children, variant, className, onClick }: any) {
  const variants: any = {
    ghost: "bg-transparent hover:bg-zinc-50",
  }
  return (
    <button onClick={onClick} className={cn("flex items-center px-4 py-2 text-sm transition-colors", variants[variant], className)}>
      {children}
    </button>
  )
}
