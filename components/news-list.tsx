"use client"

import { useEffect, useState } from "react"
import { Calendar, ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

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

interface NewsListProps {
  onReadMore: (slug: string) => void
}

export function NewsList({ onReadMore }: NewsListProps) {
  const [previousNews, setPreviousNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("https://backend.mejatika.com/api/news")
      .then((res) => res.json())
      .then((data) => {
        // Mengambil berita ke-6 sampai ke-9
        // Pastikan data yang diambil adalah array
        const newsData = Array.isArray(data) ? data : data.data || [];
        setPreviousNews(newsData.slice(5, 9))
        setLoading(false)
      })
      .catch((error) => {
        console.error("Failed to load news:", error)
        setLoading(false)
      })
  }, [])

  // State Loading (Skeleton lebih ramping)
  if (loading) {
    return (
      <section className="mt-6 max-w-3xl mx-auto">
        <h2 className="text-lg font-black mb-4 border-l-4 border-amber-500 pl-3 uppercase tracking-wider text-zinc-800">Berita Sebelumnya</h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-zinc-100 animate-pulse rounded-xl w-full" />
          ))}
        </div>
      </section>
    )
  }

  if (previousNews.length === 0) return null

  return (
    <section className="mt-8 max-w-3xl mx-auto">
      <h2 className="text-lg font-black mb-5 border-l-4 border-amber-500 pl-3 uppercase tracking-widest text-zinc-800">
        Berita Sebelumnya
      </h2>
      
      <div className="space-y-4">
        {previousNews.map((news) => (
          <Card key={news.id} className="overflow-hidden group hover:shadow-md transition-all duration-300 border border-zinc-100 bg-white/80">
            <CardContent className="p-0">
              <div className="flex items-center p-3 gap-4">
                
                {/* GAMBAR LEBIH KECIL & KOTAK (64px - 80px) */}
                <div className="flex-shrink-0 w-20 h-20 md:w-24 md:h-24 overflow-hidden rounded-lg shadow-sm border border-zinc-100">
                  <img
                    src={news.image || "/placeholder.svg"}
                    alt={news.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => (e.currentTarget.src = "/placeholder.svg")}
                  />
                </div>

                {/* KONTEN LEBIH PADAT */}
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-amber-600 uppercase tracking-tighter mb-1">
                    <span className="bg-amber-50 px-1.5 py-0.5 rounded text-amber-700">{news.category.name}</span>
                    <span className="text-zinc-400 font-medium">•</span>
                    <span className="text-zinc-400 font-medium flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(news.publishedAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  {/* JUDUL LEBIH KECIL (text-sm ke text-base) */}
                  <h3 className="text-sm md:text-md font-bold text-zinc-900 group-hover:text-amber-600 transition-colors leading-tight line-clamp-2 mb-2">
                    {news.title}
                  </h3>

                  {/* TOMBOL BACA LEBIH MINI */}
                  <button 
                    onClick={() => onReadMore(news.slug)}
                    className="flex items-center text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-amber-600 transition-all group/btn"
                  >
                    Selengkapnya
                    <ArrowRight className="w-3 h-3 ml-1 transition-transform group-hover/btn:translate-x-1" />
                  </button>
                </div>

              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
