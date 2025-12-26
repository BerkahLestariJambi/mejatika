"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Calendar, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface NewsItem {
  id: string
  title: string
  slug: string
  excerpt: string
  image: string
  publishedAt: string
  category: {
    name: string
  }
}

// Tambahkan prop onReadMore untuk integrasi modal di HomePage
interface NewsSliderProps {
  onReadMore: (slug: string) => void
}

export function NewsSlider({ onReadMore }: NewsSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [latestNews, setLatestNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mengambil 5 berita terbaru
    fetch("https://backend.mejatika.com/api/news")
      .then((res) => res.json())
      .then((data) => {
        setLatestNews(data.slice(0, 5))
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

  if (loading) {
    return (
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4 border-l-4 border-primary pl-4">Berita Terbaru</h2>
        <Card className="overflow-hidden border-none shadow-md bg-card pt-6">
          <div className="px-6 md:px-10">
            <div className="h-[250px] md:h-[350px] bg-muted animate-pulse rounded-2xl" />
          </div>
          <CardContent className="p-6 md:p-10">
            <div className="h-4 bg-muted rounded w-1/4 mb-3 animate-pulse" />
            <div className="h-8 bg-muted rounded w-3/4 mb-4 animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-full animate-pulse" />
              <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
            </div>
          </CardContent>
        </Card>
      </section>
    )
  }

  if (latestNews.length === 0) return null

  const currentNews = latestNews[currentIndex]

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold mb-4 border-l-4 border-primary pl-4 text-foreground">
        Berita Terbaru
      </h2>
      
      <Card className="overflow-hidden border-none shadow-xl bg-card pt-6">
        {/* --- BAGIAN GAMBAR DENGAN BATAS KIRI-KANAN --- */}
        <div className="px-6 md:px-10 relative group">
          <div className="relative h-[250px] md:h-[380px] w-full overflow-hidden rounded-2xl shadow-lg ring-1 ring-border/50">
            <img
              src={currentNews.image || "/placeholder.svg"}
              alt={currentNews.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            
            {/* Overlay Gradient untuk teks di atas gambar (Opsional) */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />

            {/* Badge Kategori */}
            <div className="absolute top-4 left-4">
              <span className="bg-primary/90 backdrop-blur-md text-primary-foreground px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider shadow-xl">
                {currentNews.category.name}
              </span>
            </div>

            {/* Navigasi Panah (Hanya tampil di Desktop saat Hover) */}
            {latestNews.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* --- BAGIAN KONTEN TEKS --- */}
        <CardContent className="p-6 md:p-10">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="font-medium">
              {new Date(currentNews.publishedAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>

          <h3 className="text-2xl md:text-3xl font-extrabold mb-4 leading-tight tracking-tight text-balance text-foreground">
            {currentNews.title}
          </h3>
          
          <p className="text-muted-foreground mb-8 text-pretty leading-relaxed md:text-lg line-clamp-2 md:line-clamp-3">
            {currentNews.excerpt}
          </p>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <Button 
              size="lg" 
              onClick={() => onReadMore(currentNews.slug)}
              className="w-full md:w-auto rounded-full font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
            >
              Baca Selengkapnya
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            {/* Indikator Dots */}
            {latestNews.length > 1 && (
              <div className="flex gap-2 justify-center items-center">
                {latestNews.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex 
                        ? "bg-primary w-8" 
                        : "bg-primary/20 w-2 hover:bg-primary/40"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
