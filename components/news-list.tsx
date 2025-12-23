"use client"

import { useEffect, useState } from "react"
import { Calendar, ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

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

export function NewsList() {
  const [previousNews, setPreviousNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/news")
      .then((res) => res.json())
      .then((data) => {
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
      <section>
        <h2 className="text-2xl font-bold mb-4">Berita Sebelumnya</h2>
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

  if (previousNews.length === 0) {
    return null
  }

  return (
    <section>
      <h2 className="text-2xl font-bold mb-4">Berita Sebelumnya</h2>
      <div className="space-y-4">
        {previousNews.map((news) => (
          <Card key={news.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3 relative">
                  <img
                    src={news.image || "/placeholder.svg"}
                    alt={news.title}
                    className="w-full h-[180px] md:h-full object-cover"
                  />
                  <span className="absolute top-3 left-3 bg-chart-2 text-white px-2 py-1 rounded text-xs font-semibold">
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
                  <h3 className="text-lg font-bold mb-2 text-balance">{news.title}</h3>
                  <p className="text-muted-foreground text-sm mb-3 text-pretty">{news.excerpt}</p>
                  <Link href={`/berita/${news.slug}`}>
                    <Button variant="outline" size="sm">
                      Baca Selengkapnya
                      <ArrowRight className="w-3 h-3 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
