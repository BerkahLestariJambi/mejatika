"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, ArrowRight, PenTool, BookOpen } from "lucide-react"
import Link from "next/link"

export default function CerpenPage() {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)

  const stripHtml = (html: string) => {
    if (!html) return "";
    return html.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').trim();
  };

  useEffect(() => {
    fetch("https://backend.mejatika.com/api/news")
      .then((res) => res.json())
      .then((data) => {
        const allData = Array.isArray(data) ? data : [];
        // Filter kategori Cerpen
        const filtered = allData.filter((item: any) => 
          item.category?.name?.toLowerCase() === "cerpen" || 
          item.category_name?.toLowerCase() === "cerpen"
        );
        setNews(filtered)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <Navigation />
      
      {/* Hero Section */}
      <div className="bg-zinc-900 py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/paper-fibers.png')` }} />
        <div className="container mx-auto text-center relative z-10">
          <PenTool className="mx-auto text-amber-500 mb-6 h-12 w-12" />
          <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-white">
            Ruang <span className="text-amber-500 font-outline-2">Cerpen</span>
          </h1>
          <p className="text-zinc-400 font-bold mt-4 uppercase tracking-[0.3em] text-[10px]">Eksplorasi Imajinasi & Literasi Digital</p>
        </div>
      </div>

      <main className="flex-grow container mx-auto px-4 py-16 -mt-12">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-amber-500 w-10 h-10" /></div>
        ) : news.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {news.map((item: any) => (
              <Card key={item.id} className="group border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden hover:-translate-y-3 transition-all duration-500">
                <div className="p-4">
                  <div className="relative h-72 w-full rounded-[2rem] overflow-hidden shadow-inner">
                    <img src={item.image || "/placeholder.svg"} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute top-6 left-6 bg-amber-500 text-white text-[9px] font-black uppercase px-4 py-1.5 rounded-full">Cerita Pendek</div>
                  </div>
                </div>
                <CardContent className="p-8 pt-4 flex flex-col h-full">
                  <h2 className="text-2xl font-black italic uppercase text-zinc-900 line-clamp-2 leading-tight mb-4 tracking-tighter">
                    {item.title}
                  </h2>
                  <p className="text-zinc-500 text-sm line-clamp-3 mb-8 font-medium leading-relaxed">
                    {stripHtml(item.content)}
                  </p>
                  <Link href={`/cerpen/${item.slug}`} className="mt-auto">
                    <button className="w-full py-4 bg-zinc-900 hover:bg-amber-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-xl flex items-center justify-center gap-2 group/btn">
                      Buka Lembaran <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-2 transition-transform" />
                    </button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 opacity-30 italic font-black uppercase">Belum ada karya.</div>
        )}
      </main>

      <Footer />
    </div>
  )
}
