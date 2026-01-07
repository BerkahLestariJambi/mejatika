"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Loader2, ImageIcon, X, ChevronLeft, ChevronRight } from "lucide-react"

type GalleryItem = {
  id: number
  title: string
  description: string
  image: string
  category?: string
}

export default function GaleriPage() {
  const [gallery, setGallery] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  
  // State untuk Lightbox
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await fetch("https://backend.mejatika.com/api/galleries")
        const result = await res.json()
        setGallery(result.data || result)
      } catch (error) {
        console.error("Gagal memuat galeri:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchGallery()
  }, [])

  // Fungsi Navigasi Lightbox
  const openLightbox = (index: number) => setSelectedIndex(index)
  const closeLightbox = () => setSelectedIndex(null)
  
  const showNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % gallery.length)
    }
  }

  const showPrev = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + gallery.length) % gallery.length)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Galeri Foto</h1>
          <p className="text-muted-foreground">Dokumentasi kegiatan dan momen di MEJATIKA</p>
        </div>

        {loading ? (
          <div className="flex h-64 flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {gallery.map((item, index) => (
              <Card 
                key={item.id} 
                className="group cursor-pointer overflow-hidden border-none shadow-md"
                onClick={() => openLightbox(index)}
              >
                <CardContent className="p-0">
                  <div className="relative h-64 w-full overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center">
                       <span className="text-white font-medium border border-white px-4 py-2 rounded-full">Lihat Foto</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold line-clamp-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">{item.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* --- LIGHTBOX OVERLAY --- */}
        {selectedIndex !== null && (
          <div 
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 animate-in fade-in duration-300"
            onClick={closeLightbox}
          >
            {/* Tombol Close */}
            <button className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors">
              <X className="h-8 w-8" />
            </button>

            {/* Tombol Prev */}
            <button 
              onClick={showPrev}
              className="absolute left-4 p-2 text-white/50 hover:text-white transition-colors bg-white/10 rounded-full"
            >
              <ChevronLeft className="h-10 w-10" />
            </button>

            {/* Konten Gambar */}
            <div className="max-w-5xl w-full flex flex-col items-center gap-4" onClick={(e) => e.stopPropagation()}>
              <img 
                src={gallery[selectedIndex].image} 
                alt={gallery[selectedIndex].title}
                className="max-h-[80vh] object-contain shadow-2xl rounded-sm"
              />
              <div className="text-center text-white">
                <h2 className="text-xl font-bold">{gallery[selectedIndex].title}</h2>
                <p className="text-white/70">{gallery[selectedIndex].description}</p>
                <p className="text-xs text-white/40 mt-2">
                  {selectedIndex + 1} dari {gallery.length}
                </p>
              </div>
            </div>

            {/* Tombol Next */}
            <button 
              onClick={showNext}
              className="absolute right-4 p-2 text-white/50 hover:text-white transition-colors bg-white/10 rounded-full"
            >
              <ChevronRight className="h-10 w-10" />
            </button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
