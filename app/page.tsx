"use client"

import { useState, useEffect } from "react"
import { Splash } from "@/components/splash"
import { Header } from "@/components/header"
import { Navigation } from "@/components/navigation"
import { NewsSlider } from "@/components/news-slider"
import { NewsList } from "@/components/news-list"
import { ScheduleSidebar } from "@/components/schedule-sidebar"
import { Footer } from "@/components/footer"
import { RunningText } from "@/components/running-text"

// Shadcn UI Components
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, Loader2 } from "lucide-react"

export default function HomePage() {
  const [showSplash, setShowSplash] = useState(true)
  
  // State untuk Kontrol Modal Popup
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [article, setArticle] = useState<any>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  // Timer untuk Splash Screen
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false)
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  // Mengambil data detail berita saat modal dipicu
  useEffect(() => {
    if (selectedSlug && isModalOpen) {
      setLoadingDetail(true)
      setArticle(null)
      fetch(`https://backend.mejatika.com/api/news/${selectedSlug}`)
        .then((res) => res.json())
        .then((data) => {
          setArticle(data)
          setLoadingDetail(false)
        })
        .catch((err) => {
          console.error("Gagal mengambil detail:", err)
          setLoadingDetail(false)
        })
    }
  }, [selectedSlug, isModalOpen])

  // Fungsi untuk membuka modal (dikirim ke NewsList)
  const handleOpenDetail = (slug: string) => {
    setSelectedSlug(slug)
    setIsModalOpen(true)
  }

  if (showSplash) {
    return <Splash />
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <Navigation />
      
      <main className="flex-grow container mx-auto px-4 py-6 lg:py-8">
        <RunningText />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2">
            {/* Jika NewsSlider juga butuh popup, kirim handleOpenDetail sebagai prop */}
            <NewsSlider onReadMore={handleOpenDetail} />
            
            {/* NewsList memicu modal popup melalui prop onReadMore */}
            <NewsList onReadMore={handleOpenDetail} />
          </div>
          
          <div className="lg:col-span-1">
            <ScheduleSidebar />
          </div>
        </div>
      </main>
      
      <Footer />

      {/* POPUP MODAL DETAIL BERITA */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden border-none shadow-2xl bg-card">
          <DialogHeader className="sr-only">
            <DialogTitle>{article?.title || "Detail Berita"}</DialogTitle>
          </DialogHeader>

          <ScrollArea className="h-full max-h-[90vh]">
            {loadingDetail ? (
              <div className="flex flex-col items-center justify-center p-24 gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse font-medium">Menyiapkan berita...</p>
              </div>
            ) : article && (
              <article className="py-8">
                
                {/* GAMBAR DENGAN BATAS (PADDING) KIRI-KANAN */}
                <div className="px-6 md:px-12">
                  <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-muted shadow-lg ring-1 ring-border">
                    <img 
                      src={article.image || "/placeholder.svg"} 
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      alt={article.title}
                      onError={(e) => (e.currentTarget.src = "/placeholder.svg")}
                    />
                  </div>
                </div>

                {/* KONTEN TEKS */}
                <div className="px-6 md:px-12 py-8">
                  <div className="flex items-center gap-2 mb-6">
                    <Badge variant="secondary" className="px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                      {article.category?.name || "Info Terkini"}
                    </Badge>
                  </div>

                  <h1 className="text-3xl md:text-4xl font-extrabold mb-6 leading-tight tracking-tight text-foreground">
                    {article.title}
                  </h1>
                  
                  <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-8 pb-6 border-b border-border/50">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <Calendar className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-medium">
                        {new Date(article.created_at || article.publishedAt).toLocaleDateString("id-ID", { 
                          day: 'numeric', month: 'long', year: 'numeric' 
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-medium">
                        {article.user?.name || article.author?.name || "Admin MEJATIKA"}
                      </span>
                    </div>
                  </div>

                  <div className="prose prose-lg dark:prose-invert max-w-none">
                    <div className="whitespace-pre-line leading-relaxed text-foreground/90 text-lg">
                      {article.content}
                    </div>
                  </div>
                </div>
              </article>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}
