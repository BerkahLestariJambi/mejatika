"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Calendar, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface NewsItem {
  id: string
  title: string
  slug: string
  content: string // Backend Laravel menggunakan 'content'
  image: string
  created_at: string // Sesuai field default Laravel
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
        // PERBAIKAN: Ambil json.data dan ambil 5 teratas
        if (json.success && Array.isArray(json.data)) {
          setLatestNews(json.data.slice(0, 5))
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

  // Fungsi untuk memotong teks konten menjadi ringkasan
  const getExcerpt = (html: string) => {
    if (!html) return ""
    return html.replace(/<[^>]*>?/gm, '').substring(0, 150) + "..."
  }

  if (loading) {
    return (
      <div className="h-[500px] flex flex-col items-center justify-center bg-zinc-50 rounded-3xl border border-dashed border-zinc-200">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500 mb-2" />
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Menyusun Berita Utama...</p>
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
        {/* Navigasi Panah (Floating) */}
        <div className="absolute top-1/2 -translate-y-1/2 left-4 right-4 flex justify-between z-30 pointer-events-none">
          <Button
            variant="ghost"
            size="icon"
            onClick={prevSlide}
            className="pointer-events-auto h-12 w-12 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-md shadow-lg hover:bg-amber-500 hover:text-white transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={nextSlide}
            className="pointer-events-auto h-12 w-12 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-md shadow-lg hover:bg-amber-500 hover:text-white transition-all"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </div>

        <div className="p-4">
          <div className="relative h-[250px] md:h-[400px] w-full overflow-hidden rounded-[2rem] shadow-inner bg-zinc-100">
            <img
              src={currentNews.image || "/placeholder.svg"}
              alt={currentNews.title}
              className="w-full h-full object-cover"
            />
            
            <div className="absolute top-6 left-6">
              <span className="bg-amber-500 text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
                {currentNews.category?.name || "BERITA"}
              </span>
            </div>
          </div>
        </div>

        <CardContent className="px-8 md:px-12 py-8">
          <div className="flex items-center gap-2 text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-4">
            <Calendar className="w-3.5 h-3.5 text-amber-500" />
            <span>
              {new Date(currentNews.created_at).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>

          <h3 className="text-2xl md:text-4xl font-black mb-4 leading-tight tracking-tighter text-zinc-900 dark:text-white uppercase italic">
            {currentNews.title}
          </h3>
          
          <p className="text-zinc-500 dark:text-zinc-400 mb-8 leading-relaxed line-clamp-2 font-medium">
            {getExcerpt(currentNews.content)}
          </p>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-t border-zinc-100 dark:border-zinc-800 pt-8">
            <Button 
              size="lg" 
              onClick={() => onReadMore(currentNews.slug)}
              className="w-full md:w-auto rounded-2xl bg-zinc-900 hover:bg-amber-500 text-white font-black uppercase text-[11px] tracking-widest h-14 px-10 transition-all group"
            >
              Baca Selengkapnya
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
            </Button>

            <div className="flex gap-2 justify-center items-center">
              {latestNews.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    index === currentIndex 
                      ? "bg-amber-500 w-10" 
                      : "bg-zinc-200 dark:bg-zinc-800 w-3 hover:bg-amber-200"
                  }`}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
