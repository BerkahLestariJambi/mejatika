"use client"

import { useState, useEffect } from "react"
import { Menu, BookOpen, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import Link from "next/link"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [menuItems, setMenuItems] = useState<any[]>([]) // Inisialisasi sebagai array kosong
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("https://backend.mejatika.com/api/menus")
      .then((res) => {
        if (!res.ok) throw new Error("Endpoint tidak ditemukan (404)");
        return res.json();
      })
      .then((data) => {
        // VALIDASI: Pastikan data adalah array sebelum disimpan
        if (Array.isArray(data)) {
          setMenuItems(data);
        } else {
          console.error("Format API salah, mengharapkan Array tapi menerima:", data);
          setMenuItems([]); 
        }
      })
      .catch((error) => {
        console.error("Error Fetching Menus:", error);
        setMenuItems([]); // Jika error, set array kosong agar .map tidak crash
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

          {/* DESKTOP MENU - Menggunakan Optional Chaining (?.) */}
          <div className="hidden md:flex items-center gap-2">
            {menuItems?.map((item) => (
              <div key={item.id} className="relative group">
                {item.subMenus && item.subMenus.length > 0 ? (
                  <>
                    <button className="flex items-center gap-1 px-4 py-2 text-[11px] font-black uppercase text-white hover:bg-white/10 rounded-full">
                      {item.title} <ChevronDown className="w-3 h-3" />
                    </button>
                    <div className="absolute top-full left-0 hidden group-hover:block w-48 bg-white shadow-2xl rounded-xl py-2 mt-1 border border-amber-100 transition-all">
                      {item.subMenus.map((sub: any) => (
                        <Link key={sub.id} href={sub.url} className="block px-4 py-2 text-[10px] font-bold text-zinc-700 hover:bg-amber-50 hover:text-amber-600">
                          {sub.title}
                        </Link>
                      ))}
                    </div>
                  </>
                ) : (
                  <Link href={item.url} className="px-4 py-2 text-[11px] font-black uppercase text-white hover:bg-white/10 rounded-full">
                    {item.title}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* MOBILE TOGGLE */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" className="text-white"><Menu /></Button>
              </SheetTrigger>
              <SheetContent className="bg-amber-600 text-white">
                <div className="flex flex-col gap-4 mt-10">
                  {menuItems?.map((item) => (
                    <Link key={item.id} href={item.url} onClick={() => setIsOpen(false)} className="font-bold border-b border-white/10 pb-2">
                      {item.title}
                    </Link>
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
