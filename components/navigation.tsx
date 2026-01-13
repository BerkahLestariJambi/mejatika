"use client"

import { useState, useEffect } from "react"
import { Menu, BookOpen, ChevronDown, X, Phone, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
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

  const toggleExpand = (id: number) => {
    setExpandedMenu(expandedMenu === id ? null : id)
  }

  if (loading) return <nav className="h-16 bg-amber-600 animate-pulse w-full" />;

  return (
    <nav className="sticky top-0 z-[100] w-full bg-amber-500 shadow-xl border-b-2 border-amber-700/20">
      {/* Motif Batik Overlay */}
      <div className="absolute inset-0 opacity-15 pointer-events-none" 
           style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/batik-fractal.png')` }} />
      
      <div className="container mx-auto max-w-6xl px-4 relative z-10">
        <div className="flex items-center h-16">
          
          {/* LOGO */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-xl tracking-tighter text-white italic">MEJATIKA</span>
          </Link>

          {/* DESKTOP MENU (Centered) */}
          <div className="hidden md:flex flex-1 justify-center items-center gap-1">
            {menuItems.map((item) => (
              <div key={item.id} className="relative group px-1">
                {item.sub_menus && item.sub_menus.length > 0 ? (
                  <div className="flex flex-col items-center">
                    <button className="flex items-center gap-1 px-4 py-2 text-[11px] font-black uppercase text-white hover:bg-white/20 rounded-full transition-all">
                      {item.name} <ChevronDown className="w-3 h-3 opacity-70 group-hover:rotate-180 transition-transform" />
                    </button>
                    
                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[110]">
                      <div className="bg-white shadow-2xl rounded-xl py-2 min-w-[190px] border border-amber-100 overflow-hidden">
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

          {/* MOBILE TOGGLE */}
          <div className="md:hidden ml-auto">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="p-0 bg-zinc-950 text-white border-l border-amber-500/20 w-[85%] sm:w-[350px]">
                
                {/* Header di dalam Sheet */}
                <div className="p-6 border-b border-white/5 bg-gradient-to-b from-amber-600/20 to-transparent">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-500 rounded-xl">
                        <BookOpen className="w-5 h-5 text-black" />
                      </div>
                      <span className="font-black text-xl tracking-tighter italic">MEJATIKA</span>
                   </div>
                </div>

                <div className="flex flex-col h-[calc(100vh-100px)] justify-between">
                  {/* Link Menu List */}
                  <div className="overflow-y-auto py-4 px-2 custom-scrollbar">
                    {menuItems.map((item) => (
                      <div key={item.id} className="mb-1">
                        {item.sub_menus && item.sub_menus.length > 0 ? (
                          <div>
                            <button 
                              onClick={() => toggleExpand(item.id)}
                              className="w-full flex items-center justify-between px-4 py-4 font-black uppercase text-sm hover:bg-white/5 rounded-xl transition-colors"
                            >
                              {item.name}
                              <ChevronDown className={`w-4 h-4 text-amber-500 transition-transform duration-300 ${expandedMenu === item.id ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {/* Accordion Sub-Menus */}
                            <div className={`overflow-hidden transition-all duration-300 bg-white/5 rounded-xl mx-2 ${expandedMenu === item.id ? 'max-h-96 py-2 opacity-100' : 'max-h-0 opacity-0'}`}>
                              {item.sub_menus.map((sub: any) => (
                                <Link 
                                  key={sub.id} 
                                  href={`/${sub.slug}`} 
                                  onClick={() => setIsOpen(false)}
                                  className="block px-8 py-3 text-[11px] font-bold uppercase text-zinc-400 hover:text-amber-500 transition-colors"
                                >
                                  {sub.name}
                                </Link>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <Link 
                            href={`/${item.slug}`} 
                            onClick={() => setIsOpen(false)} 
                            className="block px-4 py-4 font-black uppercase text-sm hover:bg-white/5 rounded-xl transition-colors"
                          >
                            {item.name}
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Footer di dalam Sheet Menu */}
                  <div className="p-6 bg-zinc-900/50 border-t border-white/5 space-y-4">
                    <div className="flex items-center gap-3 text-xs text-zinc-500">
                      <Phone className="w-3.5 h-3.5 text-amber-500" />
                      <span>+62 812 3702 6025</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-zinc-500">
                      <Mail className="w-3.5 h-3.5 text-amber-500" />
                      <span>info@mejatika.com</span>
                    </div>
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
