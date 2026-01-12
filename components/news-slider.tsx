"use client"

import { useState, useEffect } from "react"
// PERBAIKAN: Pastikan menggunakan lucide-react
import { ChevronLeft, ChevronRight, Calendar, ArrowRight, Loader2 } from "lucide-react" 
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface NewsItem {
  id: string
  title: string
  slug: string
  content: string
  image: string
  created_at: string
  category: {
    name: string
  }
}

interface NewsSliderProps {
  onReadMore: (slug: string) => void
}

export function NewsSlider({ onReadMore }: NewsSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [latestNews, setLatestNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("https://backend.mejatika.com/api/news")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          // Filter supaya cerpen tidak masuk slider
          const filteredNews = json.data.filter((item: NewsItem) => {
            const catName = (item.category?.name || "").toLowerCase();
            return !catName.includes("cerpen");
          });
          setLatestNews(filteredNews.slice(0, 5))
        }
        setLoading(false)
      })
      .catch((error) => {
        console.error("Failed to load news:", error)
        setLoading(false)
      })
  }, [])

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % latestNews.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + latestNews.length) % latestNews.length)
  }

  // PERBAIKAN: Fungsi pembersihan teks agar tidak muncul &nbsp; atau tag HTML
  const getExcerpt = (html: string) => {
    if (!html) return ""
    return html
      .replace(/<[^>]*>?/gm, '') // Hapus tag HTML
      .replace(/&nbsp;/g, ' ')   // Ganti &nbsp; jadi spasi biasa
      .replace(/\s+/g, ' ')      // Bersihkan spasi ganda
      .trim()
      .substring(0, 120) + "..."
  }

  if (loading) {
    return (
      <div className="h-[400px] flex items-center justify-center bg-white rounded-[2.5rem] shadow-sm border border-zinc-100">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    )
  }

  if (latestNews.length === 0) return null

  const currentNews = latestNews[currentIndex]

  return (
    <section className="mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-8 w-2 bg-amber-500 rounded-full" />
        <h2 className="text-2xl font-black uppercase italic tracking-tighter text-zinc-900 dark:text-white">
          Warta Terkini
        </h2>
      </div>
      
      <Card className="overflow-hidden border-none shadow-2xl bg-white dark:bg-zinc-950 rounded-[2.5rem] relative">
        <div className="p-4">
          <div className="relative h-[250px] md:h-[350px] w-full overflow-hidden rounded-[2rem] bg-zinc-100">
            <img
              src={currentNews.image || "/placeholder.svg"}
              alt={currentNews.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-6 left-6">
              <span className="bg-amber-500 text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
                {currentNews.category?.name}
              </span>
            </div>
            
            {/* Tombol Navigasi Slider */}
            <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
              <Button variant="ghost" size="icon" onClick={prevSlide} className="pointer-events-auto rounded-full bg-white/80 hover:bg-amber-500 hover:text-white shadow-md">
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button variant="ghost" size="icon" onClick={nextSlide} className="pointer-events-auto rounded-full bg-white/80 hover:bg-amber-500 hover:text-white shadow-md">
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>

        <CardContent className="px-8 md:px-12 py-6">
          <div className="flex items-center gap-2 text-zinc-400 text-[9px] font-black uppercase tracking-widest mb-3">
            <Calendar className="w-3.5 h-3.5 text-amber-500" />
            <span>{new Date(currentNews.created_at).toLocaleDateString("id-ID")}</span>
          </div>

          <h3 className="text-xl md:text-3xl font-black mb-4 leading-tight tracking-tighter text-zinc-900 dark:text-white uppercase italic">
            {currentNews.title}
          </h3>
          
          <p className="text-zinc-500 text-sm md:text-base mb-8 line-clamp-2">
            {getExcerpt(currentNews.content)}
          </p>
          
          <div className="flex justify-between items-center border-t border-zinc-50 pt-6">
            <Button 
              onClick={() => onReadMore(currentNews.slug)}
              className="rounded-xl bg-zinc-900 hover:bg-amber-500 text-white font-black uppercase text-[10px] tracking-widest px-8 transition-all group"
            >
              Baca Selengkapnya
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>

            <div className="flex gap-1.5">
              {latestNews.map((_, i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all ${i === currentIndex ? "bg-amber-500 w-8" : "bg-zinc-200 w-2"}`} />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
