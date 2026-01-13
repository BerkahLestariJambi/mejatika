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
    /* PENTING: 
       - sticky top-0: Membuat header nempel di atas
       - z-[100]: Memastikan header berada di lapisan paling depan (tidak tertutup gambar/konten)
       - backdrop-blur-md: Memberikan efek kaca saat melewati konten di bawahnya
    */
    <nav className="sticky top-0 z-[100] w-full bg-zinc-950/90 backdrop-blur-md border-b border-white/10 shadow-xl">
      
      {/* Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none invert" 
           style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/carbon-fibre.png')` }} />
      
      <div className="container mx-auto max-w-6xl px-4 relative z-10">
        <div className="flex items-center h-16">
          
          {/* BRAND LOGO DENGAN ANIMASI ZOOM */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="relative animate-logo-pulse">
                <div className="absolute -inset-1.5 bg-amber-500 rounded-full blur opacity-20 group-hover:opacity-60 transition duration-1000"></div>
                <div className="relative p-2 bg-zinc-900 border border-white/10 rounded-xl">
                    <BookOpen className="w-5 h-5 text-amber-500 group-hover:rotate-12 transition-transform duration-500" />
                </div>
            </div>

            <div className="flex flex-col justify-center">
                <span className="font-black text-xl tracking-tighter italic leading-none text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-white">
                    MEJATIKA
                </span>
                <span className="text-[8px] font-bold text-amber-500 tracking-[0.1em] uppercase mt-1">
                    Media Belajar Informatika
                </span>
            </div>
          </Link>

          {/* DESKTOP MENU - Dipusatkan */}
          <div className="hidden md:flex flex-1 justify-center items-center gap-1">
            {menuItems.map((item) => (
              <div key={item.id} className="relative group">
                {item.sub_menus && item.sub_menus.length > 0 ? (
                  <div className="flex flex-col items-center">
                    <button className="flex items-center gap-1.5 px-4 py-2 text-[10px] font-bold uppercase text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-all">
                      {item.name} 
                      <ChevronDown className="w-3 h-3 text-amber-500 opacity-50 group-hover:rotate-180 transition-transform" />
                    </button>
                    
                    {/* DROPDOWN MENU - Z-index tinggi agar di atas konten body */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2 z-[110]">
                      <div className="bg-zinc-900 border border-white/10 shadow-2xl rounded-2xl py-3 min-w-[200px] overflow-hidden backdrop-blur-xl">
                        {item.sub_menus.map((sub: any) => (
                          <Link 
                            key={sub.id} 
                            href={`/${sub.slug}`} 
                            className="flex items-center gap-3 px-5 py-2.5 text-[10px] font-bold text-zinc-400 hover:text-amber-500 hover:bg-white/5 transition-all uppercase"
                          >
                            <span className="w-1 h-1 rounded-full bg-amber-500/40 group-hover:bg-amber-500"></span>
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link 
                    href={`/${item.slug}`} 
                    className="px-4 py-2 text-[10px] font-bold uppercase text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-all"
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* RIGHT SECTION */}
          <div className="hidden md:flex items-center gap-4 shrink-0">
             <div className="h-4 w-px bg-white/10"></div>
             <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500">
                <Globe className="w-3.5 h-3.5 text-amber-500" />
                <span>ID</span>
             </div>
          </div>

          {/* MOBILE TOGGLE */}
          <div className="md:hidden ml-auto">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-all">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="p-0 bg-zinc-950 text-white border-white/10 w-[80%] z-[150]">
                {/* Header Menu Mobile */}
                <div className="p-8 border-b border-white/5 bg-zinc-900/50">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-500 rounded-xl">
                        <BookOpen className="w-5 h-5 text-black" />
                      </div>
                      <span className="font-black text-2xl italic tracking-tighter">MEJATIKA</span>
                   </div>
                </div>

                {/* List Menu Mobile */}
                <div className="flex flex-col h-[calc(100vh-120px)] justify-between overflow-y-auto">
                  <div className="py-6 px-4 space-y-1">
                    {menuItems.map((item) => (
                      <div key={item.id}>
                        <button 
                          onClick={() => setExpandedMenu(expandedMenu === item.id ? null : item.id)}
                          className={`w-full flex items-center justify-between p-4 font-bold uppercase text-xs rounded-xl transition-all ${expandedMenu === item.id ? 'bg-amber-500/10 text-amber-500' : 'text-zinc-400 hover:bg-white/5'}`}
                        >
                          {item.name}
                          {item.sub_menus?.length > 0 && <ChevronDown className={`w-4 h-4 transition-transform ${expandedMenu === item.id ? 'rotate-180' : ''}`} />}
                        </button>
                        
                        {item.sub_menus?.length > 0 && expandedMenu === item.id && (
                          <div className="ml-4 mt-1 border-l border-amber-500/20 space-y-1">
                            {item.sub_menus.map((sub: any) => (
                              <Link 
                                key={sub.id} 
                                href={`/${sub.slug}`} 
                                onClick={() => setIsOpen(false)}
                                className="block px-6 py-3 text-[10px] font-bold text-zinc-500 hover:text-amber-500 uppercase transition-colors"
                              >
                                {sub.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Info Bawah Menu Mobile */}
                  <div className="p-8 bg-zinc-900/30 border-t border-white/5">
                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest text-center">
                      Media Belajar Informatika
                    </p>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

        </div>
      </div>

      <style jsx global>{`
        @keyframes logo-pulse-zoom {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .animate-logo-pulse {
          animation: logo-pulse-zoom 3s ease-in-out infinite;
        }
      `}</style>
    </nav>
  )
}
