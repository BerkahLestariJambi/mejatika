"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, ArrowRight } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { NewsDetailModal } from "@/components/NewsDetailModal"

export default function BeritaPage() {
  const [news, setNews] = useState<any[]>([])
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Fetch data list berita
  useEffect(() => {
    fetch("https://backend.mejatika.com/api/news")
      .then((res) => res.json())
      .then((data) => setNews(data))
  }, [])

  const handleOpenDetail = (slug: string) => {
    setSelectedSlug(slug)
    setIsModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Berita & Artikel</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((item: any) => (
            <Card key={item.id} className="overflow-hidden flex flex-col hover:shadow-lg transition-shadow">
              <div className="relative h-48 w-full bg-muted">
                <img
                  src={item.image || "/placeholder.svg"}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-5 flex-grow flex flex-col">
                <h2 className="text-xl font-bold mb-3 line-clamp-2">{item.title}</h2>
                <p className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-grow">
                  {item.content}
                </p>
                <Button 
                  onClick={() => handleOpenDetail(item.slug)} 
                  className="w-full mt-auto"
                >
                  Baca Selengkapnya <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* INI ADALAH "FRAME" DETAIL NYA */}
        <NewsDetailModal 
          slug={selectedSlug}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </main>
      <Footer />
    </div>
  )
}
