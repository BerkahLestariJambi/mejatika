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
    // Menambahkan parameter ?type=nav agar API mengirimkan data nested (bercabang)
    fetch("https://backend.mejatika.com/api/menus?type=nav")
      .then((res) => {
        if (!res.ok) throw new Error("Gagal mengambil data menu");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setMenuItems(data);
        } else {
          setMenuItems([]); 
        }
      })
      .catch((error) => {
        console.error("Error Fetching Menus:", error);
        setMenuItems([]); 
      })
      .finally(() => setLoading(false));
  }, [])

  if (loading) {
    return <nav className="h-16 bg-amber-600 animate-pulse w-full" />;
  }

  return (
    <nav className="sticky top-0 z-[100] w-full bg-amber-500 shadow-xl border-b-2 border-amber-700/20 overflow-hidden">
      {/* Background Pattern Batik */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/batik-fractal.png')` }} />
      
      <div className="container mx-auto max-w-6xl px-4 relative z-10">
        <div className="flex items-center justify-between h-16">
          
          {/* LOGO */}
          <Link href="/" className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-white" />
            <span className="font-black text-xl italic text-white">MEJATIKA</span>
          </Link>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center gap-2">
            {menuItems?.map((item) => (
              <div key={item.id} className="relative group">
                {/* UPDATE: Menggunakan field 'name' dan 'sub_menus' dari API */}
                {item.sub_menus && item.sub_menus.length > 0 ? (
                  <>
                    <button className="flex items-center gap-1 px-4 py-2 text-[11px] font-black uppercase text-white hover:bg-white/10 rounded-full transition-colors">
                      {item.name} <ChevronDown className="w-3 h-3 opacity-70" />
                    </button>
                    
                    {/* Dropdown Card */}
                    <div className="absolute top-full left-0 hidden group-hover:block min-w-[200px] bg-white shadow-2xl rounded-xl py-3 mt-1 border border-amber-100 animate-in fade-in slide-in-from-top-2 duration-200">
                      {item.sub_menus.map((sub: any) => (
                        <Link 
                          key={sub.id} 
                          href={sub.slug.startsWith('/') ? sub.slug : `/${sub.slug}`} 
                          className="block px-5 py-2 text-[11px] font-bold text-zinc-700 hover:bg-amber-50 hover:text-amber-600 transition-colors uppercase tracking-tight"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  </>
                ) : (
                  <Link 
                    href={item.slug.startsWith('/') ? item.slug : `/${item.slug}`} 
                    className="px-4 py-2 text-[11px] font-black uppercase text-white hover:bg-white/10 rounded-full transition-colors"
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* MOBILE TOGGLE */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" className="text-white hover:bg-white/20">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-amber-600 border-l-amber-700 text-white p-0">
                <div className="p-6 border-b border-white/10">
                   <span className="font-black text-xl italic">MEJATIKA</span>
                </div>
                <div className="flex flex-col overflow-y-auto max-h-[80vh] py-4">
                  {menuItems?.map((item) => (
                    <div key={item.id} className="flex flex-col">
                      <Link 
                        href={item.slug.startsWith('/') ? item.slug : `/${item.slug}`} 
                        onClick={() => setIsOpen(false)} 
                        className="px-6 py-4 font-black uppercase text-sm border-b border-white/5 hover:bg-white/10"
                      >
                        {item.name}
                      </Link>
                      
                      {/* Submenu on Mobile */}
                      {item.sub_menus && item.sub_menus.length > 0 && (
                        <div className="bg-amber-700/30">
                          {item.sub_menus.map((sub: any) => (
                            <Link
                              key={sub.id}
                              href={sub.slug.startsWith('/') ? sub.slug : `/${sub.slug}`}
                              onClick={() => setIsOpen(false)}
                              className="block px-10 py-3 text-[10px] font-bold uppercase opacity-80 hover:opacity-100"
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
