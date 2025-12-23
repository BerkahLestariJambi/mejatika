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
} from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Menus", href: "/admin/menus", icon: MenuIcon },
  { name: "News", href: "/admin/news", icon: FileText },
  { name: "Categories", href: "/admin/categories", icon: Folder },
  { name: "Courses", href: "/admin/courses", icon: GraduationCap },
  { name: "Schedules", href: "/admin/schedules", icon: Calendar },
  { name: "Registrations", href: "/admin/registrations", icon: Award },
  { name: "Materials", href: "/admin/materials", icon: FileText },
  { name: "Certificates", href: "/admin/certificates", icon: Award },
  { name: "Gallery", href: "/admin/gallery", icon: ImageIcon },
  { name: "Downloads", href: "/admin/downloads", icon: Download },
  { name: "Settings", href: "/admin/settings", icon: Settings },
]

function SidebarContent() {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-4">
        <h2 className="text-lg font-bold">MEJATIKA Admin</h2>
        <p className="text-xs text-muted-foreground">Admin Panel</p>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          )
        })}
      </nav>
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
            <Button variant="ghost" size="icon" className="fixed left-4 top-4 z-40">
              <MenuIcon className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r bg-background lg:block">
        <SidebarContent />
      </aside>
    </>
  )
}
