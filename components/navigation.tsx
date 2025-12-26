"use client"

import { useState, useEffect } from "react"
import { Menu, BookOpen, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import Link from "next/link"

interface SubMenu {
  id: string
  title: string
  url: string
}

interface MenuItem {
  id: string
  title: string
  url: string
  subMenus: SubMenu[]
}

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/menus")
      .then((res) => res.json())
      .then((data) => {
        setMenuItems(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error("Failed to load menus:", error)
        setLoading(false)
      })
  }, [])

  // Loading State yang tetap terpusat
  if (loading) {
    return (
      <nav className="sticky top-0 z-40 bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <BookOpen className="w-6 h-6" />
              <span className="font-bold text-lg tracking-tighter italic">MEJATIKA</span>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="sticky top-0 z-40 bg-primary text-primary-foreground shadow-md">
      {/* Container max-w-6xl agar sejajar dengan konten utama di HomePage */}
      <div className="container mx-auto max-w-6xl px-4">
        
        {/* h-16 memberikan ruang yang lebih nyaman */}
        <div className="flex items-center justify-between md:grid md:grid-cols-3 h-16">
          
          {/* KOLOM 1: LOGO (Kiri) */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <BookOpen className="w-6 h-6 transition-transform group-hover:scale-110" />
              <span className="font-bold text-xl tracking-tighter italic">MEJATIKA</span>
            </Link>
          </div>

          {/* KOLOM 2: DESKTOP MENU (Tengah - Presisi) */}
          <div className="hidden md:flex items-center justify-center gap-2">
            {menuItems.map((item) =>
              item.subMenus && item.subMenus.length > 0 ? (
                <div key={item.id} className="relative group">
                  <button className="flex items-center gap-1 px-4 py-2 text-sm font-bold uppercase tracking-widest hover:bg-white/10 rounded-full transition-all">
                    {item.title}
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-48 bg-card text-card-foreground rounded-xl shadow-xl border border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-2">
                      {item.subMenus.map((sub) => (
                        <Link
                          key={sub.id}
                          href={sub.url}
                          className="block px-4 py-2.5 text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
                        >
                          {sub.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={item.id}
                  href={item.url}
                  className="px-4 py-2 text-sm font-bold uppercase tracking-widest hover:bg-white/10 rounded-full transition-all border-b-2 border-transparent hover:border-white/20"
                >
                  {item.title}
                </Link>
              ),
            )}
          </div>

          {/* KOLOM 3: SPACER / ACTION (Kanan) */}
          <div className="hidden md:flex justify-end items-center">
             {/* Spacer agar Kolom 2 tetap berada di tengah monitor */}
             <div className="w-10 h-10" /> 
          </div>

          {/* MOBILE TOGGLE (Hanya muncul di Mobile) */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-white/10">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] bg-primary text-primary-foreground border-primary">
                <div className="flex flex-col gap-4 mt-12">
                  {menuItems.map((item) => (
                    <div key={item.id} className="border-b border-white/10 pb-2">
                      <Link
                        href={item.url}
                        className="block px-3 py-2 text-lg font-bold uppercase tracking-wider"
                        onClick={() => !item.subMenus?.length && setIsOpen(false)}
                      >
                        {item.title}
                      </Link>
                      {item.subMenus && item.subMenus.length > 0 && (
                        <div className="ml-4 mt-1 flex flex-col gap-1">
                          {item.subMenus.map((sub) => (
                            <Link
                              key={sub.id}
                              href={sub.url}
                              className="block px-3 py-2 text-sm text-white/70 hover:text-white"
                              onClick={() => setIsOpen(false)}
                            >
                              {sub.title}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>

        </div>
      </div>
    </nav>
  )
}
