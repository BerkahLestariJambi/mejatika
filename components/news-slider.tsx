"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
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
  category: { name: string }
}

export function NewsSlider({ onReadMore }: { onReadMore: (slug: string) => void }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [latestNews, setLatestNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)

  // 1. Ambil Data
  useEffect(() => {
    fetch("https://backend.mejatika.com/api/news")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          const filtered = json.data.filter((item: NewsItem) => 
            !(item.category?.name || "").toLowerCase().includes("cerpen")
          )
          setLatestNews(filtered.slice(0, 5))
        }
        setLoading(false)
      })
  }, [])

  // 2. Navigasi
  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % latestNews.length)
  }, [latestNews.length])

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + latestNews.length) % latestNews.length)
  }

  // 3. AUTO PLAY (Ganti otomatis tiap 5 detik)
  useEffect(() => {
    if (latestNews.length === 0) return
    const interval = setInterval(nextSlide, 5000)
    return () => clearInterval(interval)
  }, [nextSlide, latestNews.length])

  const getExcerpt = (html: string) => {
    if (!html) return ""
    return html.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').substring(0, 100) + "..."
  }

  if (loading) return (
    <div className="h-[400px] flex items-center justify-center bg-white rounded-[2.5rem]">
      <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
    </div>
  )

  if (latestNews.length === 0) return null
  const currentNews = latestNews[currentIndex]

  // Komponen kotak untuk efek pecah
  const GridOverlay = () => (
    <div className="absolute inset-0 grid grid-cols-5 grid-rows-4 pointer-events-none z-20">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 1, scale: 1 }}
          animate={{ opacity: 0, scale: 0 }}
          transition={{ duration: 0.5, delay: i * 0.02 }}
          className="bg-amber-500/20 border border-white/10"
        />
      ))}
    </div>
  )

  return (
    <section className="mb-8 group">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-8 w-2 bg-amber-500 rounded-full" />
        <h2 className="text-2xl font-black uppercase italic tracking-tighter">Warta Terkini</h2>
      </div>

      <Card className="overflow-hidden border-none shadow-2xl bg-white dark:bg-zinc-950 rounded-[2.5rem] relative">
        <div className="p-4">
          <div className="relative h-[250px] md:h-[400px] w-full overflow-hidden rounded-[2rem] bg-zinc-900">
            
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, filter: "blur(10px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 0.8 }}
                className="relative h-full w-full"
              >
                {/* Efek Kotak Pecah Saat Transisi */}
                <GridOverlay />
                
                <img
                  src={currentNews.image || "/placeholder.svg"}
                  alt={currentNews.title}
                  className="w-full h-full object-cover"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </motion.div>
            </AnimatePresence>

            <div className="absolute top-6 left-6 z-30">
              <span className="bg-amber-500 text-white px-5 py-2 rounded-full text-[10px] font-black uppercase shadow-xl">
                {currentNews.category?.name}
              </span>
            </div>

            {/* Tombol Navigasi Manual */}
            <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between z-30 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button onClick={prevSlide} className="rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-amber-500 h-12 w-12">
                <ChevronLeft />
              </Button>
              <Button onClick={nextSlide} className="rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-amber-500 h-12 w-12">
                <ChevronRight />
              </Button>
            </div>
          </div>
        </div>

        <CardContent className="px-8 md:px-12 py-8">
          <motion.div
            key={`text-${currentIndex}`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2 text-zinc-400 text-[10px] font-black uppercase mb-3">
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              <span>{new Date(currentNews.created_at).toLocaleDateString("id-ID")}</span>
            </div>

            <h3 className="text-xl md:text-4xl font-black mb-4 leading-tight text-zinc-900 dark:text-white uppercase italic">
              {currentNews.title}
            </h3>
            
            <p className="text-zinc-500 text-sm md:text-lg mb-8 line-clamp-2">
              {getExcerpt(currentNews.content)}
            </p>
          </motion.div>

          <div className="flex justify-between items-center border-t border-zinc-50 pt-6">
            <Button 
              onClick={() => onReadMore(currentNews.slug)}
              className="rounded-2xl bg-zinc-900 hover:bg-amber-500 text-white font-black uppercase text-[11px] h-14 px-10 transition-all shadow-xl"
            >
              Baca Selengkapnya <ArrowRight className="ml-2" />
            </Button>

            <div className="flex gap-2">
              {latestNews.map((_, i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === currentIndex ? "bg-amber-500 w-10" : "bg-zinc-200 w-2"}`} />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
