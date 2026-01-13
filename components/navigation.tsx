"use client"

import { useState, useEffect } from "react"
import { Menu, BookOpen, ChevronDown, Phone, Mail, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import Link from "next/link"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [menuItems, setMenuItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedMenu, setExpandedMenu] = useState<number | null>(null)

  useEffect(() => {
    fetch("https://backend.mejatika.com/api/menus?type=nav")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setMenuItems(data);
      })
      .catch((err) => console.error("Error:", err))
      .finally(() => setLoading(false));
  }, [])

  if (loading) return <nav className="h-16 bg-zinc-950 animate-pulse w-full" />;

  return (
    <nav className="sticky top-0 z-[100] w-full bg-zinc-950/95 backdrop-blur-md border-b border-white/5 shadow-2xl">
      {/* Texture Overlay halus */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none invert" 
           style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/carbon-fibre.png')` }} />
      
      <div className="container mx-auto max-w-6xl px-4 relative z-10">
        <div className="flex items-center h-16">
          
          {/* BRAND LOGO DENGAN ANIMASI ZOOM & PULSE */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative transition-transform duration-500 group-hover:scale-110">
                {/* Efek Cahaya Pijar di Belakang Ikon */}
                <div className="absolute -inset-1.5 bg-amber-500 rounded-full blur opacity-20 group-hover:opacity-60 animate-pulse transition duration-1000"></div>
                
                <div className="relative p-2 bg-zinc-900 border border-white/10 rounded-xl">
                    <BookOpen className="w-5 h-5 text-amber-500 group-hover:rotate-12 transition-transform duration-500" />
                </div>
            </div>

            <div className="flex flex-col justify-center">
                {/* Text MEJATIKA dengan efek bernafas (Zoom In/Out) */}
                <span className="font-black text-xl tracking-tighter italic leading-none text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-white animate-in zoom-in-95 duration-1000 iteration-infinite">
                    MEJATIKA
                </span>
                {/* Slogan Baru */}
                <span className="text-[7px] sm:text-[9px] font-bold text-amber-500 tracking-[0.15em] uppercase whitespace-nowrap mt-1 group-hover:text-white transition-colors duration-500">
                    Media Belajar Informatika
                </span>
            </div>
          </Link>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex flex-1 justify-center items-center gap-1">
            {menuItems.map((item) => (
              <div key={item.id} className="relative group">
                {item.sub_menus && item.sub_menus.length > 0 ? (
                  <div className="flex flex-col items-center">
                    <button className="flex items-center gap-1.5 px-4 py-2 text-[10px] font-bold uppercase text-zinc-400 hover:text-white hover:bg-white/5 rounded-full transition-all">
                      {item.name} 
                      <ChevronDown className="w-3 h-3 text-amber-500 opacity-50 group-hover:rotate-180 transition-transform" />
                    </button>
                    
                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2">
                      <div className="bg-zinc-900 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-2xl py-3 min-w-[200px] overflow-hidden backdrop-blur-xl">
                        {item.sub_menus.map((sub: any) => (
                          <Link 
                            key={sub.id} 
                            href={`/${sub.slug}`} 
                            className="flex items-center gap-3 px-5 py-2.5 text-[10px] font-bold text-zinc-400 hover:text-amber-500 hover:bg-white/5 transition-all uppercase"
                          >
                            <span className="w-1 h-1 rounded-full bg-zinc-700 group-hover:bg-amber-500"></span>
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

          {/* RIGHT SECTION */}
          <div className="hidden md:flex items-center gap-4">
             <div className="h-4 w-px bg-white/10"></div>
             <button className="text-[10px] font-bold text-zinc-500 hover:text-white transition-colors flex items-center gap-2">
                <Globe className="w-3.5 h-3.5" />
                ID
             </button>
          </div>

          {/* MOBILE TOGGLE */}
          <div className="md:hidden ml-auto">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-white/5 rounded-full transition-all">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="p-0 bg-zinc-950 text-white border-white/5 w-[85%]">
                <div className="p-8 border-b border-white/5 bg-gradient-to-br from-amber-500/10 to-transparent">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-500 rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                        <BookOpen className="w-5 h-5 text-black" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-2xl tracking-tighter italic leading-none">MEJATIKA</span>
                        <span className="text-[8px] font-bold text-amber-500 uppercase mt-1">Belajar Informatika</span>
                      </div>
                   </div>
                </div>

                <div className="flex flex-col h-[calc(100vh-140px)] justify-between">
                  <div className="py-6 px-4 space-y-2 overflow-y-auto">
                    {menuItems.map((item) => (
                      <div key={item.id}>
                        <button 
                          onClick={() => setExpandedMenu(expandedMenu === item.id ? null : item.id)}
                          className={`w-full flex items-center justify-between p-4 font-bold uppercase text-sm rounded-xl transition-all ${expandedMenu === item.id ? 'bg-amber-500/10 text-amber-500' : 'text-zinc-300 hover:bg-white/5'}`}
                        >
                          {item.name}
                          {item.sub_menus?.length > 0 && <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${expandedMenu === item.id ? 'rotate-180' : ''}`} />}
                        </button>
                        
                        {item.sub_menus?.length > 0 && expandedMenu === item.id && (
                          <div className="ml-4 mt-1 border-l border-amber-500/20 space-y-1 animate-in slide-in-from-left-2 duration-300">
                            {item.sub_menus.map((sub: any) => (
                              <Link 
                                key={sub.id} 
                                href={`/${sub.slug}`} 
                                onClick={() => setIsOpen(false)}
                                className="block px-6 py-3 text-xs font-bold text-zinc-500 hover:text-amber-500 uppercase transition-colors"
                              >
                                {sub.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="p-8 bg-zinc-900/50 border-t border-white/5">
                    <div className="flex items-center gap-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                       <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                          <Phone className="w-3.5 h-3.5 text-amber-500" />
                       </div>
                       +62 812 3702 6025
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

        </div>
      </div>

      {/* CSS Animasi Custom (Bisa ditaruh di sini agar tidak perlu edit globals.css) */}
      <style jsx global>{`
        @keyframes logo-pulse-zoom {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.9; }
        }
        .animate-logo-pulse {
          animation: logo-pulse-zoom 3s ease-in-out infinite;
        }
      `}</style>
    </nav>
  )
}
