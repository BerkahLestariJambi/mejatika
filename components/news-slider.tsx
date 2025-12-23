"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Calendar, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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

export function NewsSlider() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [latestNews, setLatestNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/news?limit=5")
      .then((res) => res.json())
      .then((data) => {
        setLatestNews(data)
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
        <h2 className="text-2xl font-bold mb-4">Berita Terbaru</h2>
        <Card className="overflow-hidden">
          <div className="h-[250px] md:h-[350px] bg-muted animate-pulse" />
          <CardContent className="p-6">
            <div className="h-4 bg-muted rounded w-1/4 mb-3 animate-pulse" />
            <div className="h-6 bg-muted rounded w-3/4 mb-3 animate-pulse" />
            <div className="h-4 bg-muted rounded w-full mb-2 animate-pulse" />
            <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
          </CardContent>
        </Card>
      </section>
    )
  }

  if (latestNews.length === 0) {
    return null
  }

  const currentNews = latestNews[currentIndex]

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Berita Terbaru</h2>
      <Card className="overflow-hidden">
        <div className="relative">
          <img
            src={currentNews.image || "/placeholder.svg"}
            alt={currentNews.title}
            className="w-full h-[250px] md:h-[350px] object-cover"
          />
          <div className="absolute top-4 left-4">
            <span className="bg-chart-1 text-white px-3 py-1 rounded-full text-sm font-semibold">
              {currentNews.category.name}
            </span>
          </div>
          {latestNews.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </>
          )}
        </div>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
            <Calendar className="w-4 h-4" />
            {new Date(currentNews.publishedAt).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>
          <h3 className="text-xl font-bold mb-3 text-balance">{currentNews.title}</h3>
          <p className="text-muted-foreground mb-4 text-pretty">{currentNews.excerpt}</p>
          <Link href={`/berita/${currentNews.slug}`}>
            <Button className="w-full md:w-auto">
              Baca Selengkapnya
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          {latestNews.length > 1 && (
            <div className="flex gap-2 mt-4 justify-center">
              {latestNews.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex ? "bg-primary w-8" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  )
}
