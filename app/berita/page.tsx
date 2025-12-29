"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, ArrowRight, BookOpen } from "lucide-react"
import Link from "next/link"

export default function BeritaPage() {
  const [news, setNews] = useState([])
  const [loadingList, setLoadingList] = useState(true)

  // Fungsi untuk membersihkan tag HTML dari konten (untuk ringkasan di card)
  const stripHtml = (html: string) => {
    if (!html) return "";
    return html
      .replace(/<[^>]*>?/gm, '') // Menghapus tag HTML
      .replace(/&nbsp;/g, ' ')   // Mengubah spasi HTML menjadi spasi biasa
      .trim();
  };

  useEffect(() => {
    fetch("https://backend.mejatika.com/api/news")
      .then((res) => res.json())
      .then((data) => {
        setNews(data)
        setLoadingList(false)
      })
      .catch(() => setLoadingList(false))
  }, [])

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <Navigation />
      
      {/* HEADER PAGE DENGAN GAYA MEJATIKA */}
      <div className="bg-amber-500 py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/batik-fractal.png')` }} />
        <div className="container mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white drop-shadow-md">
            Warta Digital
          </h1>
          <p className="text-amber-900 font-bold mt-2 uppercase tracking-widest text-xs">
            Update informasi terbaru dari MEJATIKA
          </p>
        </div>
      </div>

      <main className="flex-grow container mx-auto px-4 py-12 -mt-10">
        {loadingList ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-amber-500 w-10 h-10" />
            <p className="text-zinc-400 font-bold animate-pulse text-xs tracking-widest">MEMUAT BERITA...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {news.map((item: any) => (
              <Card key={item.id} className="group overflow-hidden flex flex-col shadow-xl hover:shadow-2xl transition-all border-none bg-white rounded-[2rem]">
                
                {/* BAGIAN GAMBAR */}
                <div className="px-5 pt-5"> 
                  <div className="relative h-56 w-full bg-zinc-100 rounded-[1.5rem] overflow-hidden shadow-inner">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-300">
                        <BookOpen className="w-10 h-10" />
                      </div>
                    )}
                  </div>
                </div>

                <CardContent className="p-7 flex flex-col flex-grow">
                  {/* JUDUL BERITA - BLACK ITALIC */}
                  <h2 className="text-xl font-black italic uppercase leading-tight mb-4 text-zinc-900 line-clamp-2 group-hover:text-amber-600 transition-colors">
                    {item.title}
                  </h2>

                  {/* KONTEN BERSIH DARI TAG HTML */}
                  <p className="text-zinc-500 text-sm leading-relaxed line-clamp-3 mb-8 flex-grow">
                    {stripHtml(item.content)}
                  </p>
                  
                  <Link href={`/berita/${item.slug}`} className="w-full">
                    <button className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-zinc-900 text-white font-black uppercase text-[10px] tracking-widest py-4 rounded-2xl transition-all shadow-lg hover:-translate-y-1">
                      Baca Selengkapnya <ArrowRight className="h-4 w-4" />
                    </button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
