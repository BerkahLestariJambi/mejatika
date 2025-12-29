"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, ArrowRight } from "lucide-react"
import Link from "next/link" // Import Link untuk navigasi

export default function BeritaPage() {
  const [news, setNews] = useState([])
  const [loadingList, setLoadingList] = useState(true)

  useEffect(() => {
    fetch("https://backend.mejatika.com/api/news")
      .then((res) => res.json())
      .then((data) => {
        setNews(data)
        setLoadingList(false)
      })
      .catch(() => setLoadingList(false))
  }, [])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight">Berita & Artikel</h1>
          <p className="text-muted-foreground mt-2">Update informasi terbaru dari MEJATIKA</p>
        </div>

        {loadingList ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {news.map((item: any) => (
              <Card key={item.id} className="overflow-hidden flex flex-col shadow-md hover:shadow-xl transition-all border-none bg-card pt-6">
                
                <div className="px-5"> 
                  <div className="relative h-52 w-full bg-muted rounded-xl overflow-hidden shadow-sm ring-1 ring-border/50">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </div>

                <CardContent className="p-6 flex flex-col flex-grow">
                  <h2 className="text-xl font-bold mb-3 line-clamp-2">{item.title}</h2>
                  <p className="text-muted-foreground text-sm line-clamp-3 mb-6 flex-grow">
                    {item.content}
                  </p>
                  
                  {/* PERBAIKAN: Navigasi langsung ke URL berita */}
                  <Link href={`/berita/${item.slug}`} className="w-full">
                    <button className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl transition-colors">
                      Baca Selengkapnya <ArrowRight className="h-4 w-4" />
                    </button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
