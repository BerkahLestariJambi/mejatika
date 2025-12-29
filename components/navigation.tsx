"use client"

import { useState, useEffect } from "react"
import { Menu, BookOpen, ChevronDown, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

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
    // Sesuaikan endpoint API dengan backend Anda
    fetch("https://backend.mejatika.com/api/menus")
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

  if (loading) {
    return (
      <nav className="sticky top-0 z-[100] bg-amber-600 h-16 flex items-center shadow-lg">
        <div className="container mx-auto max-w-6xl px-4">
           <div className="animate-pulse flex items-center gap-2">
              <div className="w-6 h-6 bg-white/20 rounded-full" />
              <div className="w-24 h-4 bg-white/20 rounded-md" />
           </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="sticky top-0 z-[100] w-full bg-amber-500 dark:bg-amber-600 shadow-xl border-b-2 border-amber-700/20 relative overflow-hidden">
      {/* LAPISAN BATIK OVERLAY */}
      <div 
        className="absolute inset-0 opacity-25 mix-blend-overlay pointer-events-none" 
        style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/batik-fractal.png')` }}
      />

      <div className="container mx-auto max-w-6xl px-4 relative z-10">
        <div className="flex items-center justify-between md:grid md:grid-cols-3 h-16">
          
          {/* KOLOM 1: LOGO */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="p-1.5 bg-white/10 rounded-lg backdrop-blur-sm group-hover:bg-white/20 transition-all">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="font-black text-xl tracking-tighter italic text-white drop-shadow-sm">
                MEJATIKA
              </span>
            </Link>
          </div>

          {/* KOLOM 2: DESKTOP MENU (Tengah) */}
          <div className="hidden md:flex items-center justify-center gap-1">
            {menuItems.map((item) =>
              item.subMenus && item.subMenus.length > 0 ? (
                <div key={item.id} className="relative group">
                  <button className="flex items-center gap-1 px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-white/90 hover:text-white hover:bg-white/10 rounded-full transition-all">
                    {item.title}
                    <ChevronDown className="w-3 h-3 opacity-60 group-hover:rotate-180 transition-transform" />
                  </button>
                  
                  {/* Dropdown Menu yang Selaras dengan Tema */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 w-48 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 rounded-xl shadow-2xl border border-amber-100 dark:border-zinc-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2 z-50 overflow-hidden">
                    <div className="py-2 flex flex-col">
                      {item.subMenus.map((sub) => (
                        <Link
                          key={sub.id}
                          href={sub.url}
                          className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-zinc-900 transition-colors"
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
                  className="px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-white/90 hover:text-white hover:bg-white/10 rounded-full transition-all"
                >
                  {item.title}
                </Link>
              ),
            )}
          </div>

          {/* KOLOM 3: SEARCH / RIGHT ICON */}
          <div className="hidden md:flex justify-end items-center">
             <div className="text-[9px] font-black text-white/50 uppercase tracking-[0.3em] border border-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
               Digital Scroll
             </div>
          </div>

          {/* MOBILE TOGGLE */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] bg-amber-600 border-amber-500 p-0 text-white">
                <div className="h-full flex flex-col">
                   <div className="p-6 border-b border-white/10 flex justify-between items-center">
                      <span className="font-black italic tracking-tighter text-xl">MEJATIKA</span>
                   </div>
                   
                   <div className="flex-grow overflow-y-auto p-4 flex flex-col gap-2">
                    {menuItems.map((item) => (
                      <div key={item.id} className="space-y-1">
                        <Link
                          href={item.url}
                          className="flex items-center justify-between px-4 py-3 text-sm font-black uppercase tracking-widest bg-white/5 rounded-xl border border-white/5"
                          onClick={() => !item.subMenus?.length && setIsOpen(false)}
                        >
                          {item.title}
                        </Link>
                        {item.subMenus && item.subMenus.length > 0 && (
                          <div className="ml-4 flex flex-col border-l-2 border-white/10 pl-2">
                            {item.subMenus.map((sub) => (
                              <Link
                                key={sub.id}
                                href={sub.url}
                                className="px-4 py-2 text-xs font-bold text-white/70 uppercase tracking-widest hover:text-white transition-colors"
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
                </div>
              </SheetContent>
            </Sheet>
          </div>

        </div>
      </div>
    </nav>
  )
}
