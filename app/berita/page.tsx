"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function BeritaPage() {
  const [news, setNews] = useState([])
  const [loadingList, setLoadingList] = useState(true)

  const stripHtml = (html: string) => {
    if (!html) return "";
    return html.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').trim();
  };

  useEffect(() => {
    // 1. Tambahkan parameter ?status=published agar Backend hanya mengirim yang sudah terbit
    fetch("https://backend.mejatika.com/api/news?status=published")
      .then((res) => res.json())
      .then((json) => {
        const allData = json.data || [];

        // 2. FILTER GANDA: Bukan Cerpen & Pastikan statusnya Published (double check)
        const filtered = allData.filter((item: any) => {
          const catName = (item.category?.name || "").toLowerCase();
          const isNotCerpen = !catName.includes("cerpen");
          const isPublished = item.status === 'published';
          
          return isNotCerpen && isPublished;
        });

        setNews(filtered)
        setLoadingList(false)
      })
      .catch(() => setLoadingList(false))
  }, [])

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans">
      <Navigation />
      
      <div className="bg-amber-500 py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/batik-fractal.png')` }} />
        <div className="container mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white drop-shadow-md">Warta Digital</h1>
          <p className="text-amber-900 font-bold mt-2 uppercase tracking-widest text-xs">Informasi & Kabar Terbaru Mejatika</p>
        </div>
      </div>

      <main className="flex-grow container mx-auto px-4 py-12 -mt-10">
        {loadingList ? (
          <div className="flex flex-col items-center py-20 gap-4">
            <Loader2 className="animate-spin text-amber-500 w-10 h-10" />
            <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest">Memuat Warta...</p>
          </div>
        ) : news.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {news.map((item: any) => (
              <Card key={item.id} className="group overflow-hidden flex flex-col shadow-xl border-none bg-white rounded-[2.5rem]">
                <div className="px-5 pt-5"> 
                  <div className="relative h-56 w-full bg-zinc-100 rounded-[1.5rem] overflow-hidden">
                    <img src={item.image || "/placeholder.svg"} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[8px] font-black uppercase text-zinc-900">
                      {item.category?.name}
                    </div>
                  </div>
                </div>
                <CardContent className="p-7 flex flex-col flex-grow">
                  <h2 className="text-xl font-black italic uppercase leading-tight mb-4 text-zinc-900 line-clamp-2">
                    {item?.title || "Tanpa Judul"}
                  </h2>
                  <p className="text-zinc-500 text-sm leading-relaxed line-clamp-3 mb-8 flex-grow font-medium">
                    {item?.content ? stripHtml(item.content) : "Tidak ada konten."}
                  </p>
                  
                  {/* Pastikan link slug mengarah ke halaman yang benar */}
                  <Link href={`/berita/${item?.slug}`} className="w-full">
                    <button className="w-full flex items-center justify-center gap-2 bg-zinc-900 hover:bg-amber-500 text-white font-black uppercase text-[10px] tracking-widest py-4 rounded-2xl transition-all shadow-lg group">
                      Baca Selengkapnya <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform" />
                    </button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">Belum ada warta terbaru yang dipublikasikan.</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
