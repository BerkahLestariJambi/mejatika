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
// Impor komponen Dialog/Modal dari Shadcn UI
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, Loader2 } from "lucide-react"

export default function HomePage() {
  const [showSplash, setShowSplash] = useState(true)
  
  // State untuk Modal Popup
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [article, setArticle] = useState<any>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false)
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  // Fungsi untuk mengambil detail berita saat modal dibuka
  useEffect(() => {
    if (selectedSlug && isModalOpen) {
      setLoadingDetail(true)
      fetch(`https://backend.mejatika.com/api/news/${selectedSlug}`)
        .then((res) => res.json())
        .then((data) => {
          setArticle(data)
          setLoadingDetail(false)
        })
        .catch(() => setLoadingDetail(false))
    }
  }, [selectedSlug, isModalOpen])

  // Fungsi trigger modal yang akan dikirim ke NewsList
  const handleOpenDetail = (slug: string) => {
    setSelectedSlug(slug)
    setIsModalOpen(true)
  }

  if (showSplash) {
    return <Splash />
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Navigation />
      <main className="container mx-auto px-4 py-6 lg:py-8">
        <RunningText />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2">
            <NewsSlider />
            {/* Kirim fungsi handleOpenDetail ke NewsList sebagai props */}
            <NewsList onReadMore={handleOpenDetail} />
          </div>
          <div className="lg:col-span-1">
            <ScheduleSidebar />
          </div>
        </div>
      </main>
      <Footer />

      {/* POPUP MODAL FRAME */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden border-none shadow-2xl bg-card">
          <DialogHeader className="sr-only">
            <DialogTitle>{article?.title || "Detail Berita"}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-full max-h-[90vh]">
            {loadingDetail ? (
              <div className="flex flex-col items-center justify-center p-24 gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground">Menyiapkan berita...</p>
              </div>
            ) : article && (
              <article>
                <img 
                  src={article.image || "/placeholder.svg"} 
                  className="w-full aspect-video object-cover"
                  alt={article.title}
                />
                <div className="p-6 md:p-10">
                  <Badge className="mb-4">{article.category?.name || "Berita"}</Badge>
                  <h1 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">{article.title}</h1>
                  <div className="flex gap-4 text-sm text-muted-foreground mb-8 pb-4 border-b">
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4"/> {new Date(article.created_at).toLocaleDateString("id-ID")}</span>
                    <span className="flex items-center gap-1"><User className="w-4 h-4"/> {article.user?.name || "Admin"}</span>
                  </div>
                  <div className="prose prose-lg max-w-none whitespace-pre-line text-foreground/90">
                    {article.content}
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
