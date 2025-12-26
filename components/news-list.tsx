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

// Tambahkan Interface Props untuk menerima fungsi dari HomePage
interface NewsListProps {
  onReadMore: (slug: string) => void
}

export function NewsList({ onReadMore }: NewsListProps) {
  const [previousNews, setPreviousNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Pastikan URL fetch mengarah ke backend Laravel Anda
    fetch("https://backend.mejatika.com/api/news")
      .then((res) => res.json())
      .then((data) => {
        // Mengambil berita ke 6 sampai 9 seperti logika awal Anda
        setPreviousNews(data.slice(5, 9))
        setLoading(false)
      })
      .catch((error) => {
        console.error("Failed to load news:", error)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <section className="mt-8">
        <h2 className="text-2xl font-bold mb-4 border-l-4 border-primary pl-4">Berita Sebelumnya</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/3 h-[180px] bg-muted animate-pulse" />
                  <div className="md:w-2/3 p-4 md:p-6 space-y-3">
                    <div className="h-4 bg-muted rounded w-1/4 animate-pulse" />
                    <div className="h-6 bg-muted rounded w-3/4 animate-pulse" />
                    <div className="h-4 bg-muted rounded w-full animate-pulse" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    )
  }

  if (previousNews.length === 0) return null

  return (
    <section className="mt-8">
      <h2 className="text-2xl font-bold mb-4 border-l-4 border-primary pl-4">Berita Sebelumnya</h2>
      <div className="space-y-4">
        {previousNews.map((news) => (
          <Card key={news.id} className="overflow-hidden group hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3 relative overflow-hidden">
                  <img
                    src={news.image || "/placeholder.svg"}
                    alt={news.title}
                    className="w-full h-[180px] md:h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute top-3 left-3 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-semibold shadow-sm">
                    {news.category.name}
                  </span>
                </div>
                <div className="md:w-2/3 p-4 md:p-6">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(news.publishedAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                  <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors leading-tight">
                    {news.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {news.excerpt}
                  </p>
                  
                  {/* UBAH Link menjadi Button untuk memicu Modal Popup */}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onReadMore(news.slug)}
                    className="group/btn"
                  >
                    Baca Selengkapnya
                    <ArrowRight className="w-3 h-3 ml-2 transition-transform group-hover/btn:translate-x-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
