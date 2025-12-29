"use client"

import { useState, useEffect } from "react"
import { Menu, BookOpen, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import Link from "next/link"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [menuItems, setMenuItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Pastikan menggunakan parameter ?type=nav untuk mendapatkan data nested dari controller Anda
    fetch("https://backend.mejatika.com/api/menus?type=nav")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setMenuItems(data);
      })
      .catch((err) => console.error("Error:", err))
      .finally(() => setLoading(false));
  }, [])

  if (loading) return <nav className="h-16 bg-amber-600 animate-pulse w-full" />;

  return (
    <nav className="sticky top-0 z-[100] w-full bg-amber-500 shadow-xl border-b-2 border-amber-700/20">
      <div className="absolute inset-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/batik-fractal.png')` }} />
      
      <div className="container mx-auto max-w-6xl px-4 relative z-10">
        <div className="flex items-center h-16">
          
          {/* LOGO - Tetap di Kiri */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <BookOpen className="w-6 h-6 text-white" />
            <span className="font-black text-xl italic text-white">MEJATIKA</span>
          </Link>

          {/* DESKTOP MENU - Dipusatkan dengan flex-1 dan justify-center */}
          <div className="hidden md:flex flex-1 justify-center items-center gap-1">
            {menuItems.map((item) => (
              <div key={item.id} className="relative group px-1">
                {/* Cek sub_menus sesuai relasi di Controller */}
                {item.sub_menus && item.sub_menus.length > 0 ? (
                  <div className="flex flex-col items-center">
                    <button className="flex items-center gap-1 px-4 py-2 text-[11px] font-black uppercase text-white hover:bg-white/20 rounded-full transition-all">
                      {item.name} <ChevronDown className="w-3 h-3 opacity-70 group-hover:rotate-180 transition-transform" />
                    </button>
                    
                    {/* DROPDOWN - Muncul saat group di-hover */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[110]">
                      <div className="bg-white shadow-2xl rounded-xl py-2 min-w-[180px] border border-amber-100 overflow-hidden">
                        {item.sub_menus.map((sub: any) => (
                          <Link 
                            key={sub.id} 
                            href={`/${sub.slug}`} 
                            className="block px-5 py-2.5 text-[10px] font-bold text-zinc-700 hover:bg-amber-50 hover:text-amber-600 transition-colors uppercase"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link 
                    href={`/${item.slug}`} 
                    className="px-4 py-2 text-[11px] font-black uppercase text-white hover:bg-white/20 rounded-full transition-all"
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* MOBILE TOGGLE - Tetap di Kanan */}
          <div className="md:hidden ml-auto">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" className="text-white hover:bg-white/20"><Menu /></Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-amber-600 text-white border-none">
                <div className="flex flex-col gap-2 mt-10">
                  {menuItems.map((item) => (
                    <div key={item.id} className="flex flex-col">
                      <Link 
                        href={`/${item.slug}`} 
                        onClick={() => setIsOpen(false)} 
                        className="px-4 py-3 font-black uppercase text-sm hover:bg-white/10 rounded-lg"
                      >
                        {item.name}
                      </Link>
                      {item.sub_menus && item.sub_menus.length > 0 && (
                        <div className="ml-6 flex flex-col border-l border-white/20">
                          {item.sub_menus.map((sub: any) => (
                            <Link 
                              key={sub.id} 
                              href={`/${sub.slug}`} 
                              onClick={() => setIsOpen(false)}
                              className="px-6 py-2 text-xs font-bold uppercase opacity-80 hover:opacity-100"
                            >
                              {sub.name}
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
