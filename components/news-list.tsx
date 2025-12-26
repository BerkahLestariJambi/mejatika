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
        setPreviousNews(data.slice(5, 9))
        setLoading(false)
      })
      .catch((error) => {
        console.error("Failed to load news:", error)
        setLoading(false)
      })
  }, [])

  // State Loading (Skeleton)
  if (loading) {
    return (
      <section className="mt-8">
        <h2 className="text-2xl font-bold mb-6 border-l-4 border-primary pl-4">Berita Sebelumnya</h2>
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden border-none shadow-sm">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row items-center py-4">
                  <div className="w-[90%] md:w-1/3 h-[160px] bg-muted animate-pulse rounded-xl mx-4" />
                  <div className="w-full md:w-2/3 p-4 md:p-6 space-y-3">
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
      <h2 className="text-2xl font-bold mb-6 border-l-4 border-primary pl-4 text-foreground">
        Berita Sebelumnya
      </h2>
      
      <div className="space-y-6">
        {previousNews.map((news) => (
          <Card key={news.id} className="overflow-hidden group hover:shadow-lg transition-all duration-300 border-none bg-card/50 backdrop-blur-sm">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row items-stretch md:items-center py-5 md:py-4">
                
                {/* BAGIAN GAMBAR DENGAN BATAS KIRI-KANAN */}
                <div className="px-5 md:px-4 md:w-1/3">
                  <div className="relative overflow-hidden rounded-xl aspect-video md:aspect-square lg:aspect-video shadow-sm ring-1 ring-border/50">
                    <img
                      src={news.image || "/placeholder.svg"}
                      alt={news.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => (e.currentTarget.src = "/placeholder.svg")}
                    />
                    <div className="absolute top-2 left-2">
                      <span className="bg-primary/90 backdrop-blur-md text-primary-foreground px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-lg">
                        {news.category.name}
                      </span>
                    </div>
                  </div>
                </div>

                {/* BAGIAN KONTEN */}
                <div className="md:w-2/3 p-5 md:p-6 flex flex-col justify-center">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs mb-3">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    <span className="font-medium">
                      {new Date(news.publishedAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <h3 className="text-lg md:text-xl font-bold mb-2 group-hover:text-primary transition-colors leading-snug">
                    {news.title}
                  </h3>

                  <p className="text-muted-foreground text-sm mb-5 line-clamp-2 leading-relaxed">
                    {news.excerpt}
                  </p>
                  
                  <div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onReadMore(news.slug)}
                      className="group/btn rounded-full px-5 hover:bg-primary hover:text-white transition-all border-primary/20"
                    >
                      Baca Selengkapnya
                      <ArrowRight className="w-3.5 h-3.5 ml-2 transition-transform group-hover/btn:translate-x-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
