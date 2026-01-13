"use client"

import { useState, useEffect } from "react"
import { Menu, BookOpen, ChevronDown, Phone, Mail, Globe, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import Link from "next/link"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [menuItems, setMenuItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedMenu, setExpandedMenu] = useState<number | null>(null)

  useEffect(() => {
    // Mengambil data menu dari API
    fetch("https://backend.mejatika.com/api/menus?type=nav")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setMenuItems(data);
      })
      .catch((err) => console.error("Error:", err))
      .finally(() => setLoading(false));
  }, [])

  // Skeleton Loading saat data belum muncul
  if (loading) return <nav className="h-16 bg-zinc-950 w-full fixed top-0 z-[9999]" />;

  return (
    /* HEADER UTAMA: Tetap muncul di atas (Sticky) dengan Z-index tertinggi */
    <header className="sticky top-0 left-0 right-0 z-[9999] w-full bg-zinc-950/90 backdrop-blur-xl border-b border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
      
      {/* Texture Carbon Fibre halus agar matching dengan Footer */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none invert" 
           style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/carbon-fibre.png')` }} />
      
      <div className="container mx-auto max-w-6xl px-4 relative z-10">
        <div className="flex items-center h-16 md:h-20 transition-all">
          
          {/* BRAND LOGO DENGAN ANIMASI ZOOM-PULSE */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="relative">
                {/* Efek Pijar/Glow di belakang ikon */}
                <div className="absolute -inset-1.5 bg-amber-500 rounded-full blur opacity-20 group-hover:opacity-60 transition duration-1000 animate-pulse"></div>
                
                <div className="relative p-2 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl animate-logo-pulse">
                    <BookOpen className="w-5 h-5 text-amber-500 group-hover:rotate-12 transition-transform duration-500" />
                </div>
            </div>

            <div className="flex flex-col justify-center">
                {/* Judul MEJATIKA dengan Gradasi Emas-Putih */}
                <span className="font-black text-xl md:text-2xl tracking-tighter italic leading-none text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-white animate-logo-pulse">
                    MEJATIKA
                </span>
                {/* Slogan Informatika */}
                <span className="text-[7px] md:text-[9px] font-bold text-amber-500 tracking-[0.15em] uppercase mt-1">
                    Media Belajar Informatika
                </span>
            </div>
          </Link>

          {/* DESKTOP MENU - Dipusatkan secara horizontal */}
          <div className="hidden md:flex flex-1 justify-center items-center gap-1">
            {menuItems.map((item) => (
              <div key={item.id} className="relative group px-1">
                {item.sub_menus && item.sub_menus.length > 0 ? (
                  <div className="flex flex-col items-center">
                    <button className="flex items-center gap-1.5 px-4 py-2 text-[10px] font-bold uppercase text-zinc-400 hover:text-white hover:bg-white/5 rounded-full transition-all">
                      {item.name} 
                      <ChevronDown className="w-3 h-3 text-amber-500 opacity-50 group-hover:rotate-180 transition-transform duration-300" />
                    </button>
                    
                    {/* DROPDOWN MENU - Muncul saat hover */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-3">
                      <div className="bg-zinc-900 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,1)] rounded-2xl py-3 min-w-[220px] overflow-hidden backdrop-blur-2xl">
                        {item.sub_menus.map((sub: any) => (
                          <Link 
                            key={sub.id} 
                            href={`/${sub.slug}`} 
                            className="flex items-center gap-3 px-6 py-3 text-[10px] font-bold text-zinc-400 hover:text-amber-500 hover:bg-white/5 transition-all uppercase border-b border-white/[0.02] last:border-0"
                          >
                            <div className="w-1 h-1 rounded-full bg-amber-500/40 shadow-[0_0_5px_rgba(245,158,11,0.5)]"></div>
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link 
                    href={`/${item.slug}`} 
                    className="px-4 py-2 text-[10px] font-bold uppercase text-zinc-400 hover:text-white hover:bg-white/5 rounded-full transition-all"
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* SECTION KANAN (Bahasa & Cari) */}
          <div className="hidden md:flex items-center gap-6 shrink-0">
             <div className="h-4 w-px bg-white/10"></div>
             <button className="text-zinc-500 hover:text-white transition-colors">
                <Search className="w-4 h-4" />
             </button>
             <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                <Globe className="w-3.5 h-3.5 text-amber-500" />
                <span>ID</span>
             </div>
          </div>

          {/* MOBILE TOGGLE - Khusus tampilan HP */}
          <div className="md:hidden ml-auto flex items-center gap-3">
            <button className="text-zinc-400 p-2"><Search className="w-5 h-5" /></button>
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-white/10 rounded-full">
                  <Menu className="w-7 h-7" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="p-0 bg-zinc-950 text-white border-white/10 w-[85%] z-[99999]">
                
                {/* Header di dalam Menu Mobile */}
                <div className="p-8 border-b border-white/5 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-500 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                        <BookOpen className="w-6 h-6 text-black" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-2xl tracking-tighter italic leading-none">MEJATIKA</span>
                        <span className="text-[8px] font-bold text-amber-500 uppercase mt-1 tracking-widest">Informatika Media</span>
                      </div>
                   </div>
                </div>

                {/* List Menu untuk Mobile */}
                <div className="flex flex-col h-[calc(100vh-140px)] justify-between overflow-y-auto">
                  <div className="py-6 px-4 space-y-2">
                    {menuItems.map((item) => (
                      <div key={item.id} className="space-y-1">
                        <button 
                          onClick={() => setExpandedMenu(expandedMenu === item.id ? null : item.id)}
                          className={`w-full flex items-center justify-between p-4 font-bold uppercase text-xs rounded-2xl transition-all ${expandedMenu === item.id ? 'bg-amber-500/10 text-amber-500' : 'text-zinc-400 hover:bg-white/5'}`}
                        >
                          {item.name}
                          {item.sub_menus?.length > 0 && <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${expandedMenu === item.id ? 'rotate-180' : ''}`} />}
                        </button>
                        
                        {/* Sub-menu Mobile (Accordion) */}
                        {item.sub_menus?.length > 0 && expandedMenu === item.id && (
                          <div className="ml-4 pl-4 border-l border-amber-500/20 space-y-1 animate-in slide-in-from-left-2 duration-300">
                            {item.sub_menus.map((sub: any) => (
                              <Link 
                                key={sub.id} 
                                href={`/${sub.slug}`} 
                                onClick={() => setIsOpen(false)}
                                className="block py-3 text-[10px] font-bold text-zinc-500 hover:text-amber-500 uppercase transition-colors"
                              >
                                {sub.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Footer Mobile Menu */}
                  <div className="p-8 bg-zinc-900/30 border-t border-white/5">
                    <div className="flex items-center gap-3 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] justify-center">
                       <Phone className="w-3.5 h-3.5 text-amber-500" />
                       +62 812 3702 6025
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

        </div>
      </div>

      {/* Global CSS for Animations */}
      <style jsx global>{`
        @keyframes logo-pulse-zoom {
          0%, 100% { transform: scale(1); filter: brightness(1); }
          50% { transform: scale(1.03); filter: brightness(1.1); }
        }
        .animate-logo-pulse {
          animation: logo-pulse-zoom 4s ease-in-out infinite;
        }
      `}</style>
    </header>
  )
}
