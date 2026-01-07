"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Loader2, X, ChevronLeft, ChevronRight, Layers } from "lucide-react"

type GalleryItem = {
  id: number
  title: string
  description: string
  image: string | string[] // Bisa string tunggal atau array URL
  category?: string
}

export default function GaleriPage() {
  const [gallery, setGallery] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  
  // State untuk Lightbox
  const [selectedFolderIndex, setSelectedFolderIndex] = useState<number | null>(null)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)

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

  // Fungsi Helper untuk mendapatkan URL Gambar tunggal
  const getImageUrl = (imgData: string | string[], index = 0) => {
    if (Array.isArray(imgData)) {
      return imgData[index] || imgData[0]
    }
    return imgData
  }

  // Fungsi Navigasi Lightbox
  const openLightbox = (index: number) => {
    setSelectedFolderIndex(index)
    setCurrentPhotoIndex(0) // Mulai dari foto pertama di folder tersebut
  }

  const closeLightbox = () => setSelectedFolderIndex(null)
  
  const showNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (selectedFolderIndex !== null) {
      const currentFolder = gallery[selectedFolderIndex]
      const totalPhotos = Array.isArray(currentFolder.image) ? currentFolder.image.length : 1
      setCurrentPhotoIndex((currentPhotoIndex + 1) % totalPhotos)
    }
  }

  const showPrev = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (selectedFolderIndex !== null) {
      const currentFolder = gallery[selectedFolderIndex]
      const totalPhotos = Array.isArray(currentFolder.image) ? currentFolder.image.length : 1
      setCurrentPhotoIndex((currentPhotoIndex - 1 + totalPhotos) % totalPhotos)
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
            {gallery.map((item, index) => {
              const photoCount = Array.isArray(item.image) ? item.image.length : 1
              
              return (
                <Card 
                  key={item.id} 
                  className="group cursor-pointer overflow-hidden border-none shadow-md"
                  onClick={() => openLightbox(index)}
                >
                  <CardContent className="p-0">
                    <div className="relative h-64 w-full overflow-hidden bg-muted">
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Gambar+Error"
                        }}
                      />
                      
                      {/* Badge Jumlah Foto jika lebih dari 1 */}
                      {photoCount > 1 && (
                        <div className="absolute top-3 right-3 bg-black/60 text-white text-xs py-1 px-2 rounded-md flex items-center gap-1">
                          <Layers className="h-3 w-3" />
                          {photoCount} Foto
                        </div>
                      )}

                      <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center">
                         <span className="text-white font-medium border border-white px-4 py-2 rounded-full">Buka Galeri</span>
                      </div>
                    </div>
                    <div className="p-4">
                      {item.category && <Badge variant="outline" className="mb-2">{item.category}</Badge>}
                      <h3 className="font-bold line-clamp-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">{item.description}</p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* --- LIGHTBOX OVERLAY --- */}
        {selectedFolderIndex !== null && (
          <div 
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 animate-in fade-in duration-300"
            onClick={closeLightbox}
          >
            {/* Tombol Close */}
            <button className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-[110]">
              <X className="h-8 w-8" />
            </button>

            {/* Tombol Navigasi hanya muncul jika foto > 1 */}
            {(Array.isArray(gallery[selectedFolderIndex].image) && gallery[selectedFolderIndex].image.length > 1) && (
              <>
                <button 
                  onClick={showPrev}
                  className="absolute left-4 p-2 text-white/50 hover:text-white transition-colors bg-white/10 rounded-full z-[110]"
                >
                  <ChevronLeft className="h-10 w-10" />
                </button>

                <button 
                  onClick={showNext}
                  className="absolute right-4 p-2 text-white/50 hover:text-white transition-colors bg-white/10 rounded-full z-[110]"
                >
                  <ChevronRight className="h-10 w-10" />
                </button>
              </>
            )}

            {/* Konten Gambar */}
            <div className="max-w-5xl w-full flex flex-col items-center gap-4" onClick={(e) => e.stopPropagation()}>
              <div className="relative">
                <img 
                  src={getImageUrl(gallery[selectedFolderIndex].image, currentPhotoIndex)} 
                  alt={gallery[selectedFolderIndex].title}
                  className="max-h-[75vh] object-contain shadow-2xl rounded-sm transition-all duration-300"
                />
              </div>
              <div className="text-center text-white max-w-2xl">
                <h2 className="text-xl font-bold">{gallery[selectedFolderIndex].title}</h2>
                <p className="text-white/70 text-sm mt-1">{gallery[selectedFolderIndex].description}</p>
                <div className="inline-block bg-white/10 px-3 py-1 rounded-full text-xs text-white/60 mt-4">
                  Foto {currentPhotoIndex + 1} dari {Array.isArray(gallery[selectedFolderIndex].image) ? gallery[selectedFolderIndex].image.length : 1}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
