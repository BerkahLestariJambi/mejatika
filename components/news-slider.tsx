"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Calendar, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface NewsItem {
  id: string
  title: string
  slug: string
  content: string
  image: string
  created_at: string
  status: string
  category: { name: string }
}

export function NewsSlider({ onReadMore }: { onReadMore: (slug: string) => void }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [latestNews, setLatestNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("https://backend.mejatika.com/api/news?status=published")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          const filtered = json.data.filter((item: NewsItem) => {
            const isNotCerpen = !(item.category?.name || "").toLowerCase().includes("cerpen");
            const isPublished = item.status === 'published';
            return isNotCerpen && isPublished;
          })
          setLatestNews(filtered.slice(0, 5))
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const nextSlide = useCallback(() => {
    if (latestNews.length === 0) return
    setCurrentIndex((prev) => (prev + 1) % latestNews.length)
  }, [latestNews.length])

  const prevSlide = () => {
    if (latestNews.length === 0) return
    setCurrentIndex((prev) => (prev - 1 + latestNews.length) % latestNews.length)
  }

  useEffect(() => {
    if (latestNews.length === 0) return
    const interval = setInterval(nextSlide, 5000)
    return () => clearInterval(interval)
  }, [nextSlide, latestNews.length])

  if (loading) return (
    <div className="h-[200px] flex items-center justify-center bg-zinc-50 rounded-3xl border border-dashed border-zinc-200">
      <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
    </div>
  )

  if (latestNews.length === 0) return null
  const currentNews = latestNews[currentIndex]

  return (
    <section className="mb-6 group">
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <div className="h-5 w-1.5 bg-amber-500 rounded-full" />
          <h2 className="text-sm font-black uppercase tracking-widest text-zinc-800">Warta Terkini</h2>
        </div>
        <div className="flex gap-1.5">
          {latestNews.map((_, i) => (
            <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === currentIndex ? "bg-amber-500 w-6" : "bg-zinc-200 w-1.5"}`} />
          ))}
        </div>
      </div>

      <Card className="overflow-hidden border border-zinc-100 shadow-sm bg-white dark:bg-zinc-950 rounded-[1.5rem] relative group/card">
        <div className="flex flex-col md:flex-row items-stretch h-auto md:h-[220px]">
          
          {/* SISI GAMBAR - Lebih Kecil & Minimalis */}
          <div className="relative w-full md:w-[280px] h-[180px] md:h-full overflow-hidden shrink-0">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentIndex}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                src={currentNews.image || "/placeholder.svg"}
                alt={currentNews.title}
                className="w-full h-full object-cover"
              />
            </AnimatePresence>
            <div className="absolute top-3 left-3">
              <span className="bg-amber-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-tighter">
                {currentNews.category?.name}
              </span>
            </div>
          </div>

          {/* SISI KONTEN - Padat & Ringkas */}
          <div className="p-5 md:p-6 flex flex-col justify-between flex-grow">
            <motion.div
              key={`text-${currentIndex}`}
              initial={{ x: 10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-2 text-zinc-400 text-[9px] font-bold uppercase mb-2">
                <Calendar className="w-3 h-3 text-amber-500" />
                <span>{new Date(currentNews.created_at).toLocaleDateString("id-ID")}</span>
              </div>

              <h3 className="text-lg font-black mb-2 leading-tight text-zinc-900 dark:text-white uppercase line-clamp-2">
                {currentNews.title}
              </h3>
            </motion.div>

            <div className="flex items-center justify-between mt-4">
              <button 
                onClick={() => onReadMore(currentNews.slug)}
                className="flex items-center gap-2 text-zinc-900 hover:text-amber-500 transition-colors font-black uppercase text-[10px] tracking-tighter"
              >
                Baca Detail <ArrowRight className="w-3 h-3" />
              </button>

              <div className="flex gap-2">
                <Button onClick={prevSlide} variant="outline" size="icon" className="h-8 w-8 rounded-full border-zinc-100 hover:bg-amber-500 hover:text-white">
                  <ChevronLeft className="h-4 h-4" />
                </Button>
                <Button onClick={nextSlide} variant="outline" size="icon" className="h-8 w-8 rounded-full border-zinc-100 hover:bg-amber-500 hover:text-white">
                  <ChevronRight className="h-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </section>
  )
}
