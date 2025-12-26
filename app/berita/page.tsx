"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { NewsDetailModal } from "@/components/NewsDetailModal"

export default function BeritaPage() {
  const [news, setNews] = useState([])
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    fetch("https://backend.mejatika.com/api/news")
      .then(res => res.json())
      .then(data => setNews(data))
  }, [])

  const handleReadMore = (slug: string) => {
    setSelectedSlug(slug)
    setIsOpen(true)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Berita Terbaru</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((item: any) => (
            <Card key={item.id} className="overflow-hidden">
              <img src={item.image} className="h-48 w-full object-cover" />
              <CardContent className="p-5">
                <h2 className="text-xl font-bold mb-3 line-clamp-2">{item.title}</h2>
                <Button onClick={() => handleReadMore(item.slug)} className="w-full">
                  Baca Selengkapnya <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Frame Detail Berita */}
        <NewsDetailModal 
          slug={selectedSlug} 
          isOpen={isOpen} 
          onClose={() => setIsOpen(false)} 
        />
      </main>
      <Footer />
    </div>
  )
}
